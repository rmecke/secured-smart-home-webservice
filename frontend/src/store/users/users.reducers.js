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
} from "./users.actiontypes";

const initialState = {
  users: []
};

export default (state = initialState, { type, payload }) => {

  
  switch (type) {
    case FETCH_USERS_START:
      return { ...state };
    case FETCH_USERS_SUCCESS:
      console.log("users:",payload.users );
      return {
        ...state,
        users: payload.users
      };
    case FETCH_USERS_FAILED:
      return { ...state };

    case TOGGLE_ROLE_SWITCH_START:
      return { ...state };
    case TOGGLE_ROLE_SWITCH_SUCCESS:
      let usersCopy = [...state.users];
      usersCopy.find((x) => {return x._id == payload.userId}).roles.find((y) => {return y._id == payload.roleId}).assigned = payload.newValue;
      
      return {
        ...state,
        users: usersCopy
      };
    case TOGGLE_ROLE_SWITCH_FAILED:
      return { ...state };

    case DELETE_USER_START:
      return { ...state };
    case DELETE_USER_SUCCESS:
      let usersCopy2 = [...state.users];
      let index = usersCopy2.findIndex((x) => {return x._id == payload.userId});
      usersCopy2.splice(index,1);
      
      return {
        ...state,
        users: usersCopy2
      };
    case DELETE_USER_FAILED:
      return { ...state };

    default:
      return state;
  }
};
