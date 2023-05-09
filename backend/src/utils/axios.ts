import axios from "axios";
import { AXIOS_CONFIG } from "../config";
import https from "https"

const AXIOS_URL = process.env.AXIOS_URL || AXIOS_CONFIG.URL;

const instance = axios.create({
  baseURL: AXIOS_URL,
  httpsAgent: new https.Agent({rejectUnauthorized: false})
});

export default instance;
