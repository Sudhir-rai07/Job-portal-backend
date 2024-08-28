import mongoose from "mongoose";

const taskSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    url: {
        type: String,
        required: true
    },
    taskName: {
        type: String,
        required: true
    }
}, {timestamps: true})

const Task = mongoose.model("Task", taskSchema)
export default Task