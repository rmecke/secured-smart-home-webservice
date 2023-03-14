import {
  FETCH_DEVICES_START,
  FETCH_DEVICES_SUCCESS,
  FETCH_DEVICES_FAILED,
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
    .then(response => dispatch(fetchRoomDevicesSuccess(response.data.devices)))
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

export const fetchRoomDevicesStart = () => ({
  type: FETCH_DEVICES_START
});

export const fetchRoomDevicesSuccess = devices => ({
  type: FETCH_DEVICES_SUCCESS,
  payload: {
    devices: devices
  }
});

export const fetchRoomDevicesFailed = error => ({
  type: FETCH_DEVICES_FAILED,
  payload: {
    error
  }
});

/** Device Switch Toggle Actions */
export const toggleDeviceSwitch = deviceId => dispatch => {
  dispatch(toggleDeviceSwitchStart());

  toggleDeviceSwitchApi(deviceId)
    .then(response => dispatch(toggleDeviceSwitchSuccess(response.data.deviceId)))
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
        message: "Fehler beim Umschalten des Gerätes."
      };

      dispatch(toggleDeviceSwitchFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const toggleDeviceSwitchStart = () => ({
  type: TOGGLE_DEVICE_SWITCH_START
});

export const toggleDeviceSwitchSuccess = deviceId => ({
  type: TOGGLE_DEVICE_SWITCH_SUCCESS,
  payload: {
    deviceId
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
