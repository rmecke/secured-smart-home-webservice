import express from 'express';
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config";
import { DB } from '../models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const AUTH_SECRET_ACCESS = process.env.AUTH_SECRET_ACCESS || AUTH_CONFIG.SECRET_ACCESS;
const AUTH_SECRET_REFRESH = process.env.AUTH_SECRET_REFRESH || AUTH_CONFIG.SECRET_REFRESH;

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        res.status(401).send({message: "No token provided!"});
        return;
    }

    jwt.verify(token, AUTH_SECRET_ACCESS, {
        complete: true,
        issuer: `urn:secured-smart-home:webservice-${res.socket.localAddress}`,
        subject: `urn:secured-smart-home:user-${req.socket.remoteAddress}`,
        audience: `urn:secured-smart-home:webservice-${res.socket.localAddress}`,
    }, (err, decoded) => {
        if (err) {
            res.status(401).send({message: "Unauthorized!"});
            return;
        }

        console.log("Decoded Access-JWT: "+JSON.stringify(decoded));

        req.userId = (decoded.payload as {id:string}).id;
        next();
    });
};

const verifyRefreshToken = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    if (req.cookies?.jwt) {
        // retrieve the refresh token
        const refreshToken = req.cookies.jwt;

        // verify the refresh token
        jwt.verify(refreshToken, AUTH_SECRET_REFRESH, {
            complete: true,
            issuer: `urn:secured-smart-home:webservice-${res.socket.localAddress}`,
            subject: `urn:secured-smart-home:user-${req.socket.remoteAddress}`,
            audience: `urn:secured-smart-home:webservice-${res.socket.localAddress}`,
        }, (err, decoded) => {
            if (err) {
                res.status(401).send({message: "Unauthorized!"});
                return;
            }

            console.log("Decoded Refresh-JWT: "+JSON.stringify(decoded));

            req.body.userId = (decoded.payload as {id:string}).id;
            next();
        });
    } else {
        res.status(401).send({message: "Unauthorized!"});
    }
};

const verifyAccessRights = (role) => {
    return (req, res, next) => {
        User.findById(req.userId)
        .exec()
        .then((user) => {
            Role.find({
                _id: { $in: user.roles}
            }).then((roles) => {
                for (let i=0; i<roles.length; i++) {
                    if (roles[i].name === role) {
                        next();
                        return;
                    }
                }

                res.status(403).send({message: "No Access Rights!"});
                return;
            }).catch((err) => {
                res.status(500).send({message: err});
                return;
            })

        })
        .catch(err => {
            console.error(`Error while checking access rights: ${err}`);
            return;
        })
    }
}

export const authJwt = {
    verifyToken,
    verifyRefreshToken,
    verifyAccessRights,
}