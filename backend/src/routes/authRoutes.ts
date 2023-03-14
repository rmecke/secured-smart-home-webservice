import { authController } from "../controllers/authController";
import { verifyRegister } from "../middlewares/verifyRegister";

export function authRoutes(app) {
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
}