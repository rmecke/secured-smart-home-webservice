import fetch from 'cross-fetch';
import fs from 'fs';
import path from 'path';
import axios from "./utils/axios";

// Read out the room configuration from the data-folder
let roomsFile = fs.readFileSync(path.resolve(__dirname, "../data/rooms.json"));
let roomsRoot = JSON.parse(roomsFile.toString());
for (var key in roomsRoot["rooms"]) {
    if (roomsRoot["rooms"].hasOwnProperty(key)) {
        let node = roomsRoot["rooms"][key]; 

        let roomFile = fs.readFileSync(path.resolve(__dirname, `../data/rooms/${key}/devices.json`));
        let roomRoot = JSON.parse(roomFile.toString());

        node.devices = roomRoot["devices"];
        node.devicesCount = Object.keys(roomRoot["devices"]).length;

        for (var deviceKey in node.devices) {
            retrieveDeviceValues(node.devices[deviceKey]);
        }
    }
}

// Retrieve actual value of device and controls from smart home
async function retrieveDeviceValues(device) {
    if (device.datapoint) {
        await axios.get(`/getPlainValue/${device.datapoint}`)
        .then(function (response) {
            // handle success
            console.log(`device ${device.name}: ${JSON.stringify(response.data)}`);
            device.switch = response.data;
        });
    }

    if (device.controls) {
        for (var controlKey in device.controls) {
            let control = device.controls[controlKey];
            if (control.datapoint) {
                await axios.get(`/getPlainValue/${control.datapoint}`)
                .then(function (response) {
                    // handle success
                    console.log(`device ${control.name}: ${JSON.stringify(response.data)}`);
                    control.value = response.data;
                });
            }
        }
    }
}

console.log(JSON.stringify(roomsRoot))

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
    console.log(`REST API listens on port ${PORT}`)
})

app.get(ENDPOINTS.HEALTH, (req, res) => {
    res.status(200).send(true);
});

app.get(ENDPOINTS.OPEN, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.open?value=true`)
    res.status(200).send(true);
})

app.get(ENDPOINTS.CLOSE, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.close?value=true`)
    res.status(200).send(true);
})

app.get("/rooms", async (req, res) => {
    res.status(200).send(roomsRoot);
})

app.get('/rooms/:id/devices', async (req, res) => {
    res.status(200).send(roomsRoot["rooms"][req.params.id]);
})

app.patch('/switch', async (req, res) => {
    console.log("/switch: "+JSON.stringify(req.body));

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
        let success: boolean;

        await axios.get(`/set/${device.datapoint}?value=${!device.switch}`)
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
        } else {
            res.status(500).send();
        }
    } else {
        res.status(400).send();
    }
})

app.patch('/update', async (req, res) => {
    console.log("/update: "+JSON.stringify(req.body));

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
            let success: boolean;

            await axios.get(`/set/${control.datapoint}?value=${req.body.control.newValue}`)
            .then(function (response) {
                // handle success
                success = true;
            })
            .catch(function (error) {
                // handle error
                success = false;
            });

            if (success) {
                control.value=req.body.control.newValue;
                res.status(200).send();
            } else {
                res.status(500).send();
            }
        } else {
            res.status(400).send();
        }   
    } else {
        res.status(400).send();
    }
})