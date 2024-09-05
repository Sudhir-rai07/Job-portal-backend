import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
    applicant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    job: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Job"
    },
    coverLetter: {
        type: String,
        required: true
    }
}, {timestamps: true})


const Application = mongoose.model("Application", applicationSchema)

export default Application