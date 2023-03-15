"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const config_1 = require("./config");
const authRoutes_1 = require("./routes/authRoutes");
const contentRoutes_1 = require("./routes/contentRoutes");
const index_1 = require("./models/index");
const homeRoutes_1 = require("./routes/homeRoutes");
const User = index_1.DB.User;
const Role = index_1.DB.Role;
const ROLES = index_1.DB.ROLES;
const HTTPS = process.env.HTTPS || config_1.HTTPS_CONFIG.ENABLED;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;
const DB_HOST = process.env.DB_HOST || config_1.DB_CONFIG.HOST;
const DB_PORT = process.env.DB_PORT || config_1.DB_CONFIG.PORT;
const DB_NAME = process.env.DB_NAME || config_1.DB_CONFIG.NAME;
const DB_USERNAME = process.env.DB_USERNAME || null;
const DB_USERPASSWORD = process.env.DB_USERPASSWORD || null;
const CORS_ORIGIN = process.env.CORS_ORIGIN || config_1.CORS_CONFIG.ORIGIN;
const DB_CONNECTION_STRING = `mongodb://${DB_HOST}:${DB_PORT}`;
const options = (DB_USERNAME && DB_USERPASSWORD)
    ? {
        dbName: DB_NAME,
        authMechanism: 'DEFAULT',
        auth: { username: DB_USERNAME, password: DB_USERPASSWORD },
    }
    : {
        dbName: DB_NAME,
    };
console.log("DB_CONNECTION_STRING: " + DB_CONNECTION_STRING);
console.log("Database Connect Options: " + JSON.stringify(options));
index_1.DB.mongoose
    .connect(DB_CONNECTION_STRING, options)
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
var whitelist = ["http://localhost:54000", "https://localhost:54000", CORS_ORIGIN];
var corsOptions = {
    origin(requestOrigin, callback) {
        if (whitelist.indexOf(requestOrigin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error(`Origin ${requestOrigin} not allowed by CORS.`));
        }
    },
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
if (HTTPS) {
    let keyFilePath = "../ssl_certificate/key.pem";
    let crtFilePath = "../ssl_certificate/crt.pem";
    let keyFileExists = fs_1.default.existsSync(path_1.default.resolve(__dirname, keyFilePath));
    let crtFileExists = fs_1.default.existsSync(path_1.default.resolve(__dirname, crtFilePath));
    // If not found, try a folder above
    if (!keyFileExists || !crtFileExists) {
        keyFilePath = "../../ssl_certificate/key.pem";
        crtFilePath = "../../ssl_certificate/crt.pem";
        keyFileExists = fs_1.default.existsSync(path_1.default.resolve(__dirname, keyFilePath));
        crtFileExists = fs_1.default.existsSync(path_1.default.resolve(__dirname, crtFilePath));
    }
    if (keyFileExists && crtFileExists) {
        let keyFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../ssl_certificate/key.pem"));
        let crtFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../ssl_certificate/crt.pem"));
        https_1.default.createServer({
            key: keyFile,
            cert: crtFile
        }, app)
            .listen(PORT, () => {
            console.log(`Server is running on port ${PORT} with SSL certificate.`);
        });
    }
    else {
        console.error("SSL certificate not found. Make sure to place the key.pem and crt.pem in the folder ssl_certificate. If you don't want to use SSL encryption, set the environment variable HTTPS=false .");
    }
}
else {
    app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} without SSL certificate.`);
    });
}
