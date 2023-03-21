import { AXIOS_CONFIG } from "../../config/axiosConfig";
import { fetchRoomDevicesUpdate } from "../../store/devices/devices.actions";
import { store } from "../..";

// The process.env.REACT_APP_AXIOS_URL will be replaced with the actual environment value of deployment by React on frontend server startup.
const AXIOS_URL = process.env.REACT_APP_AXIOS_URL || AXIOS_CONFIG.URL;
const WS_URL = AXIOS_URL.replace("http:","ws:").replace("https:","wss:");

let ws = null;

export const openWebSocket = (accessToken) => {
    if (ws) {
        ws.close();
    }

    console.log(`${WS_URL}/ws?token=`+accessToken);
    ws = new WebSocket(`${WS_URL}/ws?token=`+accessToken);

    ws.onopen = (event) => {
        console.log("WebSocket connection established.");
    }

    ws.onmessage = (event) => {
        let data = JSON.parse(event.data);
        console.log(data);

        if (data.type == "devicesUpdate") {
            console.log("to be dispatched");
            store.dispatch(fetchRoomDevicesUpdate(data.roomId,data.devices));
        }
    }
}

export const closeWebSocket = () => {
    
}