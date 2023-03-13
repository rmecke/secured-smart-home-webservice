import mongoose from "mongoose";
const { Schema } = mongoose;

export const UserSchema = new Schema({
    username: String,
    password: String,
    roles: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Role"
        }
    ]
})