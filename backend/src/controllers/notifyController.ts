import axios from "axios";
import { GOTIFY_CONFIG } from "../config";
import { LogLevel, loggingController } from "./loggingController";

const GOTIFY_URL = process.env.GOTIFY_URL || GOTIFY_CONFIG.URL;
const GOTIFY_TOKEN = process.env.GOTIFY_TOKEN || GOTIFY_CONFIG.TOKEN;

const sendNotification = (title: string, message: string) => {
    if (GOTIFY_URL !== undefined && GOTIFY_TOKEN !== undefined) {
        axios.post(GOTIFY_URL+"/message?token="+GOTIFY_TOKEN,{
            title: title,
            message: message,
            priority: 10,
            extras: {
                "client::notification": {
                    "click": { "url": "https://secured-smart-home.de:54000" }
                }
            }           
        }).then((value) => {
            if (value.status !== 200) {
                loggingController.createLog(undefined,LogLevel.WARN,`Error on gotify post message (Status: ${value.status}, Message: ${value.statusText})`);
            }
        })
    }
}

export const notifyController = {
    sendNotification
}