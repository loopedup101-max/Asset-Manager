---
name: Stripe hosted Checkout branding & product images
description: What can vs cannot be set via the Stripe API when branding the hosted Checkout, and the price-change constraint
---

# Stripe hosted Checkout branding & product images

Branding the **hosted** Checkout splits into API-settable vs Dashboard-only.

## Settable via API
- **Product line-item images** — `product.images = [url]`. Host the image on Stripe
  itself (Files API + file link) so the URL is stable across dev/prod and not tied
  to the app domain. Committed implementation: `scripts/src/brand-products.ts`
  (matches products by `metadata.tier`, idempotent).

## Dashboard-only (do NOT promise an API fix)
- The Checkout **logo/icon** and **accent/primary color** live in
  Settings → Branding. Updating them via `accounts.update` on your *own* account
  throws `StripePermissionError` ("you may only use it on connected accounts").
  Deliver ready-to-upload PNGs + exact hex values instead.

## Price changes
Stripe prices are immutable. Create a new price, set it as `default_price`, archive
the old one (`active:false`). The pricing read joins only active prices, so the new
one surfaces after the next sync. **Keep `scripts/src/seed-products.ts` amounts in
lockstep** or a re-seed recreates the old price.

## Rendering brand PNGs
Use `@resvg/resvg-js` (ImageMagick's SVG support is poor). Only DejaVu fonts are
installed — use `font-family="DejaVu Sans"` and size the viewBox to the text to
avoid clipping.
