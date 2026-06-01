import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import statsRouter from "./stats";
import socialRouter from "./social";
import aiChatRouter from "./ai-chat";
import videoRouter from "./video";
import builderRouter from "./builder";
import stripeRouter from "./stripe";
import { requireAuth } from "../middlewares/requireAuth";
import { requireEntitlement } from "../middlewares/requireEntitlement";
import { consumeUsageCredit } from "../middlewares/consumeUsageCredit";

const router: IRouter = Router();

// --- Public routes (no auth / no subscription) ---
router.use(healthRouter);
// Stripe: plan listing is public; /me, checkout & portal self-enforce auth.
router.use(stripeRouter);

// --- Signed-in routes (free + paid) ---
// Everything below requires sign-in. The owner always bypasses metering/paywall.
router.use(requireAuth);

// FREE: the "Ask Me Anything" chat is usable on the free tier. It is metered —
// free users get a small monthly allowance, Basic users get their credits, and
// Pro/Business/owner are unlimited.
router.use(consumeUsageCredit, aiChatRouter);
// Conversation + message CRUD backs the free chat, so any signed-in user can use
// it. Never metered (only the AI generation in ai-chat consumes allowance).
router.use(conversationsRouter);
// Read-only stats for the signed-in dashboard/ticker.
router.use(statsRouter);

// --- Paid routes: require an active subscription (owner bypasses) ---
// Every tool other than the free chat is a paid service. These require a plan
// but are NOT metered — only the free "Ask Me Anything" chat consumes usage
// credits. With a plan, the tools run freely.
router.use(requireEntitlement);
router.use(videoRouter);
router.use(builderRouter);
router.use(socialRouter);

export default router;
