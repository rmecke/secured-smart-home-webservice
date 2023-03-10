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
const axios_1 = __importDefault(require("./utils/axios"));
// Read out the room configuration from the data-folder
let roomsFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, "../data/rooms.json"));
let roomsRoot = JSON.parse(roomsFile.toString());
for (var key in roomsRoot["rooms"]) {
    if (roomsRoot["rooms"].hasOwnProperty(key)) {
        let node = roomsRoot["rooms"][key];
        let roomFile = fs_1.default.readFileSync(path_1.default.resolve(__dirname, `../data/rooms/${key}/devices.json`));
        let roomRoot = JSON.parse(roomFile.toString());
        node.devices = roomRoot["devices"];
        node.devicesCount = Object.keys(roomRoot["devices"]).length;
        for (var deviceKey in node.devices) {
            retrieveDeviceValues(node.devices[deviceKey]);
        }
    }
}
// Retrieve actual value of device and controls from smart home
function retrieveDeviceValues(device) {
    return __awaiter(this, void 0, void 0, function* () {
        if (device.datapoint) {
            yield axios_1.default.get(`/getPlainValue/${device.datapoint}`)
                .then(function (response) {
                // handle success
                console.log(`device ${device.name}: ${JSON.stringify(response.data)}`);
                device.switch = response.data;
            })
                .catch(function (error) {
                // handle error
                console.log(error);
            });
        }
        if (device.controls) {
            for (var controlKey in device.controls) {
                let control = device.controls[controlKey];
                if (control.datapoint) {
                    yield axios_1.default.get(`/getPlainValue/${control.datapoint}`)
                        .then(function (response) {
                        // handle success
                        console.log(`device ${control.name}: ${JSON.stringify(response.data)}`);
                        control.value = response.data;
                    })
                        .catch(function (error) {
                        // handle error
                        console.log(error);
                    });
                }
            }
        }
    });
}
console.log(JSON.stringify(roomsRoot));
// Start and configure the REST API
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
const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;
app.use(express.json());
app.listen(PORT, () => {
    console.log(`REST API listens on port ${PORT}`);
});
app.get(ENDPOINTS.HEALTH, (req, res) => {
    res.status(200).send(true);
});
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
    console.log("/switch: " + JSON.stringify(req.body));
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
        let success;
        yield axios_1.default.get(`/set/${device.datapoint}?value=${!device.switch}`)
            .then(function (response) {
            // handle success
            success = true;
        })
            .catch(function (error) {
            // handle error
            success = false;
        });
        if (success) {
            device.switch = !device.switch;
            res.status(200).send();
        }
        else {
            res.status(500).send();
        }
    }
    else {
        res.status(400).send();
    }
}));
app.patch('/update', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("/update: " + JSON.stringify(req.body));
    let device;
    for (var key in roomsRoot["rooms"]) {
        if (roomsRoot["rooms"].hasOwnProperty(key)) {
            let node = roomsRoot["rooms"][key];
            if (node["devices"][req.body.control.deviceId]) {
                device = node["devices"][req.body.control.deviceId];
            }
        }
    }
    if (device) {
        let control = device["controls"][req.body.control.controlId];
        if (control) {
            let success;
            yield axios_1.default.get(`/set/${control.datapoint}?value=${req.body.control.newValue}`)
                .then(function (response) {
                // handle success
                success = true;
            })
                .catch(function (error) {
                // handle error
                success = false;
            });
            if (success) {
                control.value = req.body.control.newValue;
                res.status(200).send();
            }
            else {
                res.status(500).send();
            }
        }
        else {
            res.status(400).send();
        }
    }
    else {
        res.status(400).send();
    }
}));
