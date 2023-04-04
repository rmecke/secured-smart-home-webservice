import url from 'url';
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from '../config';

var wsClients = [];
const AUTH_SECRET_ACCESS = process.env.AUTH_SECRET_ACCESS || AUTH_CONFIG.SECRET_ACCESS;
const AUTH_SECRET_REFRESH = process.env.AUTH_SECRET_REFRESH || AUTH_CONFIG.SECRET_REFRESH;

/**
 * Check if jwt token of client is valid. If not, close the websocket connection.
 * @param ws 
 * @param req 
 */
const onConnection = (ws, req) => {
    var token: any = url.parse(req.url,true).query.token;
    console.log("connection established",token);

    jwt.verify(token, AUTH_SECRET_ACCESS, (err, decoded) => {
        if (err) {
            ws.close();
            return;
        }

        wsClients[token] = ws;
        var wsUserId = decoded.id;

        console.log("connection verified",wsUserId);
    });
}

/**
 * Send the updated room data to the client.
 * @param roomId 
 * @param devices 
 */
const sendDevicesUpdate = (roomId, devices) => {
    for (const [token, client] of Object.entries(wsClients)) {
        console.log("sendDevicesUpdate:token:"+token);
        jwt.verify(token, AUTH_SECRET_ACCESS, (err, decoded) => {
            if (err) {
                client.send(JSON.stringify({type:"authError", message: "Token expired."}));
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