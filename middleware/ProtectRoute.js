import jwt from 'jsonwebtoken'
import User from '../model/user.modal.js'
 

const ProtectRoute = async (req, res,next) =>{
    const {token} = req.cookies

    try {
        if(!token) return res.status(400).json({error: "Unauthorized"})
        
            const verifyToken = await jwt.verify(token, process.env.JWT_SECRET)
            if(!verifyToken) return res.status(400).json({error: "Unauthorized - invalid token"})
            
            const user = await User.findById(verifyToken.userId).select("-password")
            if(!user) return res.status(400).json("User not found!")
            req.user = user;
            next()
    } catch (error) {
        res.status(500).json({error: "Internal server error"})
        console.log("Error in protect route middleware", error)
    }
}

export default ProtectRoute