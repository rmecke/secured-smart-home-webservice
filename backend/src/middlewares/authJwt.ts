import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config";
import { DB } from '../models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const AUTH_SECRET = process.env.AUTH_SECRET || AUTH_CONFIG.SECRET;

const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        res.status(401).send({message: "No token provided!"});
        return;
    }

    jwt.verify(token, AUTH_SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send({message: "Unauthorized!"});
            return;
        }
        req.userId = decoded.id;
        next();
    });
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
    verifyAccessRights
}