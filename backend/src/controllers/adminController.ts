import fetch from 'cross-fetch';
import fs from 'fs';
import path from 'path';
import { WEBSOCKET_CONFIG } from '../config';
import { IoBrokerSocket } from '../utils/iobroker';
import axios from "../utils/axios";
import { IControl, IDatapoint, IDevice, IRoom } from 'src/interfaces';
import { DB } from '../models/index';
import { LogLevel, loggingController } from './loggingController';
const Role = DB.Role;
const User = DB.User;

interface IRole {
    _id: string,
    name: string,
    assigned?: boolean
}

interface IUser {
    _id: string, 
    username: string, 
    roles: Array<IRole>
}

const getUsers = async (req,res) => {
    // Get all available roles
    let roles: Array<IRole> = await Role.find({},"_id name").exec();

    // Get all users with their assigned roles
    let users: Array<IUser> = await User.find<IUser>({},"_id username roles").populate("roles", "name").exec();
    
    // Polish the users: Add also the unassigned roles, for later use in frontend
    let polished: Array<IUser> = [];
    users.forEach((user) => {
        let polishedUser: IUser = {
            _id: user._id,
            username: user.username,
            roles: []
        }

        // Iterate over each available role and handle assigned/unassigned status
        roles.forEach((role) => {
            let userRole = user.roles.find((x) => {return x._id.toString() == role._id.toString()});
            if (userRole) {
                // User is assigned to that role
                polishedUser.roles.push({
                    _id: role._id,
                    name: role.name,
                    assigned: true
                })
            } else {
                // User is not assigned to that role
                polishedUser.roles.push({
                    _id: role._id,
                    name: role.name,
                    assigned: false
                })
            }
        })

        polished.push(polishedUser);
    })

    loggingController.createLog(req.userId, LogLevel.INFO,`Users requested.`);

    res.status(200).send({users: polished});
}

const deleteUser = async (req, res) => {
    let userId = req.body.userId;

    if (!userId) {
        loggingController.createLog(req.userId, LogLevel.DEBUG,`User could not be deleted, because of missing user id.`);
        res.status(400).send({
            message: `Failed! No user id provided.`
        })
        return;
    }

    await User.findByIdAndDelete(userId).then(() => {
        loggingController.createLog(req.userId, LogLevel.INFO,`User ${userId} deleted.`);
        res.status(200).send();
    }).catch((err) => {
        res.status(500).send({message: err});
        return;
    })
}

const switchRole = async (req,res) => {
    let user = req.body.user;

    if (user) {
        let doc = await User.findById<IUser>(user.userId);
        let roles = doc.roles;


        // Role should be added
        if (user.newValue == true) {
            roles.push(user.roleId);

            await User.findByIdAndUpdate(user.userId,{roles: roles});

            loggingController.createLog(req.userId, LogLevel.INFO,`Added role ${user.roleId} to user ${user.userId}.`);
            res.status(200).send();
        } else {
            roles.splice(roles.findIndex((x) => {return x._id == user.roleId}),1);

            await User.findByIdAndUpdate(user.userId,{roles: roles});

            loggingController.createLog(req.userId, LogLevel.INFO,`Revoked role ${user.roleId} from user ${user.userId}.`);
            res.status(200).send();
        }
    } else {
        res.status(400).send();
    }
}

export const adminController = {
    getUsers,
    deleteUser,
    switchRole
}