import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from "../config";
import { DB } from '../models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const AUTH_SECRET = process.env.AUTH_SECRET || AUTH_CONFIG.SECRET;
console.log("AUTH_SECRET: "+AUTH_SECRET);

const register = async (req, res) => {
    if (!req.body.username && !req.body.password) {
        res.status(400).send({
            message: `Failed! Username or password missing.`
        })
        return;
    }

    // The first registered user gets all roles
    await User.estimatedDocumentCount()
    .then((count) => {
        if (count === 0) {
            console.log(`First user ${req.body.username} detected. Granting all roles...`)
            req.body.roles = ROLES;
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
        if (req.body.roles) {
            Role.find(
                {
                    name: { $in: req.body.roles }
                }).then((roles) => {
                    user.roles = roles.map((role) => role._id);
                    user.save()
                    .then((user) => {
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

const login = (req, res) => {
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

        var token = jwt.sign({id: user.id}, AUTH_SECRET, {
            expiresIn: "1d" // 24 hours
        })

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
        

        res.status(200).send({
            id: user._id,
            username: user.username,
            roles: authorities,
            accessToken: token
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
    login
}