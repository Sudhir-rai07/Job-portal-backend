import mongoose from "mongoose";

const tokenSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    token: {
        type: String,
        required: true,
        trim: true
    },
    tokenType: {
        type: String,
        enum:["reset-password", "verify-account"]
    },
    expiresAt:{
        type: Date,
        default: Date.now(),
        index: {expires: 2 * 60 * 60 * 1000}
    }
}, {timestamps: true})

const Token = mongoose.model("Token", tokenSchema)

export default Token