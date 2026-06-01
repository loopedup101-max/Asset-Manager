import { Router, type IRouter } from "express";
import healthRouter from "./health";
import conversationsRouter from "./conversations";
import statsRouter from "./stats";

const router: IRouter = Router();

router.use(healthRouter);
router.use(conversationsRouter);
router.use(statsRouter);

export default router;
