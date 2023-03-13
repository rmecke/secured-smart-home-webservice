import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config/authConfig";
import { DB } from '../models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;


const verifyToken = (req, res, next) => {
    let token = req.headers["x-access-token"];

    if (!token) {
        res.status(403).send({message: "No token provided!"});
        return;
    }

    jwt.verify(token, AUTH_CONFIG.secret, (err, decoded) => {
        if (err) {
            res.status(401).send({message: "Unauthorized!"});
            return;
        }
        req.userId = decoded.id;
        next();
    });
};

const verifyAccessRights = (req, res, next, role) => {
    User.findById(req.userId)
    .exec()
    .then((user) => {
        Role.find({
            _id: { $in: user.roles}
        },
        (err, roles) => {
            if (err) {
                res.status(500).send({message: err});
            }

            for (let i=0; i<roles.length; i++) {
                if (roles[i].name === role) {
                    next();
                    return;
                }
            }

            res.status(403).send({message: "No Access Rights!"});
            return;
        }
        )

    })
    .catch(err => {
        console.error(`Error while checking access rights: ${err}`);
        return;
    })
}

export const authJwt = {
    verifyToken,
    verifyAccessRights
}