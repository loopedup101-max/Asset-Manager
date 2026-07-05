// Real email sending via the Replit Gmail connector (@replit/connectors-sdk).
// Integration: "google-mail" connector (scope gmail.send / gmail.readonly).
// The SDK injects and refreshes OAuth tokens automatically — never cache tokens.
import { ReplitConnectors } from "@replit/connectors-sdk";

const connectors = new ReplitConnectors();

// Header values must never contain CR/LF — that would let a caller inject
// extra headers (e.g. a hidden Bcc). Guard here as defense in depth even
// though the route also validates.
function assertNoCrlf(label: string, value: string): void {
  if (/[\r\n]/.test(value)) {
    throw new Error(`Invalid ${label}: line breaks are not allowed`);
  }
}

function encodeMessage(
  from: string,
  to: string,
  subject: string,
  body: string,
): string {
  assertNoCrlf("from address", from);
  assertNoCrlf("recipient", to);
  assertNoCrlf("subject", subject);

  const headers = [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${subject}`,
    "MIME-Version: 1.0",
    'Content-Type: text/plain; charset="UTF-8"',
  ];
  const message = `${headers.join("\r\n")}\r\n\r\n${body}`;
  return Buffer.from(message, "utf-8").toString("base64url");
}

// Returns the connected Gmail address, or null if no account is connected.
export async function getConnectedEmail(): Promise<string | null> {
  try {
    const res = await connectors.proxy(
      "google-mail",
      "/gmail/v1/users/me/profile",
      { method: "GET" },
    );
    if (!res.ok) return null;
    const data = (await res.json()) as { emailAddress?: string };
    return data.emailAddress ?? null;
  } catch {
    return null;
  }
}

// Sends an email from the connected Gmail account. Throws on failure.
export async function sendGmail(opts: {
  to: string;
  subject: string;
  body: string;
}): Promise<{ id: string; from: string }> {
  const from = await getConnectedEmail();
  if (!from) throw new Error("Gmail account not connected");

  const raw = encodeMessage(from, opts.to, opts.subject, opts.body);
  const res = await connectors.proxy(
    "google-mail",
    "/gmail/v1/users/me/messages/send",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ raw }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Gmail send failed: ${res.status} ${text}`);
  }

  const data = (await res.json()) as { id?: string };
  return { id: data.id ?? "", from };
}

// ---------------------------------------------------------------------------
// Read-only inbox scanning for the Cleanup Assistant.
// The connected account only grants read + send scopes, so this NEVER deletes,
// archives, or modifies any message — it only reads metadata and hands the user
// Gmail deep-links + unsubscribe links to act on themselves.
// ---------------------------------------------------------------------------

const GMAIL_SEARCH_BASE = "https://mail.google.com/mail/u/0/#search/";

export function gmailSearchUrl(query: string): string {
  return GMAIL_SEARCH_BASE + encodeURIComponent(query);
}

// Accurate count of messages matching a Gmail search query. Gmail's
// resultSizeEstimate is unreliable, so we count real message IDs. We cap at 500
// (the API's page limit) and flag `capped` so the UI can show "500+" honestly
// rather than a wrong exact number.
const COUNT_CAP = 500;

async function countQuery(
  query: string,
): Promise<{ count: number; capped: boolean }> {
  const res = await connectors.proxy(
    "google-mail",
    `/gmail/v1/users/me/messages?maxResults=${COUNT_CAP}&q=${encodeURIComponent(query)}`,
    { method: "GET" },
  );
  if (!res.ok) return { count: 0, capped: false };
  const data = (await res.json()) as {
    messages?: { id: string }[];
    nextPageToken?: string;
  };
  return {
    count: (data.messages ?? []).length,
    capped: Boolean(data.nextPageToken),
  };
}

async function listMessageIds(query: string, max: number): Promise<string[]> {
  const res = await connectors.proxy(
    "google-mail",
    `/gmail/v1/users/me/messages?maxResults=${max}&q=${encodeURIComponent(query)}`,
    { method: "GET" },
  );
  if (!res.ok) return [];
  const data = (await res.json()) as { messages?: { id: string }[] };
  return (data.messages ?? []).map((m) => m.id);
}

interface MessageMeta {
  name: string;
  email: string;
  unsubscribeUrl: string | null;
}

function headerValue(
  headers: { name?: string; value?: string }[],
  name: string,
): string | undefined {
  return headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())
    ?.value;
}

function parseFrom(value: string | undefined): { name: string; email: string } {
  if (!value) return { name: "", email: "" };
  const match = value.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  if (match) {
    return { name: match[1].trim(), email: match[2].trim().toLowerCase() };
  }
  return { name: "", email: value.trim().toLowerCase() };
}

