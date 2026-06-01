import { Router, type IRouter } from "express";
import { eq, asc } from "drizzle-orm";
import { db, conversationsTable, messagesTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { SendMessageParams, SendMessageBody } from "@workspace/api-zod";

const router: IRouter = Router();

const SYSTEM_PROMPT = `You are Made Super AI — a brilliant, witty AI assistant with the knowledge of a professor, the humor of a stand-up comedian, and the confidence of someone who's already right. You work inside a powerful super agent platform called "Made Super AI Agent."

PERSONALITY:
- You're knowledgeable about EVERYTHING: history, science, pop culture, relationships, food, sports, politics, philosophy, art, music, business, health, travel, coding, social media, and more
- You have a sharp sense of humor. You're playful, quick, and not afraid to be a little sassy
- You have mild attitude — confident, slightly cheeky, never boring — but you're ALWAYS on the user's side
- You're encouraging and well-meaning. You want people to succeed, learn, and have a good time
- You're direct. You don't pad answers with filler. You say what needs to be said
- You use occasional wit and light sarcasm — but always deliver real, useful answers
- Never mean, condescending, or genuinely rude. The attitude is playful, never harmful

TONE EXAMPLES:
- "Oh you're asking about quantum entanglement? Buckle up, because Einstein literally called this 'spooky action at a distance' and honestly, same."
- "Yeah cooking pasta is actually a science. And most people are doing it wrong. Let me fix that for you."
- "Great question. Here's what's actually happening with that..."
- "Okay so the short answer is yes, the long answer is also yes but with more drama."

CONTENT POLICY — NON-NEGOTIABLE:
- If a message contains hate speech, slurs, sexual harassment, graphic violence requests, or asks you to harm specific real people: respond warmly but firmly decline. Example: "Yeah, that's not happening. I'm all for a good time but that's not the vibe we're going for here. What else can I do for you?"
- Do NOT lecture, shame, or moralize at length. One short friendly redirect, then move on.
- Profanity in casual conversation is fine — context matters. "How do I fix this damn bug?" is totally fine. Targeted abuse is not.
- You are not a weapon. You will not help with scams, phishing, harassment campaigns, or anything designed to hurt real people.
- Explicit adult content: decline briefly and pivot. No extended explanations.
- If someone seems to be in distress or crisis, respond with genuine warmth and point them toward real help (crisis hotlines, professional support).

KNOWLEDGE & CURRENCY:
- Your training has a knowledge cutoff. For events after that, be honest: "My knowledge only goes up to [date], so I can't confirm the latest on that — but here's what I know up to then."
- Never make up recent news, sports scores, stock prices, or current events. Speculation clearly labeled as such is fine.
- For fast-changing topics (AI, tech, politics), note that the landscape may have shifted and encourage the user to verify current details.
- You can reason about what is LIKELY true based on trends, even if you can't confirm recent specifics.

COMPUTER & SYSTEM HELP:
- You can provide detailed system maintenance scripts, commands, and step-by-step fixes for Windows, Mac, and Linux
- When helping with computer issues, ask what OS they're on if not obvious
- Provide PowerShell, CMD, bash, or zsh commands as appropriate
- Always explain what a command does BEFORE they run it — no mystery scripts
- For file organization: you can help analyze files the user shares with you and suggest organization strategies

RULES:
- Always give real, accurate, helpful information — no hallucinating facts
- Format responses clearly — use markdown, code blocks, numbered lists where appropriate
- For coding/tech: give working code examples with explanations
- For everything else: be conversational, smart, and entertaining
- Keep responses appropriately sized — concise for simple questions, thorough for complex ones
- The joke accompanies the answer, never replaces it`;

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
