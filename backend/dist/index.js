"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dbConfig_1 = require("./config/dbConfig");
const authRoutes_1 = require("./routes/authRoutes");
const contentRoutes_1 = require("./routes/contentRoutes");
const index_1 = require("./models/index");
const homeRoutes_1 = require("./routes/homeRoutes");
const User = index_1.DB.User;
const Role = index_1.DB.Role;
const ROLES = index_1.DB.ROLES;
index_1.DB.mongoose
    .connect(`mongodb://${dbConfig_1.DB_CONFIG.HOST}:${dbConfig_1.DB_CONFIG.PORT}/${dbConfig_1.DB_CONFIG.DATABASE}`, {})
    .then(() => {
    console.log("Successfuly connected to MongoDB.");
    initial();
})
    .catch(err => {
    console.error(`Error while connecting to MongoDB: ${err}`);
    process.exit();
});
function initial() {
    Role.estimatedDocumentCount()
        .then((count) => {
        if (count === 0) {
            ROLES.forEach((role) => {
                new Role({
                    name: role
                })
                    .save()
                    .then(() => {
                    console.log(`Successfully added ${role} to roles collection.`);
                })
                    .catch(err => {
                    console.error(`Error while adding ${role} to roles collection: ${err}`);
                });
            });
        }
    })
        .catch((err) => {
        console.error(`Error while retrieving Roles document count.`);
    });
}
var app = (0, express_1.default)();
var corsOptions = {
    origin: "http://localhost:3000"
};
app.use((0, cors_1.default)(corsOptions));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.get("/", (req, res) => {
    res.json({ message: "Welcome to the Secured Smart Home!" });
});
(0, authRoutes_1.authRoutes)(app);
(0, contentRoutes_1.contentRoutes)(app);
(0, homeRoutes_1.homeRoutes)(app);
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
