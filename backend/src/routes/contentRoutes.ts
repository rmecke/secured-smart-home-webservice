import { contentController } from "../controllers/contentController";
import { authJwt } from "../middlewares/authJwt";

export function contentRoutes(app) {
    app.use(function(req,res,next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });

    app.get("/api/test/public", contentController.publicContent);

    app.get("/api/test/guest", [authJwt.verifyToken, authJwt.verifyAccessRights("guest")] ,contentController.guestContent);

    app.get("/api/test/user", [authJwt.verifyToken, authJwt.verifyAccessRights("user")], contentController.userContent);

    app.get("/api/test/admin", [authJwt.verifyToken, authJwt.verifyAccessRights("admin")], contentController.adminContent);
}