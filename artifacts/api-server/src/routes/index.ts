import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import statsRouter from "./stats";
import socialRouter from "./social";
import aiChatRouter from "./ai-chat";
import videoRouter from "./video";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiChatRouter);
router.use(conversationsRouter);
router.use(statsRouter);
router.use(socialRouter);
router.use(videoRouter);

export default router;
