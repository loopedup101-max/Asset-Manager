---
name: Video generation architecture
description: How the Video Studio actually produces video, and why it is client-side.
---

# Video generation in this app

Deployed/runtime code CANNOT generate video via OpenAI. The Replit OpenAI proxy supports
image generation (gpt-image-1) and TTS (gpt-audio), but NOT video. The agent-only sandbox
`generateVideo` tool exists only at build time and cannot be called by the running app.

**Therefore video is assembled CLIENT-SIDE** in `madetvceo-chat/src/lib/videoRenderer.ts`:
- Backend (`api-server/src/routes/video.ts`) only returns: a GPT script (JSON scenes),
  AI images (base64 PNG), and TTS narration (base64 MP3).
- The browser draws scenes onto a `<canvas>` (Ken Burns + text overlays), captures it with
  `canvas.captureStream()` + an `AudioContext` MediaStreamDestination for narration, and records
  the combined stream with `MediaRecorder` → downloadable webm.

**Why:** there is no server-side video render path available. Do not try to add one via the proxy.

## How to apply
- New video features extend the canvas renderer, not a server video API.
- The paid `/api/video/*` endpoints are unauthenticated (app has no auth), so they carry a simple
  in-memory per-IP rate limiter. Any new paid AI endpoint should do the same.
- `MediaRecorder`/`AudioContext`/`captureStream` tracks and `URL.createObjectURL` blobs must be
  explicitly cleaned up (try/finally in renderer; revoke on replace/remove/unmount in the page) —
  they leak large buffers otherwise.
