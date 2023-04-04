import express from 'express';
import { authController } from "../controllers/authController";
import { verifyRegister } from "../middlewares/verifyRegister";
import { authJwt } from '../middlewares/authJwt';

export function authRoutes(app: express.Express) {
    app.use(function(req,res,next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/register",
        [
            verifyRegister.checkDuplicateUsername,
            verifyRegister.checkRolesExist
        ],
        authController.register
    );

    app.post(
        "/api/auth/login",
        authController.login
    )

    app.post(
        "/api/auth/refresh",
        [
            authJwt.verifyRefreshToken
        ],
        authController.refresh
    )
}