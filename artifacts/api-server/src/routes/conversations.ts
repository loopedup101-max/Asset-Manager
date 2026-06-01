import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import {
  CreateConversationBody,
  GetConversationParams,
  UpdateConversationParams,
  UpdateConversationBody,
  DeleteConversationParams,
  ListMessagesParams,
  SendMessageParams,
  SendMessageBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

const AI_RESPONSES = [
  "That's a great question! Let me think through that carefully. As an AI assistant, I can help you explore this topic from multiple angles.",
  "Thanks for sharing that with me. Based on what you've described, here are some thoughts and perspectives that might be helpful.",
  "Interesting point! I've analyzed your message and here's my take on it. Feel free to ask for clarification or dive deeper into any aspect.",
  "I understand what you're asking. Let me provide a comprehensive response that addresses the key aspects of your question.",
  "Great topic to explore! Here's a detailed breakdown of the key considerations and recommendations for your situation.",
  "I've processed your request carefully. Here's a structured response that should help you move forward with confidence.",
];

function getAIResponse(userMessage: string): string {
  const hash = userMessage.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = AI_RESPONSES[hash % AI_RESPONSES.length];
  return `${base}\n\n*Note: This is a demo AI response. Made Super AI Agent responses are illustrative only. Always verify important information with qualified professionals.*`;
}

router.get("/conversations", async (req, res): Promise<void> => {
  const conversations = await db
    .select()
    .from(conversationsTable)
    .orderBy(desc(conversationsTable.updatedAt));
  res.json(conversations.map(c => ({
    ...c,
    createdAt: c.createdAt.toISOString(),
    updatedAt: c.updatedAt.toISOString(),
  })));
});

router.post("/conversations", async (req, res): Promise<void> => {
  const parsed = CreateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .insert(conversationsTable)
    .values({ title: parsed.data.title })
    .returning();
  res.status(201).json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.get("/conversations/:id", async (req, res): Promise<void> => {
  const params = GetConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.patch("/conversations/:id", async (req, res): Promise<void> => {
  const params = UpdateConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = UpdateConversationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const [convo] = await db
    .update(conversationsTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(conversationsTable.id, params.data.id))
    .returning();
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.json({
    ...convo,
    createdAt: convo.createdAt.toISOString(),
    updatedAt: convo.updatedAt.toISOString(),
  });
});

router.delete("/conversations/:id", async (req, res): Promise<void> => {
  const params = DeleteConversationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  await db.delete(messagesTable).where(eq(messagesTable.conversationId, params.data.id));
  const [convo] = await db
    .delete(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id))
    .returning();
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  res.sendStatus(204);
});

router.get("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = ListMessagesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }
  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(messagesTable.createdAt);
  res.json(messages.map(m => ({
    ...m,
    createdAt: m.createdAt.toISOString(),
  })));
});

router.post("/conversations/:id/messages", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [convo] = await db
    .select()
    .from(conversationsTable)
    .where(eq(conversationsTable.id, params.data.id));
  if (!convo) {
    res.status(404).json({ error: "Conversation not found" });
    return;
  }

  const [userMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "user", content: parsed.data.content })
    .returning();

  const aiContent = getAIResponse(parsed.data.content);
  const [assistantMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "assistant", content: aiContent })
    .returning();

  const newTitle =
    convo.title === "New Conversation" && parsed.data.content.length > 3
      ? parsed.data.content.substring(0, 40)
      : convo.title;

  await db
    .update(conversationsTable)
    .set({
      lastMessage: parsed.data.content.substring(0, 100),
      messageCount: (convo.messageCount || 0) + 2,
      title: newTitle,
      updatedAt: new Date(),
    })
    .where(eq(conversationsTable.id, params.data.id));

  res.status(201).json({
    userMessage: { ...userMessage, createdAt: userMessage.createdAt.toISOString() },
    assistantMessage: { ...assistantMessage, createdAt: assistantMessage.createdAt.toISOString() },
  });
});

export default router;
