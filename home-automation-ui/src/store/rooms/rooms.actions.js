import {
  FETCH_ROOMS_START,
  FETCH_ROOMS_SUCCESS,
  FETCH_ROOMS_FAILED
} from "./../../store/rooms/rooms.actiontypes";
import { getRoomsApi } from "../../utils/api/rooms.api";
import { showErrorModal } from "../ui/ui.actions";
import { logout } from "../auth/auth.actions";

export const fetchRooms = () => dispatch => {
  dispatch(fetchRoomsStart());

  getRoomsApi()
    .then(response => dispatch(fetchRoomsSuccess(response.data.rooms)))
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
        message: "Fehler beim Abrufen der Räume."
      };
      
      dispatch(fetchRoomsFailed(errorResponse));
      dispatch(showErrorModal(errorResponse));
    });
};

export const fetchRoomsStart = payload => ({
  type: FETCH_ROOMS_START
});

export const fetchRoomsSuccess = rooms => ({
  type: FETCH_ROOMS_SUCCESS,
  payload: {
    rooms
  }
});

export const fetchRoomsFailed = error => ({
  type: FETCH_ROOMS_FAILED,
  payload: {
    error
  }
});
