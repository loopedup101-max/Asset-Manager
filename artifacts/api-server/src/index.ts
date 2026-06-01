import { runMigrations } from "stripe-replit-sync";
import app from "./app";
import { getStripeSync } from "./stripeClient";
import { logger } from "./lib/logger";

/**
 * Initialize the Stripe schema + managed webhook and backfill data.
 * Non-fatal: if the Stripe integration isn't connected yet, the server still
 * boots and payment endpoints simply report "not configured" until it is.
 */
async function initStripe(): Promise<void> {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    logger.warn("DATABASE_URL not set; skipping Stripe initialization");
    return;
  }

  try {
    await runMigrations({ databaseUrl });

    const stripeSync = await getStripeSync();
    const webhookBaseUrl = `https://${process.env.REPLIT_DOMAINS?.split(",")[0]}`;
    const webhookResult = await stripeSync.findOrCreateManagedWebhook(
      `${webhookBaseUrl}/api/stripe/webhook`,
    );
    logger.info(
      { url: webhookResult?.url ?? "configured" },
      "Stripe managed webhook ready",
    );

    stripeSync
      .syncBackfill({ object: "all" })
      .then(() => logger.info("Stripe data synced"))
      .catch((err) => logger.error({ err }, "Stripe backfill failed"));
  } catch (err) {
    logger.warn(
      { err },
      "Stripe not initialized -- connect the Stripe integration to enable payments",
    );
  }
}

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

void initStripe().finally(() => {
  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
});
