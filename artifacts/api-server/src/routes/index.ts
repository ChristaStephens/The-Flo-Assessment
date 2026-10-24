import { Router, type IRouter } from "express";
import healthRouter from "./health";
import tymfloRouter from "./tymflo";
import leadMagnetRouter from "./lead-magnet";

const router: IRouter = Router();

router.use(healthRouter);
router.use(tymfloRouter);
router.use(leadMagnetRouter);

export default router;
