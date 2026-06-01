import { Router, type IRouter, type Request } from "express";
import { storage, isOwnerEmail } from "../storage";
import { stripeService } from "../stripeService";
import { requireAuth } from "../middlewares/requireAuth";
import type { User } from "@workspace/db";

const router: IRouter = Router();

function publicOrigin(req: Request): string {
  const domain = process.env.REPLIT_DOMAINS?.split(",")[0]?.trim();
  if (domain) return `https://${domain}`;
  const proto =
    (req.headers["x-forwarded-proto"] as string | undefined) ??
    req.protocol ??
    "https";
  return `${proto}://${req.get("host")}`;
}

type Entitlement = {
  entitled: boolean;
  plan: "owner" | "paid" | null;
  status: string | null;
  subscription: unknown;
};

async function computeEntitlement(user: User): Promise<Entitlement> {
  if (user.role === "owner" || isOwnerEmail(user.email)) {
    return { entitled: true, plan: "owner", status: "owner", subscription: null };
  }
  if (user.stripeSubscriptionId) {
    const sub = (await storage.getSubscription(
      user.stripeSubscriptionId,
    )) as { status?: string } | null;
    const status = sub?.status ?? null;
    const entitled = status === "active" || status === "trialing";
    return { entitled, plan: entitled ? "paid" : null, status, subscription: sub };
  }
  return { entitled: false, plan: null, status: null, subscription: null };
}

// Public: list plans with prices
router.get("/stripe/products-with-prices", async (_req, res) => {
  const rows = (await storage.listProductsWithPrices()) as Array<
    Record<string, unknown>
  >;
  const map = new Map<string, Record<string, unknown>>();
  for (const row of rows) {
    const productId = row.product_id as string;
    if (!map.has(productId)) {
      map.set(productId, {
        id: productId,
        name: row.product_name,
        description: row.product_description,
        active: row.product_active,
        metadata: row.product_metadata,
        prices: [] as Array<Record<string, unknown>>,
      });
    }
    if (row.price_id) {
      (map.get(productId)!.prices as Array<Record<string, unknown>>).push({
        id: row.price_id,
        unit_amount: row.unit_amount,
        currency: row.currency,
        recurring: row.recurring,
      });
    }
  }
  res.json({ data: Array.from(map.values()) });
});

// Current user + entitlement
router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const entitlement = await computeEntitlement(user);
  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    ...entitlement,
  });
});

// Start a subscription checkout
router.post("/stripe/checkout", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const { priceId } = (req.body ?? {}) as { priceId?: string };
  if (!priceId || typeof priceId !== "string") {
    res.status(400).json({ error: "priceId is required" });
    return;
  }

  try {
    let customerId = user.stripeCustomerId;
    if (!customerId) {
      const customer = await stripeService.createCustomer(
        user.email ?? undefined,
        user.id,
      );
      await storage.updateUserStripeInfo(user.id, {
        stripeCustomerId: customer.id,
      });
      customerId = customer.id;
    }

    const origin = publicOrigin(req);
    const session = await stripeService.createCheckoutSession(
      customerId,
      priceId,
      `${origin}/account?checkout=success`,
      `${origin}/pricing?checkout=cancel`,
    );
    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Stripe checkout failed");
    res.status(500).json({ error: "Could not start checkout" });
  }
});

// Open the Stripe billing portal
router.post("/stripe/portal", requireAuth, async (req, res) => {
  const user = req.appUser!;
  if (!user.stripeCustomerId) {
    res.status(400).json({ error: "No billing account yet" });
    return;
  }
  try {
    const origin = publicOrigin(req);
    const session = await stripeService.createCustomerPortalSession(
      user.stripeCustomerId,
      `${origin}/account`,
    );
    res.json({ url: session.url });
  } catch (err) {
    req.log.error({ err }, "Stripe portal failed");
    res.status(500).json({ error: "Could not open billing portal" });
  }
});

export default router;
