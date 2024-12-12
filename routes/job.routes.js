import { Router } from "express";
import { DeleteJobPost, PostJob, UpdateJobPost, ApplyForJob, GetAllJobs, searchJobs, FindPost, JobsPostedByMe, GetLatestJobs, GetAppliedJobs, SeeApplications, AcceptApplication, RejectApplication } from "../controllers/job.controller.js";
import protectRoute from "../middleware/protectRoute.js";
import { protectRecruiterRoute } from "../middleware/protectRecruiter.js";
import { protectJobSeekerRoute } from "../middleware/ProtectJobSeeker.js";

const router = Router()

router.post("/post-job",protectRoute, protectRecruiterRoute, PostJob)
router.delete("/delete/:id", protectRoute,protectRecruiterRoute, DeleteJobPost)
router.patch("/update/:id", protectRoute,protectRecruiterRoute, UpdateJobPost)
router.get("/applications/:id", protectRoute, protectRecruiterRoute, SeeApplications)
router.patch("/application/accept/:id",protectRoute, protectRecruiterRoute, AcceptApplication)
router.patch("/application/reject/:id",protectRoute, protectRecruiterRoute, RejectApplication)

router.get("/all", GetAllJobs)  
router.get("/latest-jobs", GetLatestJobs)
router.get("/search-job", searchJobs)
router.get("/jobs-applied",protectRoute, protectJobSeekerRoute, GetAppliedJobs)


// application routes
router.post("/apply/:id", protectRoute,protectJobSeekerRoute, ApplyForJob)
router.get("/get/:id", FindPost)
router.get("/posted-by-me", protectRoute, JobsPostedByMe)

export default router