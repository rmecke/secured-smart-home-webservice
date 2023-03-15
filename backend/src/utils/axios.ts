import axios from "axios";
import { AXIOS_CONFIG } from "../config";

const AXIOS_URL = process.env.AXIOS_URL || AXIOS_CONFIG.URL;
console.log("AXIOS_URL: "+AXIOS_URL);

const instance = axios.create({
  baseURL: AXIOS_URL
});

export default instance;
