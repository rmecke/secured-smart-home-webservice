import mongoose from "mongoose";
const { Schema } = mongoose;

export const LogSchema = new Schema({
    level: {
        type: String,
        enum: ["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"],
        default: "INFO"
    },
    timestamp: Number,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    message: String,
})