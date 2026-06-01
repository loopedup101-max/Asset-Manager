import { Router, type IRouter, type Request } from "express";
import {
  storage,
  isOwnerEmail,
  getUserTier,
  creditLimitForTier,
} from "../storage";
import { stripeService } from "../stripeService";
import { getUncachableStripeClient } from "../stripeClient";
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

// Public: list active plans, each with its single default price.
// Reads straight from Stripe (source of truth) and uses each product's
// default_price, so archived/duplicate price rows in the synced DB can never
// surface stale or wrong amounts on the pricing page.
router.get("/stripe/products-with-prices", async (req, res) => {
  try {
    const stripe = await getUncachableStripeClient();
    const products = await stripe.products.list({
      active: true,
      limit: 100,
      expand: ["data.default_price"],
    });

    const data = products.data
      .map((p) => {
        const dp = p.default_price;
        const price =
          dp && typeof dp === "object" && dp.active
            ? {
                id: dp.id,
                unit_amount: dp.unit_amount,
                currency: dp.currency,
                recurring: dp.recurring,
              }
            : null;
        return {
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          metadata: p.metadata,
          prices: price ? [price] : [],
        };
      })
      .filter((p) => p.prices.length > 0)
      .sort(
        (a, b) =>
          (a.prices[0]!.unit_amount ?? 0) - (b.prices[0]!.unit_amount ?? 0),
      );

    res.json({ data });
  } catch (err) {
    req.log.error({ err }, "Failed to list products with prices");
    res.status(503).json({ error: "Could not load plans", data: [] });
  }
});

// Current user + entitlement
router.get("/me", requireAuth, async (req, res) => {
  const user = req.appUser!;
  const entitlement = await computeEntitlement(user);
  const tier = await getUserTier(user);

  // Free and Basic tiers are metered; Pro/Business/owner are unlimited.
  const limit = creditLimitForTier(tier);
  let usage: { used: number; limit: number; remaining: number; unlimited: boolean };
  if (limit !== null) {
    const used = await storage.getUsageCount(user.id);
    usage = {
      used,
      limit,
      remaining: Math.max(0, limit - used),
      unlimited: false,
    };
  } else {
    usage = { used: 0, limit: 0, remaining: 0, unlimited: true };
  }

  res.json({
    user: { id: user.id, email: user.email, role: user.role },
    ...entitlement,
    tier,
    usage,
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
