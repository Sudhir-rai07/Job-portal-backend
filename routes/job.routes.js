import { Router } from "express";
import { PostJob } from "../controllers/job.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.post("/post",protectRoute, PostJob)

export default router