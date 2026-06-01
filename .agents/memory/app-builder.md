---
name: App Builder feature
description: How the in-app AI builds downloadable web apps, and why the build endpoint streams.
---

# App Builder

The in-app "Super AI" can build real, working, single-file HTML web apps for users.

- Endpoint: `POST /api/builder/app` (api-server `routes/builder.ts`), body `{prompt, currentHtml?}`. Used by the `/builder` page in `madetvceo-chat`.
- It generates one self-contained HTML document (inline CSS/JS, CDN allowed, no server/API keys), shown in a sandboxed iframe with live preview + download.

## Why it streams (SSE)
**A full high-end app generation takes ~120–180s** (gpt-5.1, large output). A plain blocking JSON response gets cut off by client/proxy timeouts.
**How to apply:** the route streams Server-Sent Events (`progress`/`done`/`error`) so the connection stays alive; the client accumulates and renders the `done` payload. Keep `reasoning_effort: "low"` and bounded `max_completion_tokens` to keep build time sane. Includes a 10s `: ping` heartbeat and aborts the upstream OpenAI stream on client disconnect (`req.on("close")`).

## Verification gotcha
You **cannot** verify a full build with the `bash` tool (2-min cap) or a single `curl --max-time` — generation outlasts both. Use the `code_execution` sandbox with `fetch` + stream reader, but even that can interrupt near ~2min. A confirmed good run produced a complete ~38k-char document with valid `<!doctype>`.

## iframe preview tradeoff
Preview iframe keeps `sandbox="allow-scripts allow-same-origin"` on purpose: generated apps rely on `localStorage`, which breaks under an opaque origin. Accepted because content is the user's own AI-generated code shown only to that same user.
