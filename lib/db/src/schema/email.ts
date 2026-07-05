import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";

export const sentEmailsTable = pgTable("sent_emails", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  toAddress: text("to_address").notNull(),
  subject: text("subject").notNull(),
  body: text("body").notNull(),
  fromAddress: text("from_address"),
  gmailMessageId: text("gmail_message_id"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export type SentEmail = typeof sentEmailsTable.$inferSelect;
export type InsertSentEmail = typeof sentEmailsTable.$inferInsert;