// List-Unsubscribe looks like: <https://...>, <mailto:...>. Prefer the http URL.
function parseUnsubscribe(value: string | undefined): string | null {
  if (!value) return null;
  const urls = [...value.matchAll(/<([^>]+)>/g)].map((m) => m[1].trim());
  const http = urls.find((u) => /^https?:\/\//i.test(u));
  if (http) return http;
  const mailto = urls.find((u) => /^mailto:/i.test(u));
  return mailto ?? null;
}

async function getMessageMeta(id: string): Promise<MessageMeta | null> {
  const res = await connectors.proxy(
    "google-mail",
    `/gmail/v1/users/me/messages/${id}?format=metadata&metadataHeaders=From&metadataHeaders=List-Unsubscribe`,
    { method: "GET" },
  );
  if (!res.ok) return null;
  const data = (await res.json()) as {
    payload?: { headers?: { name?: string; value?: string }[] };
  };
  const headers = data.payload?.headers ?? [];
  const { name, email } = parseFrom(headerValue(headers, "From"));
  if (!email) return null;
  return {
    name,
    email,
    unsubscribeUrl: parseUnsubscribe(headerValue(headers, "List-Unsubscribe")),
  };
}

async function mapWithConcurrency<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>,
): Promise<R[]> {
  const out: R[] = [];
  for (let i = 0; i < items.length; i += limit) {
    const chunk = items.slice(i, i + limit);
    out.push(...(await Promise.all(chunk.map(fn))));
  }
  return out;
}

export interface InboxCategory {
  key: string;
  label: string;
  count: number;
  capped: boolean;
  gmailUrl: string;
}

export interface InboxSender {
  name: string;
  email: string;
  count: number;
  unsubscribeUrl: string | null;
  gmailUrl: string;
}

export interface InboxScanResult {
  connected: boolean;
  emailAddress: string | null;
  scannedCount: number;
  categories: InboxCategory[];
  topSenders: InboxSender[];
}

const CATEGORY_DEFS: { key: string; label: string; query: string }[] = [
  { key: "unread", label: "Unread", query: "in:inbox is:unread" },
  { key: "promotions", label: "Promotions", query: "category:promotions" },
  { key: "social", label: "Social", query: "category:social" },
  { key: "updates", label: "Updates", query: "category:updates" },
  { key: "spam", label: "Spam", query: "in:spam" },
  { key: "large", label: "Large (5MB+)", query: "larger:5M" },
  { key: "old", label: "Older than 1 year", query: "in:inbox older_than:1y" },
];

// Scans the connected inbox (read-only) and returns cleanup insights: per-category
// counts and the highest-volume senders with unsubscribe links where available.
export async function scanInbox(): Promise<InboxScanResult> {
  const emailAddress = await getConnectedEmail();
  if (!emailAddress) {
    return {
      connected: false,
      emailAddress: null,
      scannedCount: 0,
      categories: [],
      topSenders: [],
    };
  }

  const categories: InboxCategory[] = await Promise.all(
    CATEGORY_DEFS.map(async (c) => {
      const { count, capped } = await countQuery(c.query);
      return {
        key: c.key,
        label: c.label,
        count,
        capped,
        gmailUrl: gmailSearchUrl(c.query),
      };
    }),
  );

  // Sample recent inbox messages to find the noisiest senders.
  const ids = await listMessageIds("in:inbox", 150);
  const metas = (await mapWithConcurrency(ids, 12, getMessageMeta)).filter(
    (m): m is MessageMeta => m !== null,
  );

  const bySender = new Map<
    string,
    { name: string; count: number; unsubscribeUrl: string | null }
  >();
  for (const m of metas) {
    const existing = bySender.get(m.email);
    if (existing) {
      existing.count += 1;
      if (!existing.unsubscribeUrl && m.unsubscribeUrl) {
        existing.unsubscribeUrl = m.unsubscribeUrl;
      }
      if (!existing.name && m.name) existing.name = m.name;
    } else {
      bySender.set(m.email, {
        name: m.name,
        count: 1,
        unsubscribeUrl: m.unsubscribeUrl,
      });
    }
  }

  const topSenders: InboxSender[] = [...bySender.entries()]
    .map(([email, v]) => ({
      email,
      name: v.name,
      count: v.count,
      unsubscribeUrl: v.unsubscribeUrl,
      gmailUrl: gmailSearchUrl(`from:${email}`),
    }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);

  return {
    connected: true,
    emailAddress,
    scannedCount: metas.length,
    categories,
    topSenders,
  };
}
