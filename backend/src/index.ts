import fetch from 'cross-fetch';
import fs from 'fs';
import path from 'path';

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

let roomsFile = fs.readFileSync(path.resolve(__dirname, "../data/rooms.json"));
let roomsRoot = JSON.parse(roomsFile.toString());
for (var key in roomsRoot["rooms"]) {
    if (roomsRoot["rooms"].hasOwnProperty(key)) {
        let node = roomsRoot["rooms"][key]; 

        let roomFile = fs.readFileSync(path.resolve(__dirname, `../data/rooms/${key}/devices.json`));
        let roomRoot = JSON.parse(roomFile.toString());

        node.devices = roomRoot["devices"];
        node.devicesCount = Object.keys(roomRoot["devices"]).length;
    }
}

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;

app.use(express.json());

app.listen(PORT, () => {
    console.log(`REST API listens on port ${PORT}`)
})

app.get(ENDPOINTS.HEALTH, (req, res) => {
    res.status(200).send(true);
});

app.get(ENDPOINTS.ON, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=true`)
    res.status(200).send(true);
})

app.get(ENDPOINTS.OFF, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=false`)
    res.status(200).send(true);
})

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
        await fetch(`http://192.168.2.120:8087/set/${device.datapoint}?value=${!device.switch}`);
        device.switch = !device.switch;
        console.log(device);
        res.status(200).send();
    } else {
        res.status(500).send();
    }
})