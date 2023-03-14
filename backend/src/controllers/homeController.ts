import fetch from 'cross-fetch';
import fs from 'fs';
import path from 'path';
import axios from "../utils/axios";


// Read out the room configuration from the data-folder
let roomsFile = fs.readFileSync(path.resolve(__dirname, "../../data/rooms.json"));
let roomsRoot = JSON.parse(roomsFile.toString());
for (var key in roomsRoot["rooms"]) {
    if (roomsRoot["rooms"].hasOwnProperty(key)) {
        let node = roomsRoot["rooms"][key]; 

        let roomFile = fs.readFileSync(path.resolve(__dirname, `../../data/rooms/${key}/devices.json`));
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
        })
        .catch(function (error) {
            // handle error
            //console.log(error);
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
                })
                .catch(function (error) {
                    // handle error
                    //console.log(error);
                });
            }
        }
    }
}

const getRooms = (req,res) => {
    res.status(200).send(roomsRoot);
}

const getDevices = (req,res) => {
    res.status(200).send(roomsRoot["rooms"][req.params.id]);
}

const switchDevice = async (req,res) => {
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
}

const updateDevice = async (req,res) => {
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
}

export const homeController = {
    getRooms,
    getDevices,
    switchDevice,
    updateDevice
}