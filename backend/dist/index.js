"use strict";
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
const cross_fetch_1 = __importDefault(require("cross-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
var express = require("express");
var cors = require('cors');
var app = express();
app.use(cors());
const ENDPOINTS = {
    DEFAULT: '/',
    HEALTH: '/health',
    ON: "/on",
    OFF: "/off",
    OPEN: "/open",
    CLOSE: "/close",
};
let roomsFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../data/rooms.json"));
let roomsRoot = JSON.parse(roomsFile.toString());
for (var key in roomsRoot["rooms"]) {
    if (roomsRoot["rooms"].hasOwnProperty(key)) {
        let node = roomsRoot["rooms"][key];
        let roomFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, `../data/rooms/${key}/devices.json`));
        let roomRoot = JSON.parse(roomFile.toString());
        node.devices = roomRoot["devices"];
        node.devicesCount = Object.keys(roomRoot["devices"]).length;
    }
}
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;
app.use(express.json());
app.listen(PORT, () => {
    console.log(`REST API listens on port ${PORT}`);
});
app.get(ENDPOINTS.HEALTH, (req, res) => {
    res.status(200).send(true);
});
app.get(ENDPOINTS.ON, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cross_fetch_1.default)(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=true`);
    res.status(200).send(true);
}));
app.get(ENDPOINTS.OFF, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cross_fetch_1.default)(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=false`);
    res.status(200).send(true);
}));
app.get(ENDPOINTS.OPEN, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cross_fetch_1.default)(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.open?value=true`);
    res.status(200).send(true);
}));
app.get(ENDPOINTS.CLOSE, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    yield (0, cross_fetch_1.default)(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.close?value=true`);
    res.status(200).send(true);
}));
app.get("/rooms", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(roomsRoot);
}));
app.get('/rooms/:id/devices', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.status(200).send(roomsRoot["rooms"][req.params.id]);
}));
app.patch('/switch', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let device;
    for (var key in roomsRoot["rooms"]) {
        if (roomsRoot["rooms"].hasOwnProperty(key)) {
            let node = roomsRoot["rooms"][key];
            if (node["devices"][req.body.deviceId]) {
                device = node["devices"][req.body.deviceId];
            }
        }
    }
    if (device) {
        yield (0, cross_fetch_1.default)(`http://192.168.2.120:8087/set/${device.datapoint}?value=${!device.switch}`);
        device.switch = !device.switch;
        console.log(device);
        res.status(200).send();
    }
    else {
        res.status(500).send();
    }
}));
