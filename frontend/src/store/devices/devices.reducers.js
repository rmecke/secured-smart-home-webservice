import {
  FETCH_DEVICES_START,
  FETCH_DEVICES_SUCCESS,
  FETCH_DEVICES_FAILED,
  FETCH_DEVICES_UPDATED,
  UPDATE_DEVICE_CONTROL_VALUE_START,
  UPDATE_DEVICE_CONTROL_VALUE_SUCCESS,
  UPDATE_DEVICE_CONTROL_VALUE_FAILED,
  TOGGLE_DEVICE_SWITCH_START,
  TOGGLE_DEVICE_SWITCH_SUCCESS,
  TOGGLE_DEVICE_SWITCH_FAILED
} from "./devices.actiontypes";

const initialState = {
  devices: {},
  roomId: ""
};

export default (state = initialState, { type, payload }) => {
  switch (type) {
    // Devices
    case FETCH_DEVICES_START:
      return {
        ...state,
        devices: {}
      };
    case FETCH_DEVICES_SUCCESS:
      return {
        ...state,
        roomId: payload.roomId,
        devices: payload.devices
      };
    case FETCH_DEVICES_FAILED:
      return { ...state };
    case FETCH_DEVICES_UPDATED:
      if (state.roomId == payload.roomId) {
        return {
          ...state,
          roomId: payload.roomId,
          devices: payload.devices
        };
      } else {
        return { ...state };
      }

    //Device Switch
    case TOGGLE_DEVICE_SWITCH_START:
      return { ...state };
    case TOGGLE_DEVICE_SWITCH_SUCCESS:
      return {
        ...state,
        devices: {
          ...state.devices,
          [payload.deviceId]: {
            ...state.devices[payload.deviceId],
            switch: payload.newValue
          }
        }
      };
    case TOGGLE_DEVICE_SWITCH_FAILED:
      return { ...state };

    // Controls Values
    case UPDATE_DEVICE_CONTROL_VALUE_START:
      return { ...state };
    case UPDATE_DEVICE_CONTROL_VALUE_SUCCESS:
      return {
        ...state,
        devices: {
          ...state.devices,
          [payload.deviceId]: {
            ...state.devices[payload.deviceId],
            controls: {
              ...state.devices[payload.deviceId].controls,
              [payload.controlId]: {
                ...state.devices[payload.deviceId].controls[payload.controlId],
                value: payload.newValue
              }
            }
          }
        }
      };
    case UPDATE_DEVICE_CONTROL_VALUE_FAILED:
      return { ...state };
    default:
      return state;
  }
};
