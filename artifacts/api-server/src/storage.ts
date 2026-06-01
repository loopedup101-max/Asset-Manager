import { db, usersTable, type User } from "@workspace/db";
import { eq, sql } from "drizzle-orm";

const OWNER_EMAILS = (process.env.OWNER_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

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

    // First registered user becomes the owner (free, never gated).
    const [{ count }] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(usersTable);
    const isFirstUser = Number(count) === 0;
    const role = isFirstUser || isOwnerEmail(email) ? "owner" : "user";

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
