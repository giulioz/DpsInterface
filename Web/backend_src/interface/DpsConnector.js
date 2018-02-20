/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All this.rights reserved.
    =======================================
*/

'use strict';

import DpsIO from './DpsIO';
import DpsCacher from './DpsCacher';
import DpsConstants from "./DpsConstants";

function _timeout(ms) { return new Promise(res => setTimeout(res, ms)); }

export default class Connector {
    constructor(updateSettingsCallback) {
        this.cacher = new DpsCacher(DpsConstants.maxCount, updateSettingsCallback);
        this.dpsIO = null;
    }

    GetStates() {
        return this.cacher.cache;
    }

    Connected() {
        return this.dpsIO && this.dpsIO.state;
    }

    async Connect(id = 0) {
        if (this.dpsIO && this.dpsIO.state) {
            log("🔌 alredy connected , closing...");
            await this.dpsIO.Close();
        }

        async function _retry(ctx, i) {
            var serialPorts = await DpsIO.FindSerialPorts();
            var dpsPorts = serialPorts.filter((port) => port.comName.includes("usb"));
            if (dpsPorts.length <= 0) {
                log("🔌 no valid serial ports found.");
                await _timeout(DpsConstants.connectionRetryTimeout);
                _retry(ctx, 0);
            } else {
                log("🔌 trying to connect to " + dpsPorts[i].comName);
                try {
                    ctx.dpsIO = new DpsIO(dpsPorts[i].comName);
                    ctx.dpsIO.onClose = () => _retry(ctx, (i + 1) % dpsPorts.length);
                    await ctx.dpsIO.Open();
                    if (ctx.dpsIO.state) {
                        log("🔌 connected to serial port " + dpsPorts[i].comName);
                        try {
                            await ctx.cacher.Pool(ctx.dpsIO);
                        } catch (e) {
                            log("🔌 error reading from port: " + e, "fail");
                        }
                    } else {
                        log("🔌 cannot to connect to " + dpsPorts[i].comName + ", trying another... " + e, "fail");
                        await _timeout(DpsConstants.connectionRetryTimeout);
                        _retry(ctx, (i + 1) % dpsPorts.length);
                    }
                } catch (e) {
                    log("🔌 cannot to connect to " + dpsPorts[i].comName + ", trying another... " + e, "fail");
                    await _timeout(DpsConstants.connectionRetryTimeout);
                    _retry(ctx, (i + 1) % dpsPorts.length);
                }
            }
        } _retry(this, id);
    }

    async Disconnect() {
        await this.dpsIO.Close();
    }
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