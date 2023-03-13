import mongoose from "mongoose";
const { Schema } = mongoose;

export const RoleSchema = new Schema({
    name: String
})