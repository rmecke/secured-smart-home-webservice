// Only for development. 

import { LogLevel } from "./controllers/loggingController"

// For production please use environment variables: AUTH_SECRET_ACCESS, AUTH_SECRET_REFRESH
export const AUTH_CONFIG = {
    SECRET_ACCESS: "secured-smart-home-access",
    SECRET_REFRESH: "secured-smart-home-refresh"
}

// Only for development. 
// For production please use environment variables: AXIOS_URL
export const AXIOS_CONFIG = {
    URL: "https://192.168.2.120:8087"
}

// Only for development. 
// For production please use environment variables: DB_HOST, DB_PORT, DB_NAME, DB_USERNAME, DB_USERPASSWORD
export const DB_CONFIG = {
    HOST: "127.0.0.1",
    PORT: "27017",
    NAME: "secured_smart_home"
}

// Only for development. 
// For production please use environment variables: CORS_ORIGIN
export const CORS_CONFIG = {
    ORIGIN: undefined //"http://localhost:3000"
}

// Only for development. 
// For production please use environment variable: HTTPS
export const HTTPS_CONFIG = {
    ENABLED: false
}

// Only for development. 
// For production please use environment variables: WEBSOCKET_URL
export const WEBSOCKET_CONFIG = {
    URL: "https://192.168.2.120:8084"
}

// Only for development. 
// For production please use environment variables: LOGGING_LVL
export const LOGGIN_CONFIG = {
    LVL: "DEBUG",
    DAYS: 7
}

// Only for development. 
// For production please use environment variables: GOTIFY_URL
export const GOTIFY_CONFIG = {
    URL: undefined, //"https://secured-smart-home.de:54002",
    TOKEN: undefined, //"A9LkayEzlGkBMaj",
}