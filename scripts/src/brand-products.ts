import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "@resvg/resvg-js";
import type Stripe from "stripe";
import { getUncachableStripeClient } from "./stripeClient";

/**
 * Brand the Stripe hosted Checkout line items.
 *
 * Renders an on-brand badge PNG per plan (matching the cyberpunk pricing cards),
 * writes it into the web app's public/brand folder for reuse, uploads it to Stripe
 * Files, creates a public file link, and sets it as the product image so it shows
 * on the Checkout line item.
 *
 * Idempotent: re-running re-uploads fresh images and overwrites product.images.
 * Products are matched by metadata.tier so this works across environments.
 *
 * NOTE: the hosted Checkout *logo* and *accent color* are Dashboard-only
 * (Settings -> Branding) and cannot be set via the API for your own account.
 */

const __dirname = dirname(fileURLToPath(import.meta.url));
const PUBLIC_BRAND_DIR = resolve(
  __dirname,
  "../../artifacts/madetvceo-chat/public/brand",
);

type Tier = "basic" | "pro" | "business";

const ICONS: Record<Tier, string> = {
  basic:
    '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
  pro: '<path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z"/>',
  business:
    '<path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/><path d="M9 12H4s.55-3.03 2-4c1.62-1.08 5 0 5 0"/><path d="M12 15v5s3.03-.55 4-2c1.08-1.62 0-5 0-5"/>',
};

const BOLT =
  '<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>';

const PLANS: Record<Tier, { title: string; tagline: string }> = {
  basic: { title: "Basic", tagline: "For getting started" },
  pro: { title: "Pro", tagline: "For creators shipping fast" },
  business: { title: "Business", tagline: "For teams that scale" },
};

function badgeSvg(tier: Tier): string {
  const { title, tagline } = PLANS[tier];
  const icon = ICONS[tier];
  const S = 600;
  const iconScale = 5.0;
  const tileSize = 220;
  const tileX = (S - tileSize) / 2;
  const tileY = 120;
  const iconBox = 24 * iconScale;
  const iconX = tileX + (tileSize - iconBox) / 2;
  const iconY = tileY + (tileSize - iconBox) / 2;
  const grid = Array.from(
    { length: 14 },
    (_, i) =>
      `<line x1="${i * 44}" y1="0" x2="${i * 44}" y2="${S}"/><line x1="0" y1="${i * 44}" x2="${S}" y2="${i * 44}"/>`,
  ).join("");
  return `<svg width="${S}" height="${S}" viewBox="0 0 ${S} ${S}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="tile" x1="0" y1="0" x2="${S}" y2="${S}" gradientUnits="userSpaceOnUse"><stop stop-color="#7c3aed"/><stop offset="1" stop-color="#22d3ee"/></linearGradient>
    <radialGradient id="orb1" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#7c3aed" stop-opacity="0.55"/><stop offset="1" stop-color="#7c3aed" stop-opacity="0"/></radialGradient>
    <radialGradient id="orb2" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#22d3ee" stop-opacity="0.45"/><stop offset="1" stop-color="#22d3ee" stop-opacity="0"/></radialGradient>
    <linearGradient id="title" x1="0" y1="0" x2="${S}" y2="0" gradientUnits="userSpaceOnUse"><stop stop-color="#ffffff"/><stop offset="1" stop-color="#a5f3fc"/></linearGradient>
  </defs>
  <rect width="${S}" height="${S}" fill="#070711"/>
  <circle cx="80" cy="70" r="320" fill="url(#orb1)"/>
  <circle cx="540" cy="560" r="300" fill="url(#orb2)"/>
  <g stroke="#7c3aed" stroke-opacity="0.10" stroke-width="1">${grid}</g>
  <rect x="${tileX}" y="${tileY}" width="${tileSize}" height="${tileSize}" rx="48" fill="#0b1020"/>
  <rect x="${tileX}" y="${tileY}" width="${tileSize}" height="${tileSize}" rx="48" fill="url(#tile)" fill-opacity="0.22"/>
  <rect x="${tileX + 0.75}" y="${tileY + 0.75}" width="${tileSize - 1.5}" height="${tileSize - 1.5}" rx="47" fill="none" stroke="#ffffff" stroke-opacity="0.14" stroke-width="1.5"/>
  <g transform="translate(${iconX} ${iconY}) scale(${iconScale})" fill="none" stroke="#67e8f9" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${icon}</g>
  <text x="${S / 2}" y="430" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="64" fill="url(#title)">${title}</text>
  <text x="${S / 2}" y="470" text-anchor="middle" font-family="DejaVu Sans" font-size="24" fill="#94a3b8">${tagline}</text>
  <g transform="translate(${S / 2 - 118} 520)"><g transform="translate(0 -16) scale(1.15)" fill="#22d3ee" stroke="#22d3ee" stroke-linejoin="round">${BOLT}</g><text x="36" y="0" font-family="DejaVu Sans" font-weight="bold" font-size="28" letter-spacing="3" fill="#e2e8f0">MADE SUPER AI</text></g>
</svg>`;
}

function renderBadge(tier: Tier): Buffer {
  const svg = badgeSvg(tier);
  const png = new Resvg(svg, {
    fitTo: { mode: "width", value: 600 },
  })
    .render()
    .asPng();
  mkdirSync(PUBLIC_BRAND_DIR, { recursive: true });
  writeFileSync(resolve(PUBLIC_BRAND_DIR, `plan-${tier}.png`), png);
  return png;
}

async function brand() {
  const stripe = await getUncachableStripeClient();
  const products = await stripe.products.list({ active: true, limit: 100 });

  console.log("Branding Stripe Checkout product images...\n");

  for (const tier of Object.keys(PLANS) as Tier[]) {
    const product = products.data.find((p) => p.metadata?.tier === tier);
    if (!product) {
      console.warn(`  ! no product with metadata.tier=${tier}; skipping`);
      continue;
    }

    const png = renderBadge(tier);
    const file = await stripe.files.create({
      purpose: "product_image" as Stripe.FileCreateParams.Purpose,
      file: { data: png, name: `plan-${tier}.png`, type: "image/png" },
    });
    const link = await stripe.fileLinks.create({ file: file.id });
    if (!link.url) {
      throw new Error(`File link for ${tier} has no public URL`);
    }
    const updated = await stripe.products.update(product.id, {
      images: [link.url],
    });

    console.log(`${PLANS[tier].title} (${product.id})`);
    console.log(`  ↳ image: ${updated.images[0]}`);
  }

  console.log("\nDone. Product images set on Checkout line items.");
  console.log(
    "Reminder: set the Checkout logo + accent color in Stripe Dashboard → Settings → Branding (Dashboard-only).",
  );
}

brand()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error("Branding failed:", err instanceof Error ? err.message : err);
    process.exit(1);
  });
