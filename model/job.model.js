import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
    location: {
      type: String,
      required: true,
      trim: true,
    },
    employment_type: {
      type: String,
      enum: [
        "Full-time",
        "Part-time",
        "Contract",
        "Temporary",
        "Internship",
        "Freelance",
      ],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    requirements: {
      type: [String], // Array of strings for skills and qualifications
      required: true,
    },
    salary: {
      type: String, 
    },
    posted_date: {
      type: Date,
      default: Date.now,
    },
    application_deadline: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Job = mongoose.model("Job", jobSchema)
export default Job