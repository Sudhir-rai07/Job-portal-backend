import { Router } from "express";
import { Login, Logout, SignUp } from "../controllers/auth.controller.js";

const router = Router()

router.post("/signup", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)

export default router