import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import { AUTH_CONFIG, LOGGIN_CONFIG } from "../config";
import { DB } from '../models/index';
import path from 'path';
import { notifyController } from './notifyController';
const Log = DB.Log;

export enum LogLevel {
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL"
};

const LOGGING_LVL = process.env.LOGGING_LVL || LOGGIN_CONFIG.LVL;
const minLvl = LogLevel[LOGGING_LVL];

// Create a new log file
let logDate = new Date();
let logDirectory = "../../../logs"; // --> directory has been mounted with docker
let logFileName = `backend_${("0"+logDate.getDate()).slice(-2)}_${("0"+logDate.getMonth()).slice(-2)}_${logDate.getFullYear()}_${("0"+logDate.getHours()).slice(-2)}_${("0"+logDate.getMinutes()).slice(-2)}_${("0"+logDate.getSeconds()).slice(-2)}`;
let logFilePath = logDirectory+"/"+logFileName+".log";

const createLog = (user: string, level: LogLevel, message: string) => {
    const timestamp: number = Date.now()
    const dateFormatted = new Date(timestamp).toLocaleString();

    // Write to console
    const logLine = `${timestamp} | ${dateFormatted} | ${LogLevel[level]} | ${message} | ${user}`;
    switch (level) {
        case LogLevel.TRACE:
            console.trace(`\x1b[90m LoggingController: ${logLine}\x1b[0m`);
            break;
        case LogLevel.DEBUG:
            console.debug(`\x1b[37m LoggingController: ${logLine}\x1b[0m`);
            break;
        case LogLevel.INFO:
            console.info(`\x1b[36m LoggingController: ${logLine}\x1b[0m`);
            break;
        case LogLevel.WARN:
            console.warn(`\x1b[33m LoggingController: ${logLine}\x1b[0m`);
            break;
        case LogLevel.ERROR:
            console.error(`\x1b[41m LoggingController: ${logLine}\x1b[0m`);
            break;
        case LogLevel.FATAL:
            console.error(`\x1b[91m [!] LoggingController [!]: ${logLine}\x1b[0m`);
            break;
    }

    // Do the following only, if the log level is high enough
    if (level >= minLvl) {
        // Write to database
        const log = new Log({
            timestamp: timestamp,
            date: dateFormatted,
            level: LogLevel[level],
            message: message,
            user: user,
        });
        log.save().catch((e) => {
            console.log(e);
        });

        // Write to log file
        fs.writeFileSync(path.resolve(__dirname, logFilePath),logLine+"\n",{flag:"a+"});
    }
}

/*
    MongoDB Aggregation, to transform timestamp to date:
    [
    {
        '$addFields': {
        'dateAndTime': {
            '$toDate': '$timestamp'
        }
        }
    }
    ]
*/

export const loggingController = {
    createLog
}