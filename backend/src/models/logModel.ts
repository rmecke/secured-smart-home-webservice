import mongoose from "mongoose";
const { Schema } = mongoose;

export const LogSchema = new Schema({
    timestamp: Number,
    date: Date,
    level: {
        type: String,
        enum: ["TRACE","DEBUG","INFO","WARN","ERROR","FATAL"],
        default: "INFO"
    },
    message: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
})