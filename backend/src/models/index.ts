import { UserSchema } from "./userModel";
import { RoleSchema } from "./roleModel";
import mongoose from "mongoose";

mongoose.Promise = global.Promise;

export const DB: { mongoose?: typeof mongoose; User?: mongoose.Model<any, {}, {}, {}, any, any>; Role?: mongoose.Model<any, {}, {}, {}, any, any>; ROLES?: string[]; } = {
    mongoose: mongoose,
    User: mongoose.models.User || mongoose.model('User', UserSchema),
    Role: mongoose.models.Role || mongoose.model('Role', RoleSchema),
    ROLES: ["user", "guest", "admin"]
};