import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, socialAccountsTable, socialPostsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import {
  ConnectSocialAccountBody,
  DisconnectSocialAccountParams,
  CreateSocialPostBody,
  UpdateSocialPostParams,
  UpdateSocialPostBody,
  DeleteSocialPostParams,
  GenerateSocialContentBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const PLATFORM_LIMITS: Record<string, number> = {
  twitter: 280,
  instagram: 2200,
  linkedin: 3000,
  facebook: 500,
  youtube: 5000,
  tiktok: 2200,
};

const TONE_MAP: Record<string, string> = {
  professional: "authoritative and polished",
  casual: "friendly and conversational",
  energetic: "exciting and high-energy",
  educational: "informative and clear",
};

const CONTENT_TYPE_GUIDE: Record<string, string> = {
  video_script:
    "a short-form video script with clear timestamped sections (hook, intro, main content, call to action)",
  thread:
    "a numbered social thread (1/, 2/, 3/ …) of 5-8 connected posts that build on each other",
  caption: "a scroll-stopping caption with a strong opening line and relevant hashtags",
  post: "a single engaging social post",
};

// Real AI content generation via OpenAI. Returns the post copy plus a few
// strategy suggestions. Throws on failure so the route can report a clear error.
async function generateAIContent(
  topic: string,
  platform: string,
  contentType: string,
  tone: string,
): Promise<{ content: string; suggestions: string[] }> {
  const toneDesc = TONE_MAP[tone] || "engaging";
  const limit = PLATFORM_LIMITS[platform] || 500;
  const typeGuide = CONTENT_TYPE_GUIDE[contentType] || CONTENT_TYPE_GUIDE.post;

  const completion = await openai.chat.completions.create({
    model: "gpt-5.1",
    max_completion_tokens: 2048,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You are an elite social media strategist and copywriter. You write high-performing, original content tailored to each platform. Return ONLY valid JSON.`,
      },
      {
        role: "user",
        content: `Write ${typeGuide} for ${platform} about: "${topic}".
Tone: ${toneDesc}. Keep the content within ${limit} characters where the platform requires it.
Make it genuinely good, specific, and original — not generic filler. Use natural language, strong hooks, and platform-appropriate formatting and hashtags.

Return JSON in EXACTLY this shape:
{
  "content": "the full ready-to-post content",
  "suggestions": ["short actionable idea 1", "short actionable idea 2", "short actionable idea 3"]
}`,
      },
    ],
  });

  const raw = completion.choices[0]?.message?.content ?? "{}";
  const json = JSON.parse(raw) as { content?: string; suggestions?: unknown };
  const content = typeof json.content === "string" ? json.content.trim() : "";
  if (!content) throw new Error("Empty AI response");
  const suggestions = Array.isArray(json.suggestions)
    ? json.suggestions.filter((s): s is string => typeof s === "string").slice(0, 3)
    : [];
  return { content, suggestions };
}

router.get("/social/accounts", async (req, res) => {
  const accounts = await db.select().from(socialAccountsTable).orderBy(socialAccountsTable.createdAt);
  res.json(accounts.map(a => ({
    id: a.id,
    platform: a.platform,
    username: a.username,
    connected: a.connected,
    apiKey: a.apiKey ? `${a.apiKey.substring(0, 6)}...` : null,
    createdAt: a.createdAt.toISOString(),
  })));
});

router.post("/social/accounts", async (req, res) => {
  const body = ConnectSocialAccountBody.parse(req.body);

  const existing = await db.select().from(socialAccountsTable)
    .where(eq(socialAccountsTable.platform, body.platform));

  if (existing.length > 0) {
    const [updated] = await db.update(socialAccountsTable)
      .set({
        username: body.username,
        connected: true,
        apiKey: body.apiKey ?? null,
        apiSecret: body.apiSecret ?? null,
        accessToken: body.accessToken ?? null,
      })
      .where(eq(socialAccountsTable.platform, body.platform))
      .returning();
    res.status(201).json({
      id: updated.id,
      platform: updated.platform,
      username: updated.username,
      connected: updated.connected,
      apiKey: updated.apiKey ? `${updated.apiKey.substring(0, 6)}...` : null,
      createdAt: updated.createdAt.toISOString(),
    });
    return;
  }

  const [account] = await db.insert(socialAccountsTable).values({
    platform: body.platform,
    username: body.username,
    connected: true,
    apiKey: body.apiKey ?? null,
    apiSecret: body.apiSecret ?? null,
    accessToken: body.accessToken ?? null,
  }).returning();

  res.status(201).json({
    id: account.id,
    platform: account.platform,
    username: account.username,
    connected: account.connected,
    apiKey: account.apiKey ? `${account.apiKey.substring(0, 6)}...` : null,
    createdAt: account.createdAt.toISOString(),
  });
});

router.delete("/social/accounts/:id", async (req, res) => {
  const { id } = DisconnectSocialAccountParams.parse(req.params);
  await db.update(socialAccountsTable)
    .set({ connected: false })
    .where(eq(socialAccountsTable.id, Number(id)));
  res.status(204).send();
});

router.get("/social/posts", async (req, res) => {
  const posts = await db.select().from(socialPostsTable).orderBy(socialPostsTable.createdAt);
  res.json(posts.map(p => ({
    id: p.id,
    platform: p.platform,
    content: p.content,
    status: p.status,
    postType: p.postType,
    videoScript: p.videoScript,
    scheduledAt: p.scheduledAt?.toISOString() ?? null,
    publishedAt: p.publishedAt?.toISOString() ?? null,
    createdAt: p.createdAt.toISOString(),
  })));
});

router.post("/social/posts", async (req, res) => {
  const body = CreateSocialPostBody.parse(req.body);
  const [post] = await db.insert(socialPostsTable).values({
    platform: body.platform,
    content: body.content,
    status: body.status ?? "draft",
    postType: body.postType ?? "text",
    videoScript: body.videoScript ?? null,
    scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : null,
  }).returning();

  res.status(201).json({
    id: post.id,
    platform: post.platform,
    content: post.content,
    status: post.status,
    postType: post.postType,
    videoScript: post.videoScript,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.patch("/social/posts/:id", async (req, res) => {
  const { id } = UpdateSocialPostParams.parse(req.params);
  const body = UpdateSocialPostBody.parse(req.body);

  const updateData: Record<string, unknown> = {};
  if (body.content !== undefined) updateData.content = body.content;
  if (body.status !== undefined) updateData.status = body.status;
  if (body.scheduledAt !== undefined) updateData.scheduledAt = new Date(body.scheduledAt);

  const [post] = await db.update(socialPostsTable)
    .set(updateData)
    .where(eq(socialPostsTable.id, Number(id)))
    .returning();

  if (!post) {
    res.status(404).json({ error: "Post not found" });
    return;
  }

  res.json({
    id: post.id,
    platform: post.platform,
    content: post.content,
    status: post.status,
    postType: post.postType,
    videoScript: post.videoScript,
    scheduledAt: post.scheduledAt?.toISOString() ?? null,
    publishedAt: post.publishedAt?.toISOString() ?? null,
    createdAt: post.createdAt.toISOString(),
  });
});

router.delete("/social/posts/:id", async (req, res) => {
  const { id } = DeleteSocialPostParams.parse(req.params);
  await db.delete(socialPostsTable).where(eq(socialPostsTable.id, Number(id)));
  res.status(204).send();
});

router.post("/social/generate", async (req, res) => {
  const body = GenerateSocialContentBody.parse(req.body);
  try {
    const result = await generateAIContent(
      body.topic,
      body.platform,
      body.contentType ?? "post",
      body.tone ?? "professional",
    );
    res.json({
      content: result.content,
      platform: body.platform,
      contentType: body.contentType ?? "post",
      suggestions: result.suggestions,
    });
  } catch (err) {
    req.log.error({ err }, "social content generation failed");
    res.status(500).json({ error: "Failed to generate content. Please try again." });
  }
});

router.get("/social/stats", async (req, res) => {
  const [totals] = await db.select({
    totalPosts: count(),
    scheduled: sql<number>`SUM(CASE WHEN ${socialPostsTable.status} = 'scheduled' THEN 1 ELSE 0 END)`,
    published: sql<number>`SUM(CASE WHEN ${socialPostsTable.status} = 'published' THEN 1 ELSE 0 END)`,
  }).from(socialPostsTable);

  const [accountCount] = await db.select({ count: count() }).from(socialAccountsTable)
    .where(eq(socialAccountsTable.connected, true));

  const platformRows = await db.select({
    platform: socialPostsTable.platform,
    count: count(),
  }).from(socialPostsTable).groupBy(socialPostsTable.platform);

  res.json({
    totalPosts: Number(totals.totalPosts) || 0,
    scheduled: Number(totals.scheduled) || 0,
    published: Number(totals.published) || 0,
    connectedAccounts: Number(accountCount.count) || 0,
    platformBreakdown: platformRows.map(r => ({ platform: r.platform, count: Number(r.count) })),
  });
});

export default router;
