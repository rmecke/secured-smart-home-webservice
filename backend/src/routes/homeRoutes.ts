import { homeController } from "../controllers/homeController";
import { authJwt } from "../middlewares/authJwt";

export function homeRoutes(app) {
    app.use(function(req,res,next) {
        res.header(
            "Access-Control-Allow-Headers",
            "x-access-token, Origin, Content-Type, Accept"
        );
        next();
    });


    app.get("/api/home/rooms", [authJwt.verifyToken, authJwt.verifyAccessRights("user")] , homeController.getRooms);

    app.get("/api/home/rooms/:id/devices", [authJwt.verifyToken, authJwt.verifyAccessRights("user")] , homeController.getDevices);

    app.patch("/api/home/rooms/switch", [authJwt.verifyToken, authJwt.verifyAccessRights("user")] , homeController.switchDevice);

    app.patch("/api/home/rooms/update", [authJwt.verifyToken, authJwt.verifyAccessRights("user")] , homeController.updateDevice);
}