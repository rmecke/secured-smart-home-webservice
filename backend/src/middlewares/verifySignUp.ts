import { DB } from '../models/index';
const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const checkDuplicateUsername = (req, res, next) => {
    console.log(1);

    // Username
    User.findOne({
        username: req.body.username
    })
    .exec()
    .then((user) => {
        if (user) {
            res.status(400).send({message: "Failed! Username is already in use!"});
            return;
        }

        next();
    })
    .catch(err => {
        console.error(`Error while checking for duplicate username: ${err}`);
        return;
    })
}

const checkRolesExist = (req, res, next) => {
    console.log(2);

    if (req.body.roles) {
        req.body.roles.forEach((role) => {
            if (!ROLES.includes(role)) {
                res.status(400).send({
                    message: `Failed! Role ${role} does not exist!`
                })
                return;
            }
        })
    }

    next();
}

export const verifySignUp = {
    checkDuplicateUsername,
    checkRolesExist
}