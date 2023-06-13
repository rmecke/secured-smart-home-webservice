"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const config_1 = require("../config");
const https_1 = __importDefault(require("https"));
const AXIOS_URL = process.env.AXIOS_URL || config_1.AXIOS_CONFIG.URL;
console.log("AXIOS_URL: " + AXIOS_URL);
const instance = axios_1.default.create({
    baseURL: AXIOS_URL,
    httpsAgent: new https_1.default.Agent({ rejectUnauthorized: false })
});
exports.default = instance;
