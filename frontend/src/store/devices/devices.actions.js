import {
  FETCH_DEVICES_START,
  FETCH_DEVICES_SUCCESS,
  FETCH_DEVICES_FAILED,
  FETCH_DEVICES_UPDATED,
  TOGGLE_DEVICE_SWITCH_START,
  TOGGLE_DEVICE_SWITCH_SUCCESS,
  TOGGLE_DEVICE_SWITCH_FAILED,
  UPDATE_DEVICE_CONTROL_VALUE_START,
  UPDATE_DEVICE_CONTROL_VALUE_SUCCESS,
  UPDATE_DEVICE_CONTROL_VALUE_FAILED
} from "./devices.actiontypes";
import {
  getRoomDevicesApi,
  toggleDeviceSwitchApi,
  updateDeviceControlValueApi
} from "../../utils/api/devices.api";
import { showErrorModal } from "../ui/ui.actions";
import { logout } from "../auth/auth.actions";

/** Fetching Room Devices Actions */
export const fetchRoomDevices = roomId => dispatch => {
  dispatch(fetchRoomDevicesStart());

  getRoomDevicesApi(roomId)
    .then(response => dispatch(fetchRoomDevicesSuccess(roomId,response.data.devices)))
    .catch(error => {
      if (error.response.status === 401) {
        dispatch(logout());
        const errorResponse = {
          message: "Dein Zugriff ist abgelaufen, bitte logge dich erneut ein."
        };
        dispatch(showErrorModal(errorResponse))
        return;
      }

      // This to mock an error response
      const errorResponse = {
        message: "Fehler beim Abrufen der Geräte im Raum."
      };
      
      dispatch(fetchRoomDevicesFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const fetchRoomDevicesUpdate = (roomId,devices) => dispatch => {
  console.log("dispatched");
  dispatch(fetchRoomDevicesUpdated(roomId,devices));
};

export const fetchRoomDevicesStart = () => ({
  type: FETCH_DEVICES_START
});

export const fetchRoomDevicesSuccess = (roomId,devices) => ({
  type: FETCH_DEVICES_SUCCESS,
  payload: {
    roomId: roomId,
    devices: devices
  }
});

export const fetchRoomDevicesFailed = error => ({
  type: FETCH_DEVICES_FAILED,
  payload: {
    error
  }
});

export const fetchRoomDevicesUpdated = (roomId,devices) => ({
  type: FETCH_DEVICES_UPDATED,
  payload: {
    roomId: roomId,
    devices: devices
  }
});

/** Device Switch Toggle Actions */
export const toggleDeviceSwitch = controlData => dispatch => {
  dispatch(toggleDeviceSwitchStart());

  const payload = {
    deviceId: controlData.deviceId,
    newValue: controlData.newValue
  };

  console.log(payload);

  toggleDeviceSwitchApi(payload)
    .then(response => dispatch(toggleDeviceSwitchSuccess(response.data.device)))
    .catch(error => {
      console.log(error);
      if (error.response.status === 401) {
        dispatch(logout());
        const errorResponse = {
          message: "Dein Zugriff ist abgelaufen, bitte logge dich erneut ein."
        };
        dispatch(showErrorModal(errorResponse))
        return;
      }

      // This to mock an error response
      const errorResponse = {
        message: "Fehler beim Umschalten des Gerätes."
      };

      dispatch(toggleDeviceSwitchFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const toggleDeviceSwitchStart = () => ({
  type: TOGGLE_DEVICE_SWITCH_START
});

export const toggleDeviceSwitchSuccess = device => ({
  type: TOGGLE_DEVICE_SWITCH_SUCCESS,
  payload: {
    ...device
  }
});

export const toggleDeviceSwitchFailed = error => ({
  type: TOGGLE_DEVICE_SWITCH_FAILED,
  payload: {
    error
  }
});

/** Updating Control Value Handler */
export const updateDeviceControlValue = controlData => dispatch => {
  
  const payload = {
    deviceId: controlData.deviceId,
    controlId: controlData.controlId,
    newValue: controlData.newValue
  };

  dispatch(updateDeviceControlValueStart());

  updateDeviceControlValueApi(payload)
    .then(response => dispatch(updateDeviceControlSuccess(response.data.control)))
    .catch(error => {
      console.log(error);
      if (error.response.status === 401) {
        dispatch(logout());
        const errorResponse = {
          message: "Dein Zugriff ist abgelaufen, bitte logge dich erneut ein."
        };
        dispatch(showErrorModal(errorResponse))
        return;
      }

      // This to mock an error response
      const errorResponse = {
        message: "Fehler beim Einstellen des Gerätes."
      };

      dispatch(updateDeviceControlValueFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const updateDeviceControlValueStart = () => ({
  type: UPDATE_DEVICE_CONTROL_VALUE_START
});

export const updateDeviceControlSuccess = control => ({
  type: UPDATE_DEVICE_CONTROL_VALUE_SUCCESS,
  payload: {
    ...control
  }
});

export const updateDeviceControlValueFailed = error => ({
  type: UPDATE_DEVICE_CONTROL_VALUE_FAILED,
  payload: {
    error
  }
});
