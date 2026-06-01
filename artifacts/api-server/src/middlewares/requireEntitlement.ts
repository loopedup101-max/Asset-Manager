import type { RequestHandler } from "express";
import { userIsEntitled } from "../storage";

/**
 * Requires the signed-in user to be entitled: the owner (always free) or an
 * active subscriber. Must run AFTER requireAuth (reads req.appUser).
 * Responds 402 Payment Required when a subscription is needed.
 */
export const requireEntitlement: RequestHandler = async (req, res, next) => {
  const user = req.appUser;
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    if (await userIsEntitled(user)) {
      next();
      return;
    }
    res.status(402).json({
      error: "An active subscription is required to use Made Super AI.",
      needsSubscription: true,
    });
  } catch (err) {
    req.log.error({ err }, "Entitlement check failed");
    res.status(500).json({ error: "Entitlement check failed" });
  }
};
