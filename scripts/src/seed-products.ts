import { getUncachableStripeClient } from "./stripeClient";

interface PlanSeed {
  name: string;
  description: string;
  amount: number; // in cents
  tier: string;
}

const PLANS: PlanSeed[] = [
  {
    name: "Pro",
    description:
      "For individuals shipping real work — full access to AI chat, the App Builder, Video Studio, and the Social Hub.",
    amount: 2900,
    tier: "pro",
  },
  {
    name: "Business",
    description:
      "For teams that need more — everything in Pro with higher limits and priority generation.",
    amount: 7900,
    tier: "business",
  },
];

async function findExistingProduct(
  stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>,
  tier: string,
) {
  // Prefer metadata match; fall back to listing all and matching by metadata.
  const all = await stripe.products.list({ active: true, limit: 100 });
  return all.data.find((p) => p.metadata?.tier === tier);
}

async function ensurePrice(
  stripe: Awaited<ReturnType<typeof getUncachableStripeClient>>,
  productId: string,
  amount: number,
) {
  const prices = await stripe.prices.list({ product: productId, active: true, limit: 100 });
  const existing = prices.data.find(
    (pr) =>
      pr.unit_amount === amount &&
      pr.currency === "usd" &&
      pr.recurring?.interval === "month",
  );
  if (existing) {
    console.log(`  ↳ price already exists: ${existing.id} ($${amount / 100}/mo)`);
    return existing;
  }
  const price = await stripe.prices.create({
    product: productId,
    unit_amount: amount,
    currency: "usd",
    recurring: { interval: "month" },
  });
  console.log(`  ↳ created price: ${price.id} ($${amount / 100}/mo)`);
  return price;
}

async function seed() {
  const stripe = await getUncachableStripeClient();
  console.log("Seeding Stripe products (idempotent)...\n");

  for (const plan of PLANS) {
    console.log(`Plan: ${plan.name} ($${plan.amount / 100}/mo)`);
    let product = await findExistingProduct(stripe, plan.tier);

    if (product) {
      console.log(`  ↳ product already exists: ${product.id}`);
      // Keep description/metadata fresh.
      product = await stripe.products.update(product.id, {
        name: plan.name,
        description: plan.description,
        metadata: { tier: plan.tier },
      });
    } else {
      product = await stripe.products.create({
        name: plan.name,
        description: plan.description,
        metadata: { tier: plan.tier },
      });
      console.log(`  ↳ created product: ${product.id}`);
    }

    await ensurePrice(stripe, product.id, plan.amount);
    console.log("");
  }

  console.log("Done. Products and prices are in place.");
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Seeding failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
