import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { z } from "zod";
import { openai } from "@workspace/integrations-openai-ai-server";
import { generateImageBuffer } from "@workspace/integrations-openai-ai-server/image";
import { textToSpeech } from "@workspace/integrations-openai-ai-server/audio";

const router: IRouter = Router();

// Lightweight in-memory rate limiter to protect paid AI endpoints from abuse.
// Fixed window per client IP across all /video/* endpoints.
const RATE_LIMIT = 30;
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

// Periodically clear stale entries to bound memory.
setInterval(() => {
  const now = Date.now();
  for (const [k, v] of hits) {
    if (now > v.resetAt) hits.delete(k);
  }
}, WINDOW_MS).unref();

router.use("/video", rateLimit);

const ScriptBody = z.object({
  topic: z.string().min(1).max(500),
  style: z.string().max(100).optional(),
  sceneCount: z.number().int().min(2).max(8).optional(),
  aspectRatio: z.enum(["16:9", "9:16"]).optional(),
});

const SceneSchema = z.object({
  title: z.string(),
  narration: z.string(),
  imagePrompt: z.string(),
  caption: z.string(),
});

router.post("/video/script", async (req, res): Promise<void> => {
  const parsed = ScriptBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  const { topic, style = "cinematic, modern", sceneCount = 5, aspectRatio = "16:9" } = parsed.data;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 4096,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content: `You are a professional video director and scriptwriter. You create engaging short-form video scripts broken into scenes. Return ONLY valid JSON.`,
        },
        {
          role: "user",
          content: `Create a ${sceneCount}-scene video about: "${topic}".
Visual style: ${style}. Aspect ratio: ${aspectRatio}.

Return JSON in EXACTLY this shape:
{
  "title": "catchy video title",
  "scenes": [
    {
      "title": "short on-screen heading (2-5 words)",
      "narration": "one or two sentences of voiceover narration for this scene, natural and engaging",
      "imagePrompt": "detailed visual description for an AI image generator — describe a single striking ${aspectRatio} image, ${style} style, no text in the image",
      "caption": "short caption text to overlay on screen (under 8 words)"
    }
  ]
}

Make narration flow naturally scene-to-scene like a real video. Keep it punchy and engaging.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw) as { title?: string; scenes?: unknown[] };
    const scenes = z.array(SceneSchema).safeParse(json.scenes);
    if (!scenes.success) {
      res.status(502).json({ error: "AI returned an invalid script. Try again." });
      return;
    }
    res.json({ title: json.title ?? topic, scenes: scenes.data });
  } catch (err) {
    req.log.error({ err }, "video script generation failed");
    res.status(500).json({ error: "Failed to generate video script" });
  }
});

const ImageBody = z.object({
  prompt: z.string().min(1).max(1000),
});

router.post("/video/image", async (req, res): Promise<void> => {
  const parsed = ImageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const buffer = await generateImageBuffer(parsed.data.prompt, "1024x1024");
    res.json({ image: `data:image/png;base64,${buffer.toString("base64")}` });
  } catch (err) {
    req.log.error({ err }, "video image generation failed");
    res.status(500).json({ error: "Failed to generate image" });
  }
});

const NarrationBody = z.object({
  text: z.string().min(1).max(2000),
  voice: z.enum(["alloy", "echo", "fable", "onyx", "nova", "shimmer"]).optional(),
});

router.post("/video/narration", async (req, res): Promise<void> => {
  const parsed = NarrationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid request body" });
    return;
  }
  try {
    const buffer = await textToSpeech(parsed.data.text, parsed.data.voice ?? "nova", "mp3");
    res.json({ audio: `data:audio/mp3;base64,${buffer.toString("base64")}` });
  } catch (err) {
    req.log.error({ err }, "video narration generation failed");
    res.status(500).json({ error: "Failed to generate narration" });
  }
});

export default router;
