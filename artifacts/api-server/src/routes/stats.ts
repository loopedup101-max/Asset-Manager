import { Router, type IRouter } from "express";
import { desc, sql, count } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/stats/summary", async (req, res): Promise<void> => {
  const [convosResult] = await db
    .select({ total: count() })
    .from(conversationsTable);

  const [msgsResult] = await db
    .select({ total: count() })
    .from(messagesTable);

  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  const [todayResult] = await db
    .select({ total: count() })
    .from(messagesTable)
    .where(sql`${messagesTable.createdAt} >= ${todayStart}`);

  const recent = await db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.updatedAt))
    .limit(5);

  res.json({
    totalConversations: convosResult.total,
    totalMessages: msgsResult.total,
    todayMessages: todayResult.total,
    recentConversations: recent.map(c => ({
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    })),
  });
});

export default router;
