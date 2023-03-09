import axios from "axios";

const instance = axios.create({
  baseURL: "http://192.168.2.120:8087"
});

export default instance;
