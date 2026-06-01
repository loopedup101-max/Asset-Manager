import type { RequestHandler } from "express";
import { getAuth, clerkClient } from "@clerk/express";
import { storage } from "../storage";
import type { User } from "@workspace/db";

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      appUser?: User;
    }
  }
}

/**
 * Requires a signed-in Clerk user. JIT-provisions a row in our users table
 * on first request (fetching the email from Clerk), so the first registered
 * user becomes the free owner. Attaches the local user as `req.appUser`.
 */
export const requireAuth: RequestHandler = async (req, res, next) => {
  try {
    const { userId } = getAuth(req);
    if (!userId) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    let user = await storage.getUser(userId);
    if (!user) {
      let email: string | null = null;
      try {
        const clerkUser = await clerkClient.users.getUser(userId);
        email =
          clerkUser.primaryEmailAddress?.emailAddress ??
          clerkUser.emailAddresses?.[0]?.emailAddress ??
          null;
      } catch (err) {
        req.log.warn({ err }, "Failed to fetch Clerk user for provisioning");
      }
      user = await storage.getOrCreateUser(userId, email);
    }

    req.appUser = user;
    next();
  } catch (err) {
    req.log.error({ err }, "Auth middleware error");
    res.status(500).json({ error: "Authentication error" });
  }
};
