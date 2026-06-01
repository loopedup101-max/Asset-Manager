import type { RequestHandler } from "express";
import { storage, getUserTier, creditLimitForTier } from "../storage";

/**
 * Meters the free "Ask Me Anything" chat. Free users get a small monthly
 * allowance and Basic users get their monthly credits; once exhausted the
 * request is rejected with 402 + code "usage_limit_reached" so the client can
 * prompt an upgrade. Pro, Business and the owner are unlimited and pass through.
 * Must run AFTER requireAuth (reads req.appUser).
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
    const limit = creditLimitForTier(tier);
    if (limit === null) {
      next();
      return;
    }
    const { consumed } = await storage.consumeBasicCredit(user.id, limit);
    if (!consumed) {
      const error =
        tier === "free"
          ? `You've used all ${limit} free messages this month. Get a plan to keep chatting and unlock every tool.`
          : `You've used all ${limit} of your monthly Basic credits. Upgrade to Pro for unlimited AI.`;
      res.status(402).json({
        error,
        code: "usage_limit_reached",
        usage: { used: limit, limit, remaining: 0 },
      });
      return;
    }
    next();
  } catch (err) {
    req.log.error({ err }, "Usage metering failed; allowing request");
    next();
  }
};
