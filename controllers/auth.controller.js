import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { v2 as Cloudinary } from "cloudinary";

export const SignUp = async (req, res) => {
  const { username, fullname, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ error: "This user already exists" });

    const existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ error: "This username already taken" });

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      fullname,
      email,
      password: hashPassword,
    });

    await newUser.save();
    // setCookieAndGenerateToken
    const token = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in ms
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });

    res
      .status(200)
      .json({ message: "User created successfully", token: token });
  } catch (error) {
    console.log("Error in SignUp controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const Login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const isCorrectPassword = await bcrypt.compare(password, user.password);
    if (!isCorrectPassword)
      return res.status(400).json({ error: "Invalid username or password" });

    // setCookieAndGenerateToken
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15d",
    });

    res.cookie("token", token, {
      maxAge: 15 * 24 * 60 * 60 * 1000, //15 days in ms
      sameSite: "strict",
      httpOnly: true,
      secure: process.env.NODE_ENV !== "development",
    });

    res.status(200).json({ message: "Logged in", token: token });
  } catch (error) {
    console.log('Error in Login controller ', error)
    res.status(500).json({error: "Internal server error"})
  }
};

export const Logout = async (req, res) =>{
  try {
    res.cookie("token", "", {
maxAge: 0
    })
    res.status(200).json({message: "Logged out"})
  } catch (error) {
    console.log('Error in logout controller ', error)
    res.status(500).json({error: "Internal server error"})
  }
}


export const GetMe = async (req, res) =>{
  const {userId} = req.user
  try {
    const user = await User.findById(userId)
    res.status(200).json(user)
    res.status(200).json()
  } catch (error) {
    
  }
}

export const UpdateProfile = async (req, res) =>{
  const {resume,about, skills} = req.body
  let profileImage = req.file
  const {userId} = req.user
  if(profileImage) console.log(profileImage)
  try {
    const user = await User.findByIdAndUpdate(userId, {})
    if(!user) return res.status(400).json({error: "User not found"})

    if(profileImage){
      if(user.profileImage){
        await Cloudinary.uploader.destroy(user.profileImage.split("/").pop().split(".")[0])
      }

      const cloudinaryUploadResponse = await Cloudinary.uploader.upload(profileImage.path)
      profileImage = cloudinaryUploadResponse.secure_url;
    }
    

    
    user.resume = resume || user.resume
    user.about = about || user.about
    user.skills = skills || user.skills
    user.profileImage = profileImage || user.profileImage

    await user.save();
console.log(profileImage)
    res.status(200).json({message: "Profile updated", user})
  } catch (error) {
    console.log("Error in update-profile controller ", error)
    res.status(500).json({error: "Internal server error"})
  }
}