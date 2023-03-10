import {
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT_SUCCESS,
} from "./auth.actiontypes";
import {
  loginAPI,
  logoutAPI,
  registerAPI
} from "../../utils/api/auth.api";
import { showErrorModal } from "../ui/ui.actions";

/** login */
export const login = (username, password) => (dispatch) => {
  return loginAPI(username, password).then(
    (data) => {
      dispatch(loginSuccess(data));

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch(loginFailed());

      const errorResponse = {
        message: message
      };
      dispatch(showErrorModal(errorResponse))

      return Promise.reject();
    }
  );
};

export const loginSuccess = (data) => ({
  type: LOGIN_SUCCESS,
  payload: { user: data },
});

export const loginFailed = () => ({
  type: LOGIN_FAILED,
});

/** logout */
export const logout = () => (dispatch) => {
  logoutAPI();

  dispatch(logoutSuccess())
};

export const logoutSuccess = () => ({
  type: LOGOUT_SUCCESS,
});

/** register */
export const register = (username, password) => (dispatch) => {
  return registerAPI(username, password).then(
    (response) => {
      dispatch(registerSuccess());

      const errorResponse = {
        message: response.data.message
      };
      dispatch(showErrorModal(errorResponse))

      return Promise.resolve();
    },
    (error) => {
      const message =
        (error.response &&
          error.response.data &&
          error.response.data.message) ||
        error.message ||
        error.toString();

      dispatch(registerFailed());

      const errorResponse = {
        message: message
      };
      dispatch(showErrorModal(errorResponse))

      return Promise.reject();
    }
  );
};

export const registerSuccess = () => ({
  type: REGISTER_SUCCESS,
});

export const registerFailed = () => ({
  type: REGISTER_FAILED,
});