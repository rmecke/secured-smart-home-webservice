import axios from "./axios";
import { openWebSocket } from "./websocket";

export const loginAPI = async (username, password) => {
  const response = await axios
    .post("/api/auth/login", { username, password }, {withCredentials: true});
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }

  return response.data;
}

export const refreshAPI = async () => {
  const response = await axios
    .post("/api/auth/refresh", {}, {withCredentials: true});
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
    openWebSocket(response.data.accessToken);
  }
  
  return response.data;
}

export const logoutAPI = () => {
  localStorage.removeItem("user");
}

export const registerAPI = (username, password, password2) => {
  return axios.post("/api/auth/register", {
    username,
    password,
  });
}

export const authHeader = () => {
  const user = JSON.parse(localStorage.getItem('user'));

  if (user && user.accessToken) {
    return { 'x-access-token': user.accessToken };
  } else {
    return {};
  }
}