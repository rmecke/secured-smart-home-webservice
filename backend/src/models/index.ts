import { UserSchema } from "./userModel";
import { RoleSchema } from "./roleModel";
import { LogSchema } from "./logModel";
import mongoose from "mongoose";
import { IDatabase } from "src/interfaces";

mongoose.Promise = global.Promise;

export const DB: IDatabase = {
    mongoose: mongoose,
    User: mongoose.models.User || mongoose.model('User', UserSchema),
    Role: mongoose.models.Role || mongoose.model('Role', RoleSchema),
    Log: mongoose.models.Log || mongoose.model('Log', LogSchema),
    ROLES: ["guest", "user", "admin"]
};