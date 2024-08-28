import generateTokenAndSetCookie from "../middleware/getTokenAndSetCookie.js"
import User from "../model/user.modal.js"
import bcrypt from 'bcryptjs'

export const Register = async (req, res) =>{
    const {username, email, password} = req.body
    try {
        const existinguser = await User.findOne({username})
        if(existinguser) return res.status(400).json({error : "This username is already taken"})

            const existingEmail = await User.findOne({email})
            if(existingEmail) return res.status(400).json({error : "This email is already in use"})

const salt = await bcrypt.genSalt(10)
const hashPassword = await bcrypt.hash(password, salt)

const newUser = new User({
    email,
    username,
    password: hashPassword
})
await newUser.save()

await generateTokenAndSetCookie(newUser._id, res)

res.status(200)
.json({message: "User crreated"})        
    } catch (error) {
        res.status(500).json({error: "Internal serveer"})
        console.log("Error in Register controller", error)
    }
}


export const Login = async (req,res) =>{
    const {email, password} = req.body

    try {
        const user = await User.findOne({email})
        if(!user) return res.status(400).json({error: "User not found"})

        const isCorrectPassword = await bcrypt.compare(password, user.password)
        if(!isCorrectPassword)  return res.status(400).json({error: "Invalid credentials"})

        await generateTokenAndSetCookie(user._id, res)
        const responseText = "logged in as "+ user.username
        res.status(200).json({message: responseText})
    } catch (error) {
        res.status(500).json({error: "Internal serveer"})
        console.log("Error in Login controller", error)
    }
}

export const logout = async (req, res) => {
    try {
      res.cookie("token", "", { maxAge: 0 });
      res.status(200).json({ message: "Logged out" });
    } catch (error) {
      console.log("Error in Logout controller", error.message);
      res.status(500).json({ error: "Internal server error" });
    }
  };

export const getMe = async (req, res) =>{
    const {_id:userId} = req.user

    try {
        const me = await User.findById(userId).select("-password")
        if(!me) return res.status(400).json({error: "user not found"})

            res.status(200).json(me)
    } catch (error) {
        res.status(500).json({ error: "Internal serveer" });
        console.log("Error in getme controller", error);
      }
    }