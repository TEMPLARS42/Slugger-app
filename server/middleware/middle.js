const express = require('express');
const app = express();
const { handler } = require('../manager/manager')

const logRequest = (req, res, next) => {
    res.send("hello gg")
    handler();
    next();
};

const authenticate = (req, res, next) => {
    // Logic to authenticate the request
    if (req.headers.authorization) {
        // User is authenticated
        next();
    } else {
        res.status(401).send('Unauthorized');
    }
};

module.exports = { logRequest, authenticate };