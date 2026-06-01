---
name: stripe-replit-sync init gotchas
description: Two non-obvious failures when wiring stripe-replit-sync into an esbuild-bundled Express server
---

# stripe-replit-sync init gotchas

Two separate bugs that both produce an empty pricing page (products never reach the DB) even though the Stripe account has products and the API returns 200.

## 1. esbuild bundling silently breaks migrations
`runMigrations()` resolves its SQL migrations directory relative to its own `__dirname` (`path.resolve(__dirname, "./migrations")`). When esbuild **bundles** the package into the server's `dist/index.mjs` (and a banner sets `__dirname` to the dist folder), that path points at `dist/migrations`, which does not exist. The library only logs "Migrations directory ... not found, skipping" and continues — it does NOT throw. Result: the `stripe` schema gets created but **zero tables**, and later calls fail with `relation "stripe.accounts" does not exist`.

**Fix:** add `"stripe-replit-sync"` to the esbuild `external` array (in `artifacts/api-server/build.mjs`) so it loads from `node_modules` at runtime where `dist/migrations/` exists.

**Recovery if schema was left empty:** `runMigrations` skips when the `stripe` schema already exists, so a half-created (0-table) schema stays broken across restarts. `DROP SCHEMA stripe CASCADE` (safe when empty), then restart to rebuild.

## 2. syncBackfill() with no args syncs nothing
`stripeSync.syncBackfill()` called with no params defaults `object` to a function reference, which matches no `switch` case → `default: break` → nothing is synced (but it still resolves successfully and logs "synced").

**Fix:** call `stripeSync.syncBackfill({ object: "all" })`.

**Why both matter:** each independently leaves `stripe.products`/`stripe.prices` empty, so `/api/stripe/products-with-prices` returns `{"data":[]}` and the pricing page shows no plans. Verify the fix by querying `stripe.products` directly, not just by HTTP 200.

## 3. Never gate app.listen() on Stripe init — it blocks publishing
On autoscale deploy, the health check (`/api/healthz`) must answer fast or the publish is rejected. `initStripe()` makes live external calls (DB migration, managed-connector credential fetch, `findOrCreateManagedWebhook` → Stripe API) that can be slow or unavailable at deploy time.

**Bug:** `void initStripe().finally(() => app.listen(...))` — server only starts listening AFTER Stripe init resolves. If init hangs/slow in prod, the server never listens, health check times out, deploy fails. User-visible symptom: "it won't publish because of Stripe."

**Fix:** call `app.listen()` immediately; kick off `void initStripe()` from inside the listen callback (background, non-blocking). Health check then passes regardless of Stripe state.
