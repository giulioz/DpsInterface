/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

var fs = require('fs');
var SerialPort = require('serialport');
var ByteLength = SerialPort.parsers.ByteLength
import DpsPacket from './DpsPacket';
import DpsConstants from "./DpsConstants";

function _timeout(ms) { return new Promise(res => setTimeout(res, ms)); }


export default class DpsIO {
    // Opens serial port
    constructor(port, baudRate = DpsConstants.defaultBaudRate) {
        this.serialPort = new SerialPort(port, { baudRate: baudRate, autoOpen: false });
        this.serialPort.setMaxListeners(100);
        this.serialPort.on('error', e => log("🔌 error: " + e, "fail"));
        this.serialPort.on('open', () => this.state = true);
        function _handleClose(context) {
            log("🔌 port closed", "");
            context.state = false;
            context.onClose();
        }
        this.serialPort.on('close', () => _handleClose(this));
        this.parser = this.serialPort.pipe(new ByteLength({length: DpsConstants.packet_minlength}));
        this.portName = port;
        this.onClose = () => {};
    }

    // List serial ports
    static async FindSerialPorts() {
        return SerialPort.list();
    }

    // Open serial port
    async Open() {
        return new Promise((resolve, reject) => {
            this.serialPort.open(resolve);
        });
    }

    // Close serial port
    async Close() {
        return new Promise((resolve, reject) => {
            this.serialPort.close(resolve);
        });
    }

    // Send packet without waiting for the response
    async PacketSend(packet) {
        await _timeout(DpsConstants.write_timeout);
        var data = packet.GetBytes();
        return new Promise((resolve, reject) => {
            // HACK: flushing buffer crashes on windows
            resolve();
            //this.serialPort.flush(resolve);
        }).then((resolve, reject) => {
            this.serialPort.write(data, 'binary', resolve);
        }).then((resolve, reject) => {
            this.serialPort.drain(resolve);
        });
    }

    // Send packet and wait for response
    async PacketIO(packet) {
        async function _packetIO(packet, ctx) {
            // console.log("SEND DATA: " + packet.GetBytes() + " [" + (new Date().getTime()) + "]");
            await ctx.PacketSend(packet);
            return new Promise((resolve, reject) => {
                var timeout;

                const _afterData = async (data) => {
                    var readBuffer = [...data];
                    clearTimeout(timeout);
                    ctx.parser.removeListener('data', _afterData);
                    // console.log("RECEIVE DATA: " + readBuffer + " [" + (new Date().getTime()) + "]");
                    //await _timeout(1);
                    resolve(DpsPacket.FromBytes(readBuffer));
                };

                // Reject on timeout
                timeout = setTimeout(() => {
                    // console.log("TIMEOUT");
                    ctx.parser.removeListener('data', _afterData);
                    resolve(null);
                }, DpsConstants.read_timeout);

                // Resolve on data
                ctx.parser.on('data', _afterData);
            });
        }
        var data;
        for (var i = 0; i < DpsConstants.retry && !data; i++) {
            if (!this.serialPort.closing || this.serialPort.readable)
                data = await _packetIO(packet, this);
        }
        return data;
    }

    // Reads bytes from the dps
    async GetValueBytes(id, command) {
        var packet = new DpsPacket(id, DpsConstants.sender, command, [0,0,0,0,0,0,0,0]);
        var result = await this.PacketIO(packet);
        if ((result && (result.sender != id || result.command != command)) || result == null) return null;
        else return result.data;
    }

    // Reads a boolean value from the dps
    async GetValueBoolean(id, command) {
        var packet = new DpsPacket(id, DpsConstants.sender, command, [0,0,0,0,0,0,0,0]);
        var result = await this.PacketIO(packet);
        if ((result && (result.sender != id || result.command != command)) || result == null) return null;
        else return result.data[0];
    }

    // Reads a float (4 bytes) value from the dps
    async GetValueFloat(id, command) {
        var packet = new DpsPacket(id, DpsConstants.sender, command, [0,0,0,0,0,0,0,0]);
        var result = await this.PacketIO(packet);
        if ((result && (result.sender != id || result.command != command)) || result == null) return null;
        else {
            var buf = new ArrayBuffer(8);
            var view = new DataView(buf);
            for (var i = 0; i < 4; i++) {
                view.setUint8(3 - i, result.data[i]);
            }
            return view.getFloat32(0);
        }
    }

    // Reads a double (8 bytes) value from the dps
    async GetValueDouble(id, command) {
        var packet = new DpsPacket(id, DpsConstants.sender, command, [0,0,0,0,0,0,0,0]);
        var result = await this.PacketIO(packet);
        if ((result && (result.sender != id || result.command != command)) || result == null) return null;
        else {
            var buf = new ArrayBuffer(8);
            var view = new DataView(buf);
            for (var i = 0; i < 8; i++) {
                view.setUint8(7 - i, result.data[i]);
            }
            return view.getFloat64(0);
        }
    }

    // Sends a float (4 bytes) value to the dps
    async SendValueFloat(id, command, value) {
        var floatBuf = new Float32Array(2);
        floatBuf[0] = value;
        var byteBuf = new Uint8Array(floatBuf.buffer);
        var packet = new DpsPacket(id, DpsConstants.sender, command, [...byteBuf]);
        return await this.PacketIO(packet);
    }

    // Sends a bool (1 bytes) value to the dps
    async SendValueBoolean(id, command, value) {
        var packet = new DpsPacket(id, DpsConstants.sender, command, [value,0,0,0,0,0,0,0]);
        return await this.PacketIO(packet);
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