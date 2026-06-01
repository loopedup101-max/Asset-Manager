import { db, usersTable, usageTable, type User } from "@workspace/db";
import { and, eq, sql, isNull } from "drizzle-orm";

/** Emails that always get free, unlimited access to the entire app. */
const HARDCODED_OWNER_EMAILS = ["bigfranknitty05@gmail.com"];

const OWNER_EMAILS = [
  ...HARDCODED_OWNER_EMAILS,
  ...(process.env.OWNER_EMAILS || "").split(","),
]
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

/** Monthly AI-action allowance for the Basic plan. Higher tiers are unlimited. */
export const BASIC_MONTHLY_LIMIT = 100;

/**
 * Free time-trial for signed-in users without a paid plan: a one-time window of
 * full "Ask Me Anything" chat access that starts on their first message. Every
 * other tool is paid. When the window elapses we prompt an upgrade. This is NOT
 * "credits" (credits come with a plan) — just a short free trial of the chat.
 */
export const FREE_TRIAL_MINUTES = 10;

/** Current usage period as "YYYY-MM" (UTC). Usage resets each calendar month. */
function currentPeriod(): string {
  const now = new Date();
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}`;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return OWNER_EMAILS.includes(email.toLowerCase());
}

/**
 * Storage: app users (Drizzle) + Stripe data synced into the `stripe.*` schema.
 * Stripe read methods tolerate a missing schema (returns empty) so the API
 * still works before the Stripe integration is connected.
 */
export class Storage {
  // ---- Stripe data (read from synced stripe.* tables) ----
  async getProduct(productId: string) {
    try {
      const result = await db.execute(
        sql`SELECT * FROM stripe.products WHERE id = ${productId}`,
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }

  async listProductsWithPrices(active = true, limit = 20, offset = 0) {
    try {
      const result = await db.execute(
        sql`
          WITH paginated_products AS (
            SELECT id, name, description, metadata, active
            FROM stripe.products
            WHERE active = ${active}
            ORDER BY id
            LIMIT ${limit} OFFSET ${offset}
          )
          SELECT
            p.id as product_id,
            p.name as product_name,
            p.description as product_description,
            p.active as product_active,
            p.metadata as product_metadata,
            pr.id as price_id,
            pr.unit_amount,
            pr.currency,
            pr.recurring,
            pr.active as price_active
          FROM paginated_products p
          LEFT JOIN stripe.prices pr ON pr.product = p.id AND pr.active = true
          ORDER BY p.id, pr.unit_amount
        `,
      );
      return result.rows;
    } catch {
      return [];
    }
  }

  async getPricesForProduct(productId: string) {
    try {
      const result = await db.execute(
        sql`SELECT * FROM stripe.prices WHERE product = ${productId} AND active = true`,
      );
      return result.rows;
    } catch {
      return [];
    }
  }

  async getSubscription(subscriptionId: string) {
    try {
      const result = await db.execute(
        sql`SELECT * FROM stripe.subscriptions WHERE id = ${subscriptionId}`,
      );
      return result.rows[0] || null;
    } catch {
      return null;
    }
  }

  /** The plan tier (from product metadata) for a subscription's first item. */
  async getSubscriptionTier(subscriptionId: string): Promise<string | null> {
    try {
      const result = await db.execute(
        sql`
          SELECT prod.metadata->>'tier' AS tier
          FROM stripe.subscription_items si
          JOIN stripe.prices pr ON pr.id = si.price
          JOIN stripe.products prod ON prod.id = pr.product
          WHERE si.subscription = ${subscriptionId}
          LIMIT 1
        `,
      );
      const row = result.rows[0] as { tier?: string | null } | undefined;
      return row?.tier ?? null;
    } catch {
      return null;
    }
  }

  // ---- Usage metering (Basic plan monthly allowance) ----
  async getUsageCount(userId: string): Promise<number> {
    const [row] = await db
      .select()
      .from(usageTable)
      .where(
        and(
          eq(usageTable.userId, userId),
          eq(usageTable.period, currentPeriod()),
        ),
      );
    return row?.count ?? 0;
  }

  /** Atomically record one AI action for the current period; returns new count. */
  async incrementUsage(userId: string): Promise<number> {
    const [row] = await db
      .insert(usageTable)
      .values({ userId, period: currentPeriod(), count: 1 })
      .onConflictDoUpdate({
        target: [usageTable.userId, usageTable.period],
        set: { count: sql`${usageTable.count} + 1`, updatedAt: new Date() },
      })
      .returning();
    return row.count;
  }

  /**
   * Atomically consume one credit IF the user is under `limit` for the current
   * period. Returns `{ consumed }` — false when the cap is already reached. This
   * is a single conditional upsert so concurrent requests cannot overshoot the
   * monthly cap (no check-then-increment race).
   */
  async consumeBasicCredit(
    userId: string,
    limit: number,
  ): Promise<{ consumed: boolean; count: number }> {
    const rows = await db
      .insert(usageTable)
      .values({ userId, period: currentPeriod(), count: 1 })
      .onConflictDoUpdate({
        target: [usageTable.userId, usageTable.period],
        set: { count: sql`${usageTable.count} + 1`, updatedAt: new Date() },
        setWhere: sql`${usageTable.count} < ${limit}`,
      })
      .returning();
    if (rows.length === 0) return { consumed: false, count: limit };
    return { consumed: true, count: rows[0].count };
  }

  // ---- App users ----
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db
      .select()
      .from(usersTable)
      .where(eq(usersTable.id, id));
    return user;
  }

  async getOrCreateUser(id: string, email: string | null): Promise<User> {
    const existing = await this.getUser(id);
    if (existing) {
      if (!existing.email && email) {
        const [updated] = await db
          .update(usersTable)
          .set({ email })
          .where(eq(usersTable.id, id))
          .returning();
        return updated;
      }
      return existing;
    }

    // Only configured/hardcoded owner emails get free, unlimited access.
    const role = isOwnerEmail(email) ? "owner" : "user";

    const [created] = await db
      .insert(usersTable)
      .values({ id, email, role })
      .onConflictDoNothing()
      .returning();
    if (created) return created;

    // Lost an insert race -- the row now exists.
    const after = await this.getUser(id);
    if (!after) throw new Error("Failed to provision user");
    return after;
  }

  async updateUserStripeInfo(
    userId: string,
    stripeInfo: { stripeCustomerId?: string; stripeSubscriptionId?: string },
  ): Promise<User | undefined> {
    const [user] = await db
      .update(usersTable)
      .set(stripeInfo)
      .where(eq(usersTable.id, userId))
      .returning();
    return user;
  }

  /**
   * Start the free time-trial clock on first use. Sets trialStartedAt = now only
   * if it is currently null (idempotent), and returns the effective start time.
   */
  async startTrial(userId: string): Promise<Date> {
    const [row] = await db
      .update(usersTable)
      .set({ trialStartedAt: new Date() })
      .where(and(eq(usersTable.id, userId), isNull(usersTable.trialStartedAt)))
      .returning();
    if (row?.trialStartedAt) return row.trialStartedAt;
    const existing = await this.getUser(userId);
    return existing?.trialStartedAt ?? new Date();
  }
}

export const storage = new Storage();

/**
 * Entitlement check: the owner is always free; everyone else needs an active
 * (or trialing) Stripe subscription to use the app.
 */
export async function userIsEntitled(user: User): Promise<boolean> {
  if (user.role === "owner" || isOwnerEmail(user.email)) return true;
  if (user.stripeSubscriptionId) {
    const sub = (await storage.getSubscription(user.stripeSubscriptionId)) as
      | { status?: string }
      | null;
    return sub?.status === "active" || sub?.status === "trialing";
  }
  return false;
}

export type PlanTier = "owner" | "business" | "pro" | "basic" | "free";

/**
 * The user's effective plan tier. Owner is always "owner"; active subscribers
 * map to their Stripe product's metadata.tier (defaulting to "pro" if the tier
 * metadata is missing/unknown). Everyone else — signed in without an active
 * subscription — is "free" (limited "Ask Me Anything" chat only).
 */
export async function getUserTier(user: User): Promise<PlanTier> {
  if (user.role === "owner" || isOwnerEmail(user.email)) return "owner";
  if (user.stripeSubscriptionId) {
    const sub = (await storage.getSubscription(user.stripeSubscriptionId)) as
      | { status?: string }
      | null;
    const active = sub?.status === "active" || sub?.status === "trialing";
    if (active) {
      const tier = await storage.getSubscriptionTier(user.stripeSubscriptionId);
      if (tier === "basic" || tier === "pro" || tier === "business") return tier;
      return "pro";
    }
  }
  return "free";
}

/**
 * Monthly metered allowance for a tier, or null when the tier is unlimited.
 * Free and Basic are metered; Pro, Business and the owner are unlimited.
 */
export function creditLimitForTier(tier: PlanTier): number | null {
  // Free is no longer count-metered — it uses a time-based trial (see
  // trialStatus / FREE_TRIAL_MINUTES). Basic is metered by monthly count;
  // Pro/Business/owner are unlimited.
  if (tier === "basic") return BASIC_MONTHLY_LIMIT;
  return null;
}

/**
 * Shared chat entitlement gate used by BOTH chat endpoints (streaming and the
 * legacy non-stream one) so the paywall can never be bypassed by hitting a
 * different route. For free users it starts the time-trial on first use and
 * blocks once the window elapses; for Basic it checks the monthly credit cap;
 * Pro/Business/owner are always allowed. This only CHECKS — Basic credits are
 * consumed by the caller after a real answer is produced.
 */
export async function checkChatGate(
  user: User,
): Promise<
  | { ok: true; tier: PlanTier; creditLimit: number | null }
  | { ok: false; status: number; body: Record<string, unknown> }
> {
  const tier = await getUserTier(user);

  if (tier === "free") {
    const startedAt = await storage.startTrial(user.id);
    const elapsedMs = Date.now() - startedAt.getTime();
    if (elapsedMs >= FREE_TRIAL_MINUTES * 60 * 1000) {
      return {
        ok: false,
        status: 402,
        body: {
          error: `Your ${FREE_TRIAL_MINUTES}-minute free trial is up. Get a plan to keep chatting and unlock every tool.`,
          code: "usage_limit_reached",
        },
      };
    }
  }

  const creditLimit = creditLimitForTier(tier);
  if (creditLimit !== null) {
    const used = await storage.getUsageCount(user.id);
    if (used >= creditLimit) {
      return {
        ok: false,
        status: 402,
        body: {
          error: `You've used all ${creditLimit} of your monthly Basic credits. Upgrade to Pro for unlimited AI.`,
          code: "usage_limit_reached",
          usage: { used: creditLimit, limit: creditLimit, remaining: 0 },
        },
      };
    }
  }

  return { ok: true, tier, creditLimit };
}

export type TrialStatus = {
  startedAt: string | null;
  totalSeconds: number;
  secondsRemaining: number;
  expired: boolean;
};

/**
 * Time-trial status for a free-tier user. Before the first message
 * (trialStartedAt null) the full window is shown but the clock is not running.
 */
export function trialStatus(user: User): TrialStatus {
  const totalSeconds = FREE_TRIAL_MINUTES * 60;
  if (!user.trialStartedAt) {
    return {
      startedAt: null,
      totalSeconds,
      secondsRemaining: totalSeconds,
      expired: false,
    };
  }
  const elapsed = Math.floor(
    (Date.now() - user.trialStartedAt.getTime()) / 1000,
  );
  const secondsRemaining = Math.max(0, totalSeconds - elapsed);
  return {
    startedAt: user.trialStartedAt.toISOString(),
    totalSeconds,
    secondsRemaining,
    expired: secondsRemaining <= 0,
  };
}
