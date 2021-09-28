import { Router } from "express";
import UserRouter from "./user";
import AuthRouter from "./auth";
import StatsRouter from "./stats";
import DataRoute from "./data";

const router = Router();
router.use("/user", UserRouter).use("/auth", AuthRouter).use("/stats", StatsRouter).use(DataRoute);

export default router;
