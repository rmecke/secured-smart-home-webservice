import Fastify, { FastifyInstance, FastifyServerFactory } from 'fastify';
import fetch from 'cross-fetch';
var express = require("express");
var cors = require('cors');
var app = express();

const ENDPOINTS = {
    DEFAULT: '/',
    HEALTH: '/health',
    ON: "/on",
    OFF: "/off",
    OPEN: "/open",
    CLOSE: "/close",
};

const PORT = process.env.PORT ? parseInt(process.env.PORT) : 54000;

app.listen(PORT, () => {
    console.log(`REST API listens on port ${PORT}`)
})

app.get(ENDPOINTS.HEALTH, (req, res) => {
    res.status(200).send(true);
});

app.get(ENDPOINTS.ON, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=true`)
    res.status(200).send(true);
})

app.get(ENDPOINTS.OFF, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/mqtt.0.test.esp?value=false`)
    res.status(200).send(true);
})

app.get(ENDPOINTS.OPEN, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.open?value=true`)
    res.status(200).send(true);
})

app.get(ENDPOINTS.CLOSE, async (req, res) => {
    await fetch(`http://10.13.13.2:8087/set/myq.0.devices.CG0811460676.commands.close?value=true`)
    res.status(200).send(true);
})