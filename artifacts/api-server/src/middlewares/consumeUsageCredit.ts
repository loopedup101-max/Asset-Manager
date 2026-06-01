import type { RequestHandler } from "express";
import { storage, getUserTier, BASIC_MONTHLY_LIMIT } from "../storage";

/**
 * Meters AI actions for the Basic plan. Owner and higher tiers (Pro, Business)
 * are unlimited and pass through untouched. For Basic users, each AI action
 * consumes one monthly credit; once the allowance is exhausted the request is
 * rejected with 402 + code "usage_limit_reached" so the client can prompt an
 * upgrade. Must run AFTER requireAuth + requireEntitlement (reads req.appUser).
 *
 * Fails open: if metering itself errors we allow the action rather than block a
 * paying user.
 */
export const consumeUsageCredit: RequestHandler = async (req, res, next) => {
  const user = req.appUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const tier = await getUserTier(user);
    if (tier !== "basic") {
      next();
      return;
    }
    const { consumed } = await storage.consumeBasicCredit(
      user.id,
      BASIC_MONTHLY_LIMIT,
    );
    if (!consumed) {
      res.status(402).json({
        error: `You've used all ${BASIC_MONTHLY_LIMIT} of your monthly Basic credits. Upgrade to Pro for unlimited AI.`,
        code: "usage_limit_reached",
        usage: {
          used: BASIC_MONTHLY_LIMIT,
          limit: BASIC_MONTHLY_LIMIT,
          remaining: 0,
        },
      });
      return;
    }
    next();
  } catch (err) {
    req.log.error({ err }, "Usage metering failed; allowing request");
    next();
  }
};
