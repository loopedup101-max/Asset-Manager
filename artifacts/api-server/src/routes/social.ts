import { Router, type IRouter } from "express";
import { eq, count, sql } from "drizzle-orm";
import { db, socialAccountsTable, socialPostsTable } from "@workspace/db";
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

function generateAIContent(topic: string, platform: string, contentType: string, tone: string): { content: string; suggestions: string[] } {
  const toneMap: Record<string, string> = {
    professional: "authoritative and polished",
    casual: "friendly and conversational",
    energetic: "exciting and high-energy",
    educational: "informative and clear",
  };

  const toneDesc = toneMap[tone] || "engaging";
  const platformLimits: Record<string, number> = {
    twitter: 280,
    instagram: 2200,
    linkedin: 3000,
    facebook: 500,
    youtube: 5000,
    tiktok: 2200,
  };

  const limit = platformLimits[platform] || 500;

  let content = "";
  let suggestions: string[] = [];

  if (contentType === "video_script") {
    content = `[HOOK - 0:00-0:05]\nHey everyone! Today we're diving deep into ${topic}.\n\n[INTRO - 0:05-0:15]\nIf you've ever wondered about ${topic}, you're in the right place. I'm going to show you exactly how this works.\n\n[MAIN CONTENT - 0:15-1:30]\n1. First, let's talk about why ${topic} matters in today's world.\n2. Here are the top strategies that actually work...\n3. The biggest mistake people make with ${topic} is...\n4. Here's the step-by-step process I use...\n\n[CALL TO ACTION - 1:30-2:00]\nIf you found this valuable, smash that like button and subscribe for more content like this. Drop a comment below — what's your experience with ${topic}?\n\n#${topic.replace(/\s+/g, "")} #${platform}Creator`;
    suggestions = [
      `Start with a shocking statistic about ${topic} to hook viewers immediately`,
      `Use a "before and after" structure to show transformation with ${topic}`,
      `Interview format: ask 5 key questions about ${topic} and answer each one`,
    ];
  } else if (contentType === "thread") {
    content = `1/ ${topic} is changing everything. Here's what you need to know:\n\n2/ First, the context: most people don't realize how important ${topic} has become in the last year.\n\n3/ The key insight: ${topic} works because it solves a fundamental problem that everyone faces.\n\n4/ Here's what the data shows: early adopters of ${topic} are seeing 3x better results.\n\n5/ The framework I use:\n- Step 1: Start with the basics\n- Step 2: Build momentum\n- Step 3: Scale what works\n\n6/ The biggest mistake: jumping in without a plan. Take time to understand ${topic} first.\n\n7/ My recommendation: start small, learn fast, and iterate. ${topic} rewards consistency.\n\nRT if this was helpful. Follow for more insights like this.`;
    suggestions = [
      `Open your thread with a bold claim about ${topic} that challenges conventional wisdom`,
      `Use numbered data points (1/, 2/, 3/) to make your ${topic} thread easy to follow`,
      `End the thread with a controversial take on ${topic} to drive engagement`,
    ];
  } else if (contentType === "caption") {
    content = `Unlocking the power of ${topic} one step at a time.\n\nThe journey with ${topic} has taught me that consistency beats perfection every time. Whether you're just starting out or scaling up, these fundamentals never change.\n\nSave this post and come back to it when you need a reminder.\n\n#${topic.replace(/\s+/g, "")} #GrowthMindset #${platform}`;
    suggestions = [
      `Lead with a question about ${topic} to encourage comments`,
      `Share a personal story or failure related to ${topic} for authenticity`,
      `Use a "3 things I wish I knew about ${topic}" format`,
    ];
  } else {
    const baseContent = platform === "twitter"
      ? `${topic} is the most underrated skill right now.\n\nHere's what I've learned:\n- Start before you're ready\n- Stay consistent when it's hard\n- Document the process\n\nThe people winning with ${topic} aren't smarter — they just started earlier.`
      : `Sharing my thoughts on ${topic} today.\n\nAfter spending significant time exploring this space, I've come to realize that ${topic} is more than just a trend — it's a fundamental shift in how we approach this field.\n\nIf you're serious about ${topic}, here are the principles I live by:\n\n1. Always prioritize quality over quantity\n2. Build systems that scale\n3. Stay curious and keep learning\n\nWhat's your experience with ${topic}? I'd love to hear your perspective in the comments.\n\n#${topic.replace(/\s+/g, "")} #${platform}`;

    content = baseContent.length > limit ? baseContent.substring(0, limit - 3) + "..." : baseContent;
    suggestions = [
      `Ask your audience a question about ${topic} to boost engagement`,
      `Share a specific result or number related to ${topic} for credibility`,
      `Use a "controversial opinion" about ${topic} to spark discussion`,
    ];
  }

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
  const result = generateAIContent(body.topic, body.platform, body.contentType ?? "post", body.tone ?? "professional");
  res.json({
    content: result.content,
    platform: body.platform,
    contentType: body.contentType ?? "post",
    suggestions: result.suggestions,
  });
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
