import express from 'express';
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AUTH_CONFIG, LOGGIN_CONFIG } from "../config";
import { DB } from '../models/index';
const Log = DB.Log;

export enum LogLevel {
    "TRACE",
    "DEBUG",
    "INFO",
    "WARN",
    "ERROR",
    "FATAL"
};

const LOGGING_LVL = process.env.L || LOGGIN_CONFIG.LVL;
const minLvl = LogLevel[LOGGING_LVL];

const createLog = (timestamp: number, user: string, level: LogLevel, message: string) => {
    if (level >= minLvl) {
        const log = new Log({
            level: LogLevel[level],
            timestamp: timestamp,
            user: user,
            message: message
        });
        log.save();

        console.log(`LoggingController: ${LogLevel[level]} | ${user} | ${timestamp}  | ${message}`);
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