/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';
import "babel-polyfill";

// Imports
var fs = require('fs');
var express = require('express');
var bodyParser = require('body-parser');
var session = require('express-session');
var FileStore = require('session-file-store')(session);
import DpsPacket from './interface/DpsPacket';
import DpsIO from './interface/DpsIO';
import DpsCacher from './interface/DpsCacher.js';
import DpsConnector from './interface/DpsConnector.js';

// Constants
const dataRoot = "./data/";
const sessionsRoot = dataRoot + "sessions";
const settingsFile = "settings";
const statFile = "stats";
const serialFile = "serial";
const apiId = "keyboardCat";

// Global variables
var settings, stats;
var connection;


// Entry Point
async function startApp() {
    settings = await readJSON(settingsFile);
    // stats = await readJSON(statFile);
    
    // var serial = await readJSON(serialFile);
    // if (serial.serial != apiId) {
    //     return;
    // }

    // Connect to dps
    connection = new DpsConnector(() => {
        connection.GetStates().forEach(element => {
            element.ButtonEnableSet = settings.buttonEnable ? 1 : 0;
            element.MolexEnableSet = settings.molexEnable ? 1 : 0;
            element.AutomaticPowerOnSet = settings.automaticPowerOn ? 1 : 0;
        });
    });
    await connection.Connect();

    // Express App
    var app = express();
    app.use(express.static(__dirname + "/static/"));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({
        store: new FileStore({ path: sessionsRoot }),
        secret: settings.secret,
        resave: false,
        saveUninitialized: true,
        cookie: { secure: false }
    }));
    app.get('*.js', function (req, res, next) {
        req.url = req.url + '.gz';
        res.set('Content-Encoding', 'gzip');
        next();
    });
    loadHttpApi(app);

    // Start web server
    app.listen(8080, "0.0.0.0", function () {
        log('🌎 Web server loaded (port 8080).', '');
    });
}


// Data storage
async function readJSON(name) {
    return new Promise((resolve, reject) => {
        fs.readFile(dataRoot + name + ".json", (err, data) => {
            if (err) reject();
            else resolve(JSON.parse(data));
        });
    });
}
async function saveJSON(name, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(dataRoot + name + ".json", JSON.stringify(data), (err) => {
            if (err) reject();
            else resolve();
        });
    });
}


// Logging
function log(message, type) {
    if (type == "fail") {
        console.error("❌ FAIL: " + Date() + ": " + message);
    } else if (type == "security") {
        console.error("☢️ SECURITY: " + Date() + ": " + message);
    } else {
        console.log(Date() + ": " + message);
    }
}


//
// HTTP API
//
function loadHttpApi(app) {
    //
    // Login
    //
    app.post('/login', (req, res) => {
        if (req.body.password === settings.adminPassword) {
            req.session.auth = true;
            log("logged in (" + req.ip + ")", "security");
            res.sendStatus(200); // OK
        } else {
            log("login failed (" + req.ip + ")", "security");
            res.sendStatus(401); // Unauthorized
        }
    });
    app.post('/logout', async (req, res) => {
        await req.session.destroy();
        log("logout (" + req.ip + ")", "security");
        res.sendStatus(200); // OK
    });
    app.get('/login', (req, res) => {
        res.send(req.session.auth || settings.noLogin);
    });
    function loginCheck(req, res) {
        if (req.session.auth || settings.noLogin) {
            return true;
        } else {
            log("get " + req.originalUrl + " (" + req.ip + ")", "security");
            res.sendStatus(401); // Unauthorized
            return false;
        }
    }

    //
    // App settings
    //
    app.get('/appsettings', (req, res) => {
        if (loginCheck(req, res)) {
            res.json(settings);
        }
    });
    app.post('/appsettings', async (req, res) => {
        if (loginCheck(req, res)) {
            if (settingsValidate(req.body)) {
                Object.keys(settings).forEach(key => {settings[key] = req.body[key]});
                connection.GetStates().forEach(element => {
                    element.ButtonEnableSet = req.body.buttonEnable ? 1 : 0;
                    element.MolexEnableSet = req.body.molexEnable ? 1 : 0;
                    element.AutomaticPowerOnSet = req.body.automaticPowerOn ? 1 : 0;
                });
                try {
                    await saveJSON(settingsFile, settings);
                    log("💾 settings saved", "");
                    res.sendStatus(200); // OK
                } catch (e) {
                    log("💾 cannot save save /settings - " + e, "fail");
                    res.sendStatus(500); // Bad Request
                }
            } else {
                log("💾 invalid post /settings", "fail");
                res.sendStatus(400); // Bad Request
            }
        }
    });
    function settingsValidate(s) {
        return s.noLogin != undefined
            && s.adminPassword
            && s.secret
            && s.defaultPort != undefined
            && s.molexEnable != undefined
            && s.buttonEnable != undefined
            && s.automaticPowerOn != undefined;
    }


    //
    // Dps Connection
    //
    app.get("/interfaces", async (req, res) => {
        if (loginCheck(req, res)) {
            try {
                var serialPorts = await DpsInterface.FindSerialPorts();
                res.json(serialPorts);
            } catch (e) {
                log("🔌 cannot enumerate serial ports - " + e, "fail");
                res.sendStatus(500); // Internal Server Error
            }
        }
    });
    app.get("/connection", (req, res) => {
        if (loginCheck(req, res)) {
            if (connection.Connected()) {
                res.json({
                    state: true,
                    portName: connection.dpsIO.portName
                });
            } else {
                res.json({
                    state: false,
                    portName: ""
                });
            }
        }
    });
    // app.post("/connection", async (req, res) => {
    //     if (loginCheck(req, res)) {
    //         if (req.body.port && req.body.port != "") {
    //             connection.cacher = await Cacher.Connect(req.body.port);
    //             if (connection.cacher && connection.cacher.dpsInterface && connection.cacher.dpsInterface.state) {
    //                 res.sendStatus(200); // OK
    //             } else {
    //                 res.sendStatus(500); // Internal Server Error
    //             }
    //         } else {
    //             if (connection.cacher) {
    //                 await connection.cacher.Disconnect();
    //             }
    //             res.sendStatus(200); // OK
    //         }
    //     }
    // });
    function dpsReadyCheck(req, res) {
        if (connection.Connected()) {
            return true;
        } else {
            log("🔌 port closed " + req.originalUrl + " (" + req.ip + ")", "fail");
            res.sendStatus(500); // Internal Server Error
            return false;
        }
    }


    //
    // Dps Interface
    //
    app.get('/states', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            var states = connection.GetStates();
            res.json(states);
        }
    });
    app.get('/states/:id', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            var state = connection.GetStates()[req.params.id];
            res.json(state);
        }
    });
    app.post('/resetParams/:id', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            connection.GetStates()[Number(req.params.id)].ResetParameters = true;
            res.sendStatus(200); // OK
        }
    });
    app.post('/fan/:id', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            if (req.body.fanSpeed != undefined) {
                connection.GetStates()[Number(req.params.id)].FanSpeedSet = req.body.fanSpeed;
                res.sendStatus(200); // OK
            } else {
                res.sendStatus(400); // Bad Request
            }
        }
    });
    app.post('/powerSettings/:id', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            if (req.body.buttonEnable != undefined && req.body.molexEnable != undefined && req.body.automaticPowerOn != undefined) {
                connection.GetStates()[Number(req.params.id)].ButtonEnableSet = req.body.buttonEnable;
                connection.GetStates()[Number(req.params.id)].MolexEnableSet = req.body.molexEnable;
                connection.GetStates()[Number(req.params.id)].AutomaticPowerOnSet = req.body.automaticPowerOn;
                res.sendStatus(200); // OK
            } else {
                res.sendStatus(400); // Bad Request
            }
        }
    });
    app.post('/power/:id/:state', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            var state = JSON.parse(req.params.state);
            if (state) {
                connection.GetStates()[Number(req.params.id)].TurnOnSet = true;
            } else {
                connection.GetStates()[Number(req.params.id)].TurnOffSet = true;
            }
            res.sendStatus(200); // OK
        }
    });
    app.post('/reset/:id', async (req, res) => {
        if (loginCheck(req, res) && dpsReadyCheck(req, res)) {
            var state = JSON.parse(req.params.state);
            connection.GetStates()[Number(req.params.id)].ResetPending = true;
            res.sendStatus(200); // OK
        }
    });
}

// Entry point
startApp();