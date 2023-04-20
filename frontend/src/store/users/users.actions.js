import {
  FETCH_USERS_START,
  FETCH_USERS_SUCCESS,
  FETCH_USERS_FAILED,

  TOGGLE_ROLE_SWITCH_START,
  TOGGLE_ROLE_SWITCH_SUCCESS,
  TOGGLE_ROLE_SWITCH_FAILED,

  DELETE_USER_START,
  DELETE_USER_SUCCESS,
  DELETE_USER_FAILED
} from "../users/users.actiontypes"
import { getUsersApi, toggleRoleSwitchApi, deleteUserApi } from "../../utils/api/admin.api";
import { showErrorModal } from "../ui/ui.actions";
import { logout } from "../auth/auth.actions";

export const fetchUsers = () => dispatch => {
  dispatch(fetchUsersStart());

  getUsersApi()
    .then(response => dispatch(fetchUsersSuccess(response.data.users)))
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
        message: "Fehler beim Abrufen der Nutzer."
      };
      
      dispatch(fetchUsersFailed(errorResponse));
      dispatch(showErrorModal(errorResponse));
    });
};

export const fetchUsersStart = payload => ({
  type: FETCH_USERS_START
});

export const fetchUsersSuccess = users => ({
  type: FETCH_USERS_SUCCESS,
  payload: {
    users
  }
});

export const fetchUsersFailed = error => ({
  type: FETCH_USERS_FAILED,
  payload: {
    error
  }
});

export const toggleRoleSwitch = roleData => dispatch => {
  dispatch(toggleRoleSwitchStart());

  const payload = {
    userId: roleData.userId,
    roleId: roleData.roleId,
    newValue: roleData.newValue
  };

  console.log("roleSwitch:",payload);

  toggleRoleSwitchApi(payload)
    .then(response => dispatch(toggleRoleSwitchSuccess(response.data.user)))
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
        message: "Fehler beim Umschalten der Rolle."
      };

      dispatch(toggleRoleSwitchFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const toggleRoleSwitchStart = () => ({
  type: TOGGLE_ROLE_SWITCH_START
});

export const toggleRoleSwitchSuccess = user => ({
  type: TOGGLE_ROLE_SWITCH_SUCCESS,
  payload: {
    ...user
  }
});

export const toggleRoleSwitchFailed = error => ({
  type: TOGGLE_ROLE_SWITCH_FAILED,
  payload: {
    error
  }
});

export const deleteUser = userId => dispatch => {
  dispatch(toggleRoleSwitchStart());

  const payload = {
    userId: userId,
  };

  deleteUserApi(payload)
    .then(response => dispatch(deleteUserSuccess(response.data.userId)))
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
        message: "Fehler beim Löschen des Benutzers."
      };

      dispatch(deleteUserFailed(errorResponse));
      dispatch(showErrorModal(errorResponse))
    });
};

export const deleteUserStart = () => ({
  type: DELETE_USER_START
});

export const deleteUserSuccess = userId => ({
  type: DELETE_USER_SUCCESS,
  payload: {
    userId: userId
  }
});

export const deleteUserFailed = error => ({
  type: DELETE_USER_FAILED,
  payload: {
    error
  }
});
