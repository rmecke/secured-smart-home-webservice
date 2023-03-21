import { openWebSocket } from "../../utils/api/websocket";
import {
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT_SUCCESS,
} from "./auth.actiontypes";

const user = JSON.parse(localStorage.getItem("user"));

const initialState = user 
  ? {isLoggedIn: true, user}
  : {isLoggedIn: false, user: null};

if (initialState.isLoggedIn && initialState.user && initialState.user.accessToken) {
  openWebSocket(initialState.user.accessToken);
}

export default (state = initialState, { type, payload }) => {
  switch (type) {
    case REGISTER_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
      };

    case REGISTER_FAILED:
      return {
        ...state,
        isLoggedIn: false,
      };

    case LOGIN_SUCCESS:
      if (payload.user && payload.user.accessToken) {
        openWebSocket(payload.user.accessToken);
      }
      return {
        ...state,
        isLoggedIn: true,
        user: payload.user
      };
    case LOGIN_FAILED:
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    case LOGOUT_SUCCESS:
      return {
        ...state,
        isLoggedIn: false,
        user: null
      };
    default:
      return state;
  }
};
