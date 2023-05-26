import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config";
import { DB } from '../models/index';
import { LogLevel, loggingController } from './loggingController';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const AUTH_SECRET_ACCESS = process.env.AUTH_SECRET_ACCESS || AUTH_CONFIG.SECRET_ACCESS;
const AUTH_SECRET_REFRESH = process.env.AUTH_SECRET_REFRESH || AUTH_CONFIG.SECRET_REFRESH;

const register = async (req, res) => {
    if (!req.body.username && !req.body.password) {
        res.status(400).send({
            message: `Failed! Username or password missing.`
        })
        return;
    }

    let roleNames = undefined;

    // The first registered user gets all roles
    await User.estimatedDocumentCount()
    .then((count) => {
        if (count === 0) {
            roleNames = ROLES;
        }
    })
    .catch((err) => {
        console.error(`Error while retrieving User document count: ${err}`);
    })

    const user = new User({
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8)
    });

    user.save()
    .then((user) => {
        // Add the user to database
        if (roleNames) {
            Role.find(
                {
                    name: { $in: roleNames }
                }).then((roles) => {
                    user.roles = roles.map((role) => role._id);
                    user.save()
                    .then((user) => {
                        loggingController.createLog(user._id, LogLevel.INFO,`User registered with roles ${roleNames}.`);
                        res.send({message: "User was registered successfully"});
                    })
                    .catch((err) => {
                        res.status(500).send({message: err});
                        return;
                    });
                })
                .catch((err) => {
                    res.status(500).send({message: err});
                    return;
                })
        } else {
            Role.findOne({
                    name: "guest"
            }).then((role) => {
                    user.roles = [role._id];
                    user.save()
                    .then((user) => {
                        loggingController.createLog(user._id, LogLevel.INFO,`User registered with role "guest".`);
                        res.send({message: "User was registered successfully"});
                    })
                    .catch((err) => {
                        res.status(500).send({message: err});
                        return;
                    });
            }).catch((err) => {
                res.status(500).send({message: err});
                return;
            })

        }
    })
    .catch((err) => {
        res.status(500).send({message: err});
        return;
    })
}

const login = (req: express.Request, res: express.Response) => {
    User.findOne(
        {
            username: req.body.username
        }
    ).populate("roles","-__v")
    .exec()
    .then(async (user) => {
        if (!user) {
            return res.status(404).send({message: "User not found."});
        }

        var passwordIsValid = bcrypt.compareSync(
            req.body.password,
            user.password
        );

        if (!passwordIsValid) {
            res.status(401).send({
                accessToken: null,
                message: "Invalid Password!"
            });
            return;
        }

        // create the access token
        var accessToken = jwt.sign({id: user.id}, AUTH_SECRET_ACCESS, {
            expiresIn: "10m" // 10 minutes
        })

        // create the refresh token, longer time span
        var refreshToken = jwt.sign({id: user.id}, AUTH_SECRET_REFRESH, {
            expiresIn: "1d" // 24 hours
        })

        // assign refresh token in http-only cookie
        res.cookie("jwt",refreshToken,{httpOnly: true, secure: false, sameSite: 'strict', maxAge: 24 * 60 * 60 * 1000});

        // retrieve roles and send them back
        var authorities = [];
        await Role.find({
                _id: { $in: user.roles }
        }).then((roles) =>{
                let names = roles.map((role) => role.name);
                for (let i=0; i<names.length; i++) {
                    authorities.push(`ROLE_${names[i].toUpperCase()}`);
                }
        }).catch((err) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
        })

        loggingController.createLog(user._id, LogLevel.INFO,`User logged in. Access and refresh token created.`);

        res.status(200).send({
            id: user._id,
            username: user.username,
            roles: authorities,
            accessToken: accessToken
        })

    })
    .catch((err) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
    })
}

const refresh = (req: express.Request, res: express.Response) => {
    User.findOne(
        {
            _id: req.body.userId
        }
    ).populate("roles","-__v")
    .exec()
    .then(async (user) => {
        if (!user) {
            return res.status(404).send({message: "User not found."});
        }

        // create the access token
        var accessToken = jwt.sign({id: user.id}, AUTH_SECRET_ACCESS, {
            expiresIn: "10m" // 10 minutes
        })

        // retrieve roles and send them back
        var authorities = [];
        await Role.find({
                _id: { $in: user.roles }
        }).then((roles) =>{
                let names = roles.map((role) => role.name);
                for (let i=0; i<names.length; i++) {
                    authorities.push(`ROLE_${names[i].toUpperCase()}`);
                }
        }).catch((err) => {
                if (err) {
                    res.status(500).send({message: err});
                    return;
                }
        })

        loggingController.createLog(user._id, LogLevel.INFO,`Refresh token created.`);

        res.status(200).send({
            id: user._id,
            username: user.username,
            roles: authorities,
            accessToken: accessToken
        })

    })
    .catch((err) => {
        if (err) {
            res.status(500).send({message: err});
            return;
        }
    })
}

export const authController = {
    register,
    login,
    refresh
}