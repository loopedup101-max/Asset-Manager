import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import statsRouter from "./stats";
import socialRouter from "./social";
import aiChatRouter from "./ai-chat";

const router: IRouter = Router();

router.use(healthRouter);
router.use(aiChatRouter);
router.use(conversationsRouter);
router.use(statsRouter);
router.use(socialRouter);

export default router;
