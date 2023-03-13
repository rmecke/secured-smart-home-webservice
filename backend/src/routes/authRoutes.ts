import { authController } from "../controllers/authController";
import { verifySignUp } from "../middlewares/verifySignUp";

export function authRoutes(app) {
    app.use(function(req,res,next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.post(
        "/api/auth/signup",
        [
            verifySignUp.checkDuplicateUsername,
            verifySignUp.checkRolesExist
        ],
        authController.signUp
    );

    app.post(
        "/api/auth/signup",
        authController.signIn
    )
}