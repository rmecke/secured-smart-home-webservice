import {
  REGISTER_SUCCESS,
  REGISTER_FAILED,
  LOGIN_SUCCESS,
  LOGIN_FAILED,
  LOGOUT_START,
} from "./auth.actiontypes";

import { showErrorModal } from "../ui/ui.actions";

export const register = (username, password) => dispatch => {
  const errorResponse = {
    message: "Error while registering"
  };
  
  dispatch(showErrorModal(errorResponse))
};