import path from 'path'
import { Router } from "express";
import { ChangePassword, FindUser, ForgotPassword, GetMe, Login, Logout, ResetPassword, SignUp, UpdateProfile, VerifyAccount } from "../controllers/auth.controller.js";
import protectRoute from '../middleware/protectRoute.js'

import multer from 'multer'

const storage = multer.diskStorage({
    destination: (req, res, cb) =>{
        cb(null, "uploads/");
    },
    filename: (req, file, cb) =>{
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const upload = multer({storage: storage})



const router = Router()

router.post("/signup", SignUp)
router.post("/login", Login)
router.post("/logout", Logout)
router.get("/me",protectRoute, GetMe)

router.put("/update-profile",upload.single("profileImage"), protectRoute,UpdateProfile)

router.patch("/verify-account/:token", VerifyAccount)
router.patch("/change-password",protectRoute, ChangePassword)

router.get("/find-user/:email", FindUser)
router.post("/forgot-password", ForgotPassword)
router.patch("/reset-password/:token", ResetPassword)

export default router