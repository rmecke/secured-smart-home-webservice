import url from 'url';
import jwt from "jsonwebtoken";
import { AUTH_CONFIG } from '../config';
import { LogLevel, loggingController } from './loggingController';
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
    loggingController.createLog(undefined, LogLevel.DEBUG,`Websocket connection established. Verification requested.`);

    jwt.verify(token, AUTH_SECRET_ACCESS, (err, decoded) => {
        if (err) {
            ws.close();
            return;
        }

        wsClients[token] = ws;

        loggingController.createLog(decoded.id, LogLevel.INFO,`Websocket connection established and verified.`);
    });
}

/**
 * Send the updated room data to all clients.
 * @param roomId 
 * @param devices 
 */
const sendDevicesUpdate = (roomId, devices) => {
    loggingController.createLog(undefined, LogLevel.DEBUG,`Send updated devices for room ${roomId} to all WebSocket clients.`);

    for (const [token, client] of Object.entries(wsClients)) {
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