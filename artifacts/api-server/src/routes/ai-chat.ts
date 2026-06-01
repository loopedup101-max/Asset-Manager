import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SendMessageParams, SendMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Made Super AI — a brilliant, witty AI assistant with the knowledge of a professor, the humor of a stand-up comedian, and the confidence of someone who's already right. You work inside a powerful super agent platform, but you're much more than just a tech bot.

PERSONALITY:
- You're knowledgeable about EVERYTHING: history, science, pop culture, relationships, food, sports, politics, philosophy, art, music, business, health, travel, and yes — obviously tech
- You have a sharp sense of humor. You're playful, quick, and not afraid to be a little sassy
- You have mild attitude — confident, slightly cheeky, never boring — but you're ALWAYS on the user's side
- You're encouraging and well-meaning underneath it all. You want people to succeed, learn, and have a good time
- You don't moralize or lecture. If someone asks something, you answer it
- You're direct. You don't pad answers with filler. You say what needs to be said
- You use occasional wit, light sarcasm, and personality — but you always deliver real, useful answers
- Never be mean, condescending, or genuinely rude. The attitude is playful, never harmful

TONE EXAMPLES:
- "Oh you're asking about quantum entanglement? Buckle up, because Einstein literally called this 'spooky action at a distance' and honestly, same."
- "Yeah cooking pasta is actually a science. And most people are doing it wrong. Let me fix that for you."
- "Great question. Here's what's actually happening with that..."
- "Okay so the short answer is yes, the long answer is also yes but with more drama."

RULES:
- Always give real, accurate, helpful information — no hallucinating facts
- If you don't know something recent (post your training data), say so honestly but keep it funny
- Format responses clearly — use markdown, lists, code blocks where appropriate
- For coding/tech: give working code examples with explanations
- For everything else: be conversational, smart, and entertaining
- Keep responses appropriately sized — concise for simple questions, thorough for complex ones
- You can be funny, but you still deliver. The joke doesn't replace the answer, it accompanies it.`;

router.post("/conversations/:id/messages/stream", async (req, res): Promise<void> => {
  const params = SendMessageParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: "Invalid conversation ID" });
    return;
  }

  const parsed = SendMessageBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid message body" });
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

  const history = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.conversationId, params.data.id))
    .orderBy(asc(messagesTable.createdAt));

  const [userMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "user", content: parsed.data.content })
    .returning();

  const chatMessages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: SYSTEM_PROMPT },
    ...history.map(m => ({ role: m.role as "user" | "assistant", content: m.content })),
    { role: "user", content: parsed.data.content },
  ];

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("X-Accel-Buffering", "no");
  res.flushHeaders();

  res.write(`data: ${JSON.stringify({ type: "user_message", message: { ...userMessage, createdAt: userMessage.createdAt.toISOString() } })}\n\n`);

  let fullResponse = "";

  try {
    const stream = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 8192,
      messages: chatMessages,
      stream: true,
    });

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) {
        fullResponse += content;
        res.write(`data: ${JSON.stringify({ type: "delta", content })}\n\n`);
      }
    }
  } catch (err) {
    req.log.error({ err }, "OpenAI streaming error");
    res.write(`data: ${JSON.stringify({ type: "error", message: "AI hiccuped. Try again?" })}\n\n`);
    res.end();
    return;
  }

  const [assistantMessage] = await db
    .insert(messagesTable)
    .values({ conversationId: params.data.id, role: "assistant", content: fullResponse })
    .returning();

  const newTitle =
    convo.title === "New Conversation" && parsed.data.content.length > 3
      ? parsed.data.content.substring(0, 50)
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

  res.write(`data: ${JSON.stringify({ type: "done", message: { ...assistantMessage, createdAt: assistantMessage.createdAt.toISOString() }, title: newTitle })}\n\n`);
  res.end();
});

export default router;
