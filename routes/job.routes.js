import { Router } from "express";
import { DeleteJobPost, PostJob, UpdateJobPost, ApplyForJob } from "../controllers/job.controller.js";
import protectRoute from "../middleware/protectRoute.js";

const router = Router()

router.post("/post-job",protectRoute, PostJob)
router.delete("/delete-job/:id", protectRoute, DeleteJobPost)
router.patch("/update-job/:id", protectRoute, UpdateJobPost)


// application routes
router.post("/apply/:id", protectRoute, ApplyForJob)

export default router