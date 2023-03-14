import axios from "./axios";
import { authHeader } from "./auth.api";

export const getRoomsApi = () => {
  return axios.get("/api/home/rooms",{ headers: authHeader() })
  .catch(function (error) {
    throw(error);
  });
};
