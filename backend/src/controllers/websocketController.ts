import url from 'url';
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from '../config';

var wsClients = [];
const AUTH_SECRET = process.env.AUTH_SECRET || AUTH_CONFIG.SECRET;

const onConnection = (ws, req) => {
    var token: any = url.parse(req.url,true).query.token;
    console.log("connection established",req);

    jwt.verify(token, AUTH_SECRET, (err, decoded) => {
        if (err) {
            ws.close();
            return;
        }

        wsClients[token] = ws;
        var wsUserId = decoded.id;

        console.log("connection verified",wsUserId);
    });
}

const sendDevicesUpdate = (roomId, devices) => {
    for (const [token, client] of Object.entries(wsClients)) {
        console.log("message outgoing",roomId,devices);

        jwt.verify(token, AUTH_SECRET, (err, decoded) => {
            if (err) {
                client.send("Error: Token expired.");
                client.close();
            } else {
                client.send(JSON.stringify({type:"devicesUpdate", roomId: roomId, devices:devices}));
            }
        })
    }
}

export const websocketController = {
    onConnection,
    sendDevicesUpdate
}