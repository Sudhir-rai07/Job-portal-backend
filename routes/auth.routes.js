import { Router } from "express";
import { GetMe, Login, Logout, SignUp } from "../controllers/auth.controller.js";
import protectRoute from '../middleware/protectRoute.js'

const router = Router()

router.post("/signup", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)
router.get("/me",protectRoute, GetMe)

export default router