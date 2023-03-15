import axios from "axios";
import { AXIOS_CONFIG } from "../../config/axiosConfig";

// The process.env.REACT_APP_AXIOS_URL will be replaced with the actual environment value of deployment by React on frontend server startup.
const AXIOS_URL = process.env.REACT_APP_AXIOS_URL || AXIOS_CONFIG.URL;

const instance = axios.create({
  baseURL: AXIOS_URL
});

export default instance;
