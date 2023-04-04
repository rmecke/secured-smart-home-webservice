import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import path from 'path';
import { AUTH_CONFIG, CORS_CONFIG, DB_CONFIG, HTTPS_CONFIG, WEBSOCKET_CONFIG } from './config';
import { authRoutes } from './routes/authRoutes';
import { contentRoutes } from './routes/contentRoutes';
import { DB } from './models/index';
import { homeRoutes } from './routes/homeRoutes';
import { ConnectOptions } from 'mongoose';
import url from 'url';
import jwt from "jsonwebtoken";
import Websocket from 'ws';
import { websocketController } from './controllers/websocketController';
import cookieparser from "cookie-parser";

const User = DB.User;
const Role = DB.Role;
const ROLES = DB.ROLES;

const HTTPS = process.env.HTTPS || HTTPS_CONFIG.ENABLED;
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54001;

const DB_HOST = process.env.DB_HOST || DB_CONFIG.HOST;
const DB_PORT = process.env.DB_PORT || DB_CONFIG.PORT;
const DB_NAME = process.env.DB_NAME || DB_CONFIG.NAME;
const DB_USERNAME = process.env.DB_USERNAME || null;
const DB_USERPASSWORD = process.env.DB_USERPASSWORD || null;

const CORS_ORIGIN = process.env.CORS_ORIGIN || CORS_CONFIG.ORIGIN;

const DB_CONNECTION_STRING = `mongodb://${DB_HOST}:${DB_PORT}`;
const options: ConnectOptions = (DB_USERNAME && DB_USERPASSWORD) 
    ? {
        dbName: DB_NAME,
        authMechanism: 'DEFAULT', 
        auth: {username: DB_USERNAME, password: DB_USERPASSWORD},
    }
    : {
        dbName: DB_NAME,
    };
console.log("DB_CONNECTION_STRING: "+DB_CONNECTION_STRING);
console.log("Database Connect Options: "+JSON.stringify(options));

DB.mongoose
    .connect(DB_CONNECTION_STRING, options)
    .then(() => {
        console.log("Successfuly connected to MongoDB.");
        initial();
    })
    .catch(err => {
        console.error(`Error while connecting to MongoDB: ${err}`);
        process.exit();
    })

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
                })
            })
        }
    })
    .catch((err) => {
        console.error(`Error while retrieving Roles document count.`);
    })
}

// Create the REST API
var app: express.Express = express();

var whitelist = ["http://localhost:54000","https://localhost:54000","http://localhost:3000","https://localhost:3000",CORS_ORIGIN];
var corsOptions: cors.CorsOptions = {
    origin(requestOrigin, callback) {
        if (whitelist.indexOf(requestOrigin) !== -1) {
            callback(null,true);
        } else {
            callback(new Error(`Origin ${requestOrigin} not allowed by CORS.`));
        }
    },
    credentials: true
}
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cookieparser());
app.get("/", (req,res) => {
    res.json({ message: "Welcome to the Secured Smart Home!"});
})

authRoutes(app);
contentRoutes(app);
homeRoutes(app);

let expressServer;

if (HTTPS) {
    let keyFilePath = "../ssl_certificate/key.pem";
    let crtFilePath = "../ssl_certificate/crt.pem";
    let keyFileExists = fs.existsSync(path.resolve(__dirname, keyFilePath));
    let crtFileExists = fs.existsSync(path.resolve(__dirname, crtFilePath));

    // If not found, try a folder above
    if (!keyFileExists || !crtFileExists) {
        keyFilePath = "../../ssl_certificate/key.pem";
        crtFilePath = "../../ssl_certificate/crt.pem";
        keyFileExists = fs.existsSync(path.resolve(__dirname, keyFilePath));
        crtFileExists = fs.existsSync(path.resolve(__dirname, crtFilePath));
    }

    if (keyFileExists && crtFileExists) {   
        let keyFile = fs.readFileSync(path.resolve(__dirname, "../ssl_certificate/key.pem"));
        let crtFile = fs.readFileSync(path.resolve(__dirname, "../ssl_certificate/crt.pem"));

        expressServer = https.createServer({
                key: keyFile,
                cert: crtFile
            },app)
        .listen(PORT, () => {
            console.log(`Server is running on port ${PORT} with SSL certificate.`);
        })
    } else {
        console.error("SSL certificate not found. Make sure to place the key.pem and crt.pem in the folder ssl_certificate. If you don't want to use SSL encryption, set the environment variable HTTPS=false .")
    }
    
} else {
    expressServer = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT} without SSL certificate.`);
    })
}

// Create the websocket
const wss = new Websocket.WebSocketServer({server: expressServer, path: "/ws"});
wss.on("connection", websocketController.onConnection);