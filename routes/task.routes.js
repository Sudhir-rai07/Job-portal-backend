import { Router } from "express";
import { DeleteTask, getAllTasks, SubmitTask, UpdateTask } from "../controllers/task.controller.js";
import ProtectRoute from "../middleware/ProtectRoute.js";

const router = Router()

router.post("/submit-task",ProtectRoute,SubmitTask)
router.put("/update-task/:id",ProtectRoute,UpdateTask)
router.delete("/delete-task/:id",ProtectRoute,DeleteTask)
router.get("/all", ProtectRoute, getAllTasks)
export default router