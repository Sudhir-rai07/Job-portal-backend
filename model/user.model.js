import mongoose from "mongoose";

const user_schema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    fullname: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      default:null,
      enum: ["male" , "female"],
    },
    isVerifed: {
      type: Boolean,
      default: false
    },
    profileImage: {
      type: String,
      default: ""
    },
    resume: {
      type: String,
      default: ""
    },
    about: {
      type: String,
      default: ""
    },
    skills: {
      type: [String],
      default: []
    },
    education:{
      type: String,
      default: "",
    },
    address:{
      type: String,
      default:""
    },
    jobsApplied: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job"
    }]
  },
  { timestamps: true }
);

const User = mongoose.model("User", user_schema);
export default User;
