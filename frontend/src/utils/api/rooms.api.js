import axios from "./axios";
import { authHeader, refreshAPI } from "./auth.api";

export const getRoomsApi = () => {
  return axios.get("/api/home/rooms",{ headers: authHeader() })
  .catch(async function (error) {
    if (error.response.status === 401) {
      let data = await refreshAPI();
      console.log("data.accessToken: " +data.accessToken);
      if (!data.accessToken) {
        throw(error);
      } else {
        return getRoomsApi();
      }
    } else {
      throw(error);
    }
  });
};
