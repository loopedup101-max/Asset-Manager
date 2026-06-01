import {
  pgTable,
  serial,
  text,
  integer,
  timestamp,
  unique,
} from "drizzle-orm/pg-core";

/**
 * Per-user monthly AI usage counter. One row per user per billing period
 * ("YYYY-MM", UTC). Used to enforce the Basic plan's monthly action limit;
 * higher tiers and the owner are unlimited and never metered.
 */
export const usageTable = pgTable(
  "usage",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id").notNull(),
    period: text("period").notNull(),
    count: integer("count").notNull().default(0),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => ({
    userPeriod: unique("usage_user_period_unique").on(t.userId, t.period),
  }),
);

export type Usage = typeof usageTable.$inferSelect;
export type InsertUsage = typeof usageTable.$inferInsert;
