import { Router } from "express";
import { getMe, Login, logout, Register } from "../controllers/auth.controller.js";
import ProtectRoute from "../middleware/ProtectRoute.js";

const router = Router()

router.post("/register", Register)
router.post("/login", Login)
router.post("/logout", logout)
router.get("/me", ProtectRoute, getMe)

export default router