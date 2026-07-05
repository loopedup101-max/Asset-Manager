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
