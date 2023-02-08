"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fastify_1 = __importDefault(require("fastify"));
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const dotenv_1 = __importDefault(require("dotenv"));
const crypto_1 = __importDefault(require("crypto"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const fs = __importStar(require("node:fs"));
dotenv_1.default.config();
fs.readFileSync;
const CONFIG = {
    RESPONSE_STRATEGY: "jwt",
    DISCORD_REDIRECT: "https://nhl.itsspencer.de/test.html",
    PORT: "8080",
    CLIENT_SECRET: "swNQq0QsSBqO_Du20rbjvtjUu2DrvdF5",
    CLIENT_ID: "1060722863084154960"
};
const oAuthURL = `https://discord.com/api/oauth2/authorize?client_id=` +
    `VAR_CLIENT_ID` +
    `&redirect_uri=` +
    `VAR_REDIRECT_URI` +
    `&response_type=code&scope=identify`;
const WebServer = (0, fastify_1.default)({
    /*https: {
        key: fs.readFileSync("/etc/letsencrypt/live/itsspencer.de-0001/privkey.pem"),
        cert: fs.readFileSync("/etc/letsencrypt/live/itsspencer.de-0001/fullchain.pem")
    },*/
    logger: true,
});
const ENDPOINTS = {
    DEFAULT: '/',
    AUTH: '/auth',
    URL: '/url',
    URL_REDIRECT: '/url/redirect',
    USER: '/user/:state',
    HEALTH: '/health',
};
if (typeof CONFIG.DISCORD_REDIRECT === 'undefined') {
    console.error(`Failed to get DISCORD_REDIRECT from environment variables.`);
    process.exit(1);
}
if (typeof CONFIG.CLIENT_SECRET === 'undefined') {
    console.error(`Failed to get CLIENT_SECRET from environment variables.`);
    process.exit(1);
}
if (typeof CONFIG.CLIENT_ID === 'undefined') {
    console.error(`Failed to get CLIENT_ID from environment variables.`);
    process.exit(1);
}
//const DISCORD_REDIRECT = `${CONFIG.DISCORD_REDIRECT}${ENDPOINTS.AUTH}`;
const DISCORD_REDIRECT = `${CONFIG.DISCORD_REDIRECT}`;
const PORT = CONFIG.PORT ? parseInt(CONFIG.PORT) : 5555;
const CLIENT_SECRET = CONFIG.CLIENT_SECRET;
const CLIENT_ID = CONFIG.CLIENT_ID;
const RESPONSE_STRATEGY = CONFIG.RESPONSE_STRATEGY ? CONFIG.RESPONSE_STRATEGY : 'json';
// remove from here once jwt is established and move jwt data to... jwt...
let users = {};
let sessionSecret;
/**
 * Constructs a safe URL for authorization.
 *
 * @return {string}
 */
function getURL() {
    return oAuthURL.replace('VAR_CLIENT_ID', CLIENT_ID).replace('VAR_REDIRECT_URI', encodeURI(DISCORD_REDIRECT));
}
WebServer.get(ENDPOINTS.DEFAULT, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    reply.type('application/json').code(200);
    return { status: true };
}));
WebServer.get(ENDPOINTS.AUTH, (request, reply) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("ENDPOINT AUTH...");
    reply.header("Access-Control-Allow-Origin", "https://nhl.itsspencer.de");
    reply.header("Access-Control-Allow-Methods", "GET");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    const { code, state } = request.query;
    if (typeof code === 'undefined' || typeof state === 'undefined') {
        reply.type('application/json').code(401);
        return { status: false, message: 'Code and state for authentication were not provided.' };
    }
    let oAuthData;
    try {
        const tokenResponseData = yield (0, cross_fetch_1.default)('https://discord.com/api/oauth2/token', {
            method: 'POST',
            body: new URLSearchParams({
                client_id: CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                redirect_uri: DISCORD_REDIRECT,
                scope: 'identify',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
        oAuthData = yield tokenResponseData.json();
    }
    catch (error) {
        reply.type('application/json').code(401);
        return { status: false, message: 'Authentication credentials were missing or incorrect' };
    }
    if (typeof oAuthData === 'undefined') {
        reply.type('application/json').code(401);
        return { status: false, message: 'Authentication credentials were missing or incorrect' };
    }
    const userResult = yield (0, cross_fetch_1.default)('https://discord.com/api/users/@me', {
        headers: {
            authorization: `${oAuthData.token_type} ${oAuthData.access_token}`,
        },
    });
    if (!userResult.ok) {
        reply.type('application/json').code(401);
        return { status: false, message: 'Authorization token must have expired.' };
    }
    const user = yield userResult.json();
    if (typeof user === 'undefined') {
        reply.type('application/json').code(401);
        return { status: false, message: 'Authorization token must have expired.' };
    }
    if (RESPONSE_STRATEGY === 'json') {
        users[state] = user;
        reply.type('application/json').code(200);
        return { status: true, message: 'Authorization Complete!' };
    }
    // When the JWT token is returned.
    // The developer should set the JWT token to a same site cookie.
    // Set-Cookie: jwt=some_jwt; SameSite=Strict; Secure
    return { status: true, jwt: jsonwebtoken_1.default.sign(user, sessionSecret) };
}));
WebServer.get(ENDPOINTS.URL, (request, reply) => {
    console.log("REQUEST FOR URL...");
    reply.type('application/json').code(200);
    reply.header("Access-Control-Allow-Origin", "https://nhl.itsspencer.de");
    reply.header("Access-Control-Allow-Methods", "GET");
    reply.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return { url: getURL() };
});
WebServer.get(ENDPOINTS.URL_REDIRECT, (request, reply) => {
    let { state } = request.query;
    if (!state) {
        state = `${Math.floor(Math.random() * Number.MAX_SAFE_INTEGER)}`;
    }
    reply.type('redirect');
    reply.redirect(`${getURL()}&state=${state}`);
});
WebServer.get(ENDPOINTS.USER, {
    schema: {
        params: {
            type: 'object',
            additionalProperties: false,
            required: ['state'],
            properties: { state: { type: 'string' } },
        },
    },
}, (request, reply) => {
    let { state } = request.params;
    if (!users[state]) {
        reply.type('application/json').code(401);
        return { status: false, message: 'No user found.' };
    }
    const user = Object.assign({}, users[state]);
    reply.type('application/json').code(200);
    delete users[state];
    return user;
});
WebServer.get(ENDPOINTS.HEALTH, (request, reply) => {
    reply.type('application/json').code(200);
    return true;
});
WebServer.listen({ host: "127.0.0.1", port: PORT }, (err, address) => __awaiter(void 0, void 0, void 0, function* () {
    if (err) {
        throw err;
    }
    sessionSecret = yield new Promise((resolve) => {
        crypto_1.default.randomBytes(48, (err, buff) => {
            resolve(buff.toString('hex'));
        });
    });
    console.log(`Endpoints Created:`);
    Object.keys(ENDPOINTS).forEach((key) => {
        console.log(key);
    });
}));
