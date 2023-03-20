// Only for development. 
// For production please use environment variables: AUTH_SECRET
export const AUTH_CONFIG = {
    SECRET: "secured-smart-home"
}

// Only for development. 
// For production please use environment variables: AXIOS_URL
export const AXIOS_CONFIG = {
    URL: "http://192.168.2.120:8087"
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
    ORIGIN: "http://localhost:3000"
}

// Only for development. 
// For production please use environment variable: HTTPS
export const HTTPS_CONFIG = {
    ENABLED: false
}

// Only for development. 
// For production please use environment variables: WEBSOCKET_URL
export const WEBSOCKET_CONFIG = {
    URL: "http://192.168.2.120:8084"
}