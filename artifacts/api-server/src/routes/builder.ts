import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";

const router: IRouter = Router();

// Lightweight in-memory rate limiter to protect paid AI endpoints from abuse.
const RATE_LIMIT = 20;
const WINDOW_MS = 60_000;
const hits = new Map<string, { count: number; resetAt: number }>();

function rateLimit(req: Request, res: Response, next: NextFunction) {
  const key = req.ip ?? "unknown";
  const now = Date.now();
  const entry = hits.get(key);
  if (!entry || now > entry.resetAt) {
    hits.set(key, { count: 1, resetAt: now + WINDOW_MS });
    next();
    return;
  }
  if (entry.count >= RATE_LIMIT) {
    res.status(429).json({ error: "Too many requests. Please slow down and try again shortly." });
    return;
  }
  entry.count += 1;
  next();
}

setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (now > v.resetAt) hits.delete(k);
  }
}, WINDOW_MS).unref();

router.use("/builder", rateLimit);

const BuildBody = z.object({
  prompt: z.string().min(1).max(4000),
  currentHtml: z.string().max(200_000).optional(),
});

const SYSTEM_PROMPT = `You are an elite, world-class full-stack app builder AI. You generate COMPLETE, HIGH-END, production-quality web applications as a single self-contained HTML file — the kind of app a funded startup would proudly ship. Never produce a basic or toy version.

STRICT OUTPUT RULES:
- Output ONLY the raw HTML document. No explanations, no markdown, no code fences.
- Start with <!DOCTYPE html> and end with </html>.
- Everything must be in ONE file: inline <style> for CSS and inline <script> for JavaScript.
- The app must run immediately when opened in a browser with NO build step.
- You MAY use CDN links (e.g. Tailwind via https://cdn.tailwindcss.com, Google Fonts, Chart.js, animation libs) but NOTHING that requires a server or API key.
- Persist user data with localStorage when it makes sense (todo lists, notes, scores, settings).

HIGH-END QUALITY BAR (non-negotiable):
- Premium, modern design: thoughtful color palette, beautiful typography (use a Google Font), generous spacing, depth (shadows/gradients), smooth transitions and micro-interactions, hover/focus states.
- Fully responsive — looks great on mobile, tablet, and desktop.
- Genuinely functional and richly interactive — buttons work, forms validate, state updates live, data persists. NOT a static mockup.
- Complete the whole product: a game is fully playable with scoring; a dashboard has real interactive charts and data; a tool actually performs its task end-to-end.
- Polish details: loading/empty/error states, keyboard support where relevant, sensible defaults, helpful copy, and a clean header/footer.
- Accessibility: semantic HTML, labels, good contrast.

When given existing HTML plus a change request, return the FULL updated HTML document with the change applied — never a diff or partial snippet. Preserve everything else and keep the high-end quality.`;

router.post("/builder/app", async (req, res): Promise<void> => {
  const parsed = BuildBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { prompt, currentHtml } = parsed.data;

  const userContent = currentHtml
    ? `Here is the current app HTML:\n\n${currentHtml}\n\nApply this change and return the COMPLETE updated HTML document:\n${prompt}`
    : `Build this app:\n${prompt}`;

  // Stream the build as Server-Sent Events so the connection stays alive
  // (large apps can take a while) and the client can show live progress.
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders?.();

  const send = (event: string, data: unknown) => {
    res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
  };

  // Heartbeat keeps the connection and any intermediary proxies alive during
  // quiet periods (e.g. while the model is reasoning before emitting content).
  const heartbeat = setInterval(() => {
    if (!res.writableEnded) res.write(`: ping\n\n`);
  }, 10000);

  // Cancel the upstream generation if the client disconnects, so we don't keep
  // burning tokens for a response nobody is listening to.
  const ac = new AbortController();
  req.on("close", () => ac.abort());

  try {
    const stream = await openai.chat.completions.create(
      {
        model: "gpt-5.1",
        max_completion_tokens: 16000,
        reasoning_effort: "low",
        stream: true,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userContent },
        ],
      },
      { signal: ac.signal },
    );

    let raw = "";
    let lastPing = Date.now();
    for await (const chunk of stream) {
      if (res.writableEnded) break;
      const delta = chunk.choices[0]?.delta?.content ?? "";
      if (delta) {
        raw += delta;
        // Throttle progress events to keep payloads small.
        const now = Date.now();
        if (now - lastPing > 250) {
          send("progress", { chars: raw.length });
          lastPing = now;
        }
      }
    }

    // Client went away mid-stream — nothing more to do.
    if (res.writableEnded) return;

    // Strip accidental markdown fences if the model added them.
    let html = raw.trim();
    const fence = html.match(/^```(?:html)?\s*([\s\S]*?)\s*```$/i);
    if (fence) html = fence[1].trim();
    // Ensure we actually got a document.
    if (!/<html[\s>]/i.test(html)) {
      const start = html.indexOf("<!DOCTYPE");
      if (start > 0) html = html.slice(start);
    }
    if (!html || !/<\/html>/i.test(html)) {
      send("error", { error: "The AI did not return a complete app. Try rephrasing or simplifying." });
      res.end();
      return;
    }

    // Derive a friendly title from the document if present.
    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch?.[1]?.trim() || "Generated App";

    send("done", { html, title });
    res.end();
  } catch (err) {
    // Client disconnect / intentional abort — not an error worth reporting.
    if (ac.signal.aborted) return;
    req.log.error({ err }, "app build failed");
    if (!res.writableEnded) {
      send("error", { error: "Failed to build app. Please try again." });
      res.end();
    }
  } finally {
    clearInterval(heartbeat);
  }
});

export default router;
