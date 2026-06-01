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

const router: IRouter = Router();

// --- Public routes (no auth / no subscription) ---
router.use(healthRouter);
// Stripe: plan listing is public; /me, checkout & portal self-enforce auth.
router.use(stripeRouter);

// --- Gated routes: signed in AND entitled (owner is always free) ---
// The whole product (chat + tools) requires a subscription; the owner bypasses.
router.use(requireAuth, requireEntitlement);
router.use(aiChatRouter);
router.use(conversationsRouter);
router.use(statsRouter);
router.use(socialRouter);
router.use(videoRouter);
router.use(builderRouter);

export default router;
