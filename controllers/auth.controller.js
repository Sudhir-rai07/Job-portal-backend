import bcrypt from "bcryptjs";
import User from "../model/user.model.js";
import jwt from "jsonwebtoken";
import { v2 as Cloudinary } from "cloudinary";
import Token from "../model/auth.token.model.js";
import crypto from "crypto";
import transporter from "../utils/email.setup.js";

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

    // Generate token
    const verification_token = new Token({
      user: newUser._id,
      token: crypto.randomBytes(16).toString("hex"),
      tokenType: "verify-account",
    });

    await verification_token.save();
    // Send verification email
    const mailOPtions = {
      from: process.env.NODEMAILER_USER,
      to: newUser.email,
      subject: "Account verification",
      text: `Hello ${newUser.fullname}, Please click this link ${process.env.CLIENT_URL}/verify-account/${verification_token.token}`,
    };

    transporter.sendMail(mailOPtions, (error, info) => {
      if (error) {
        console.log("Email not send ", error);
      }
      // console.log("Sent")
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
    console.log("Error in Login controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const Logout = async (req, res) => {
  try {
    res.cookie("token", "", {
      maxAge: 0,
    });
    res.status(200).json({ message: "Logged out" });
  } catch (error) {
    console.log("Error in logout controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const GetMe = async (req, res) => {
  const { userId } = req.user;
  try {
    const user = await User.findById(userId).select("-password");
    res.status(200).json(user);
    res.status(200).json();
  } catch (error) {}
};

export const UpdateProfile = async (req, res) => {
  const { resume, about, skills,education, address, fullname,gender } = req.body;
  let profileImage = req.file;
  const { userId } = req.user;
console.log(req.files)
  try {
    const user = await User.findByIdAndUpdate(userId, {}).select("-password");
    if (!user) return res.status(400).json({ error: "User not found" });

    if (profileImage) {
      if (user.profileImage) {
        await Cloudinary.uploader.destroy(
          user.profileImage.split("/").pop().split(".")[0]
        );
      }

      const cloudinaryUploadResponse = await Cloudinary.uploader.upload(
        profileImage.path
      );
      profileImage = cloudinaryUploadResponse.secure_url;
    }

    user.resume = resume || user.resume;
    user.about = about || user.about;
    user.skills = skills ? JSON.parse(skills) : user.skills;  
    user.profileImage = profileImage || user.profileImage;
    user.education = education || user.education
    user.address = address || user.address
    user.fullname = fullname || user.fullname
    user.gender = gender || user.gender

    await user.save();
    res.status(200).json(user);
  } catch (error) {
    console.log("Error in update-profile controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const VerifyAccount = async (req, res) => {
  const { token } = req.params;

  try {
    const verifyToken = await Token.findOne({ token: token });
    if (!token)
      return res.status(400).json({ error: "Token is invalid or expired" });

    if (verifyToken.tokenType !== "verify-account")
      return res.status(401).json({ error: "Invalid token" });

    const user = await User.findById(verifyToken.user);
    if (!user) return res.status(400).json({ error: "User not found" });

    user.isVerifed = true;
    await user.save();
    await Token.findByIdAndDelete(token._id);

    res.status(200).json({ message: "Account verified" });
  } catch (error) {
    console.log("Error in VerifyAccount controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const ChangePassword = async (req, res) => {
  const { userId } = req.user;
  const { currentPassword, newPassword } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) return res.status(400).json({ error: "User not found" });

    const isCorrectPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isCorrectPassword)
      return res.status(400).json({ error: "Current password is invalid" });

    const isOldPassword = await bcrypt.compare(newPassword, user.password)
    if (isOldPassword)
      return res.status(400).json({ error: "New password can not be same as old" });

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;
    await user.save();


    // Send email
    const mailOPtions = {
      from: process.env.NODEMAILER_USER,
      to: user.email,
      subject: "Security alert",
      text: `Hello ${user.fullname}, Your password has been changed successfully.`,
    };

    transporter.sendMail(mailOPtions, (error, info) => {
      if (error) {
        console.log("Email not sent ", error);
      }
    });

    res.status(200).json({ message: "Password changed" });
  } catch (error) {
    console.log("Error in change password controller ", error);
    res.status(500).json({ error: "Internal sever error" });
  }
};

export const ForgotPassword = async (req, res) => {
  const { email } = req.body;
  console.log(email);
  try {
    const user = await User.findOne({ email: email });
    if (!user) return res.status(400).json({ error: "User not found" });

    const resetPasswordToken = new Token({
      user: user,
      token: crypto.randomBytes(16).toString("hex"),
      tokenType: "reset-password",
    });

    await resetPasswordToken.save();

    // Send verification email
    const mailOPtions = {
      from: process.env.NODEMAILER_USER,
      to: user.email,
      subject: "Reset password",
      text: `Hello ${user.fullname}, Please click this link ${process.env.CLIENT_URL}/reset-password/${resetPasswordToken.token} to reset your password`,
    };

    transporter.sendMail(mailOPtions, (error, info) => {
      if (error) {
        console.log("Email not sent : ", error);
      }
    });

    res.status(200).json({
      message: "A password reset link has been sent to your registered email.",
    });
  } catch (error) {
    console.log("Error in forgot-password controller ", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

export const ResetPassword = async (req, res) => {
  const token = req.params.token;
  const { newPassword } = req.body;

  try {
    const resetToken = await Token.findOne({ token: token });
    if (!resetToken)
      return res.status(400).json({ error: "Token expired or invalid" });

    if (resetToken.tokenType !== "reset-password")
      return res.status(400).json({ error: "Invalid token" });

    const user = await User.findById(resetToken.user);
    if (!user) res.status(400).json({ error: "User not found" });

    const hashPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashPassword;

    await user.save();
    await Token.findByIdAndDelete(resetToken._id);

    res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    console.log("Error in reset-password controller ", error);
    res.status(500).json({ error: "Internal sever error" });
  }
};

export const FindUser = async (req, res) =>{
const {email} = req.params
try {
  const user = await User.findOne({email}).select("-password")
  if(!user) return res.status(404).json({error: "User not found"})
    res.status(200).json(user)
} catch (error) {
  console.error(error)
    res.status(500).json({ error: "Internal Server Error" })
}
}