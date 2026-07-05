import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, sentEmailsTable } from "@workspace/db";
import { openai } from "@workspace/integrations-openai-ai-server";
import { GenerateEmailBody, SendEmailBody } from "@workspace/api-zod";
import { getConnectedEmail, sendGmail } from "../lib/gmail";

const router: IRouter = Router();

const TONE_MAP: Record<string, string> = {
  professional: "professional and polished",
  casual: "casual and warm",
  friendly: "friendly and approachable",
  formal: "formal and respectful",
};

// Whether an email account is connected, and which address it sends from.
router.get("/email/status", async (_req, res) => {
  const from = await getConnectedEmail();
  res.json({ connected: from !== null, fromAddress: from });
});

// AI-draft an email (subject + body). Does not send.
router.post("/email/generate", async (req, res) => {
  const body = GenerateEmailBody.parse(req.body);
  const toneDesc = TONE_MAP[body.tone ?? "professional"] ?? "professional";

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-5.1",
      max_completion_tokens: 2048,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are an expert email writer. Return ONLY valid JSON with keys \"subject\" and \"body\".",
        },
        {
          role: "user",
          content: `Write a ${toneDesc} email for this request: "${body.prompt}".\nReturn JSON: {"subject": "...", "body": "..."}\nThe body must be ready to send: well-structured, natural, and free of placeholder brackets like [Name] unless the request truly requires them.`,
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    const json = JSON.parse(raw) as { subject?: unknown; body?: unknown };
    const subject = typeof json.subject === "string" ? json.subject : "";
    const draftBody = typeof json.body === "string" ? json.body : "";
    if (!draftBody) throw new Error("empty draft");
    res.json({ subject, body: draftBody });
  } catch (err) {
    req.log.error({ err }, "email generation failed");
    res
      .status(500)
      .json({ error: "Failed to draft the email. Please try again." });
  }
});

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// Actually send an email from the connected account and record it.
router.post("/email/send", async (req, res) => {
  const body = SendEmailBody.parse(req.body);

  const to = body.to.trim();
  const subject = body.subject.trim();

  // Reject anything that isn't a plausible single email address, or that
  // contains line breaks (which could inject extra email headers).
  if (!EMAIL_RE.test(to) || /[\r\n]/.test(subject)) {
    res.status(400).json({
      error: "Please enter one valid recipient email address and a subject without line breaks.",
    });
    return;
  }

  let result: { id: string; from: string };
  try {
    result = await sendGmail({
      to,
      subject,
      body: body.body,
    });
  } catch (err) {
    req.log.error({ err }, "email send failed");
    res.status(502).json({
      error:
        "Couldn't send the email. Make sure an email account is connected and the recipient address is valid.",
    });
    return;
  }

  const [row] = await db
    .insert(sentEmailsTable)
    .values({
      userId: req.appUser!.id,
      toAddress: to,
      subject,
      body: body.body,
      fromAddress: result.from,
      gmailMessageId: result.id,
    })
    .returning();

  res.status(201).json({
    id: row.id,
    toAddress: row.toAddress,
    subject: row.subject,
    body: row.body,
    fromAddress: row.fromAddress,
    createdAt: row.createdAt.toISOString(),
  });
});

// List emails this user has actually sent.
router.get("/email/sent", async (req, res) => {
  const rows = await db
    .select()
    .from(sentEmailsTable)
    .where(eq(sentEmailsTable.userId, req.appUser!.id))
    .orderBy(desc(sentEmailsTable.createdAt));

  res.json(
    rows.map((r) => ({
      id: r.id,
      toAddress: r.toAddress,
      subject: r.subject,
      body: r.body,
      fromAddress: r.fromAddress,
      createdAt: r.createdAt.toISOString(),
    })),
  );
});

export default router;
