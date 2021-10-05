import { Router } from "express";
import UserRouter from "./user";
import AuthRouter from "./auth";
import StatsRouter from "./stats";
import DataRoute from "./data";
import UploadRoute from "./upload";
import getSettings from "../../settings";
import rateLimit from "express-rate-limit";

const router = Router();
const settings = getSettings();
const ratelimit = rateLimit({
	windowMs: settings.ratelimit.time,
	max: settings.ratelimit.amount,
});

router
	.use("/user", ratelimit, UserRouter)
	.use("/auth", ratelimit, AuthRouter)
	.use("/stats", StatsRouter)
	.use(DataRoute)
	.use(UploadRoute);

export default router;
