import axios from "./axios";

export const loginAPI = async (username, password) => {
  const response = await axios
    .post("/login", { username, password });
  if (response.data.accessToken) {
    localStorage.setItem("user", JSON.stringify(response.data));
  }
  return response.data;
}

export const logoutAPI = () => {
  localStorage.removeItem("user");
}

export const registerAPI = (username, password) => {
  return axios.post("/register", {
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