import User from "../model/user.model.js";

export const protectRecruiterRoute = async (req, res, next) =>{
    const {userId } = req.user;

    try {
        const user = await User.findById(userId);
        if (!user || user.role !== 'recruiter') {
            return res.status(401).json({error: 'You are not authorized to access this route'});
        }

        next()
    } catch (error) {
        console.log(error)
    }
    }