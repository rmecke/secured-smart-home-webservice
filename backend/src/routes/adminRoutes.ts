import { adminController } from "../controllers/adminController";
import { authJwt } from "../middlewares/authJwt";

export function adminRoutes(app) {
    app.use(function(req,res,next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    app.get("/api/admin/users", [authJwt.verifyToken, authJwt.verifyAccessRights("admin")] , adminController.getUsers);

    app.patch("/api/admin/users/switch", [authJwt.verifyToken, authJwt.verifyAccessRights("admin")] , adminController.switchRole);
}