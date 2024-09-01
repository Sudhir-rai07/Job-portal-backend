import path from 'path'
import { Router } from "express";
import { GetMe, Login, Logout, SignUp, UpdateProfile } from "../controllers/auth.controller.js";
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

export default router