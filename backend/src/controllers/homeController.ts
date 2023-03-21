import fetch from 'cross-fetch';
import fs from 'fs';
import path from 'path';
import { WEBSOCKET_CONFIG } from '../config';
import { IoBrokerSocket } from '../utils/iobroker';
import axios from "../utils/axios";
import { IControl, IDatapoint, IDevice, IRoom } from 'src/interfaces';

const WEBSOCKET_URL = process.env.WEBSOCKET_URL || WEBSOCKET_CONFIG.URL;

function delay(ms: number) {
    return new Promise( resolve => setTimeout(resolve, ms) );
}

let allDatapoints: Array<IDatapoint> = new Array<IDatapoint>(0);
let iobroker: IoBrokerSocket = null;
let roomsRoot = null;

// First, we enable the connection to iobroker through a WebSocket
retrieveRoomData();
async function retrieveRoomData() {
    let connOptions = {
        name:                   'webservice', // optional - default 'vis.0', used to distinguish connections in socket-io adapter.
        connLink:               WEBSOCKET_URL,  // optional - URL of the socket.io adapter. By default it is same URL where the WEB server is. 
        socketSession:          'nokey',                       // optional - default 'nokey', and used by authentication,
        socketForceWebSockets:  false
    };
    
    const onUpdate = (id,state) => {
        let index = allDatapoints.findIndex((x) => {return x.id == id});

        if (index >= 0) {
            console.log(`\x1b[36m${id}\x1b[0m: ${state.val}`);

            if (allDatapoints[index].controlKey) {
                let node: IControl = roomsRoot["rooms"][allDatapoints[index].roomKey]["devices"][allDatapoints[index].deviceKey]["controls"][allDatapoints[index].controlKey];
                node.value = state.val;
            } else {
                let node: IDevice = roomsRoot["rooms"][allDatapoints[index].roomKey]["devices"][allDatapoints[index].deviceKey];
                node.switch = state.val;
            }
        }
    }
    
    let connCallbacks = {
        onConnChange:   function (isConnected) {console.log("Connection Changed.");}, // optional - called if connection state changed.
        onObjectChange: function (id, obj)     {console.log("Object Changed.");}, // optional - called if content of some object is changed, new object created or object was deleted (obj = null)
        onUpdate:       onUpdate, // optional - called if state of some object is changed, new state for object is created or state was deleted (state = null)
        onError:        function (error)       {console.log("Error.");}  // optional - called if some error occurs
    };
    
    // For documentation of iobroker socket commands, visit: https://github.com/ioBroker/ioBroker.socketio#usage
    iobroker = new IoBrokerSocket(connOptions,connCallbacks,false,true);
    
    // Waiting logic to ensure, that the connection is established before making requests to iobroker
    while(!iobroker.getIsConnected()) {
        // Loop until socket is connected
        console.log("Checking websocket connection...");
        await delay(1000);
    }
    console.log("Websocket connected: ", iobroker.getIsConnected());
    
    // Next, we read out the room configuration from the data-folder
    let roomsFile = fs.readFileSync(path.resolve(__dirname, "../../data/rooms.json"));
    roomsRoot = JSON.parse(roomsFile.toString());
    for (var roomKey in roomsRoot["rooms"]) {
        if (roomsRoot["rooms"].hasOwnProperty(roomKey)) {
            let node: IRoom = roomsRoot["rooms"][roomKey]; 
    
            let roomFile = fs.readFileSync(path.resolve(__dirname, `../../data/rooms/${roomKey}/devices.json`));
            let roomRoot = JSON.parse(roomFile.toString());
    
            node.devices = roomRoot["devices"];
            node.devicesCount = Object.keys(roomRoot["devices"]).length;
    
            for (var deviceKey in node.devices) {
                retrieveDeviceValues(node.devices[deviceKey],roomKey,deviceKey);
            }
        }
    }
}

// Retrieve actual value of device and controls from smart home
async function retrieveDeviceValues(device,roomKey,deviceKey) {
    if (device.datapoint) {
        allDatapoints.push({
            id: device.datapoint,
            roomKey: roomKey,
            deviceKey: deviceKey,
        });

        iobroker.getStates([device.datapoint], (error,states) => {
            if (error) {
                console.error("Error retrieving data point",device.datapoint,error);
                return;
            }

            device.switch = states[device.datapoint].val;
            console.log(`\x1b[36m${device.datapoint}\x1b[0m: ${device.switch}`);
        })

        /*await axios.get(`/getPlainValue/${device.datapoint}`)
        .then(function (response) {
            // handle success
            
        })
        .catch(function (error) {
            // handle error
            //console.log(error);
        });*/
    }

    if (device.controls) {
        for (var controlKey in device.controls) {
            let control = device.controls[controlKey];
            if (control.datapoint) {
                allDatapoints.push({
                    id: control.datapoint,
                    roomKey: roomKey,
                    deviceKey: deviceKey,
                    controlKey: controlKey
                });

                iobroker.getStates([control.datapoint], (error,states) => {
                    if (error) {
                        console.error("Error retrieving data point",control.datapoint,error);
                        return;
                    }
        
                    control.value = states[control.datapoint].val;
                    console.log(`\x1b[36m${control.datapoint}\x1b[0m: ${control.value}`);
                })
                /*await axios.get(`/getPlainValue/${control.datapoint}`)
                .then(function (response) {
                    // handle success
                    console.log(`device ${control.name}: ${JSON.stringify(response.data)}`);
                    control.value = response.data;
                })
                .catch(function (error) {
                    // handle error
                    //console.log(error);
                });*/
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

        iobroker.setState(device.datapoint,!device.switch, (error) => {
            if (error) {
                res.status(500).send();
            } else {
                device.switch = !device.switch;
                res.status(200).send();
            }
        })

        /*await axios.get(`/set/${device.datapoint}?value=${!device.switch}`)
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
        }*/
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

            iobroker.setState(control.datapoint,req.body.control.newValue, (error) => {
                if (error) {
                    res.status(500).send();
                } else {
                    control.value=req.body.control.newValue;
                    res.status(200).send();
                }
            })

            /*await axios.get(`/set/${control.datapoint}?value=${req.body.control.newValue}`)
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
            }*/
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