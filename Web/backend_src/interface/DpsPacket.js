/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import DpsConstants from "./DpsConstants";

export default class DpsPacket {
    constructor(target, sender, command, data) {
        this.target = target;
        this.sender = sender;
        this.command = command;
        this.data = data;
    }

    GetBytes() {
        var buffer = [];
        buffer[0] = 0xAA;
        buffer[1] = 0xAA;
        buffer[2] = this.target;
        buffer[3] = this.sender;
        buffer[4] = this.command;
        for (var i = 0; i < this.data.length; i++) {
            buffer[5 + i] = this.data[i];
        }
        var checksum = GenerateChecksum(buffer);
        buffer[13] = checksum[0];
        buffer[14] = checksum[1];
        buffer[15] = 0xAA;
        buffer[16] = 0xAA;
        return buffer;
    }

    static FromBytes(packet) {
        if (!VerifyChecksum(packet) || !VerifySync(packet)) {
            console.log("⚠️ packet loss");
            return null;
            //throw new Error("Invalid Packet");
        } else {
            return new DpsPacket(
                packet[2], // target
                packet[3], // sender
                packet[4], // command
                [packet[5], packet[6], packet[7], packet[8],
                 packet[9], packet[10], packet[11], packet[12]] // data
            );
        }
    }
}

function GenerateChecksum(packet) {
    var sum1 = 0, sum2 = 0;
    for (var i = 0; i < DpsConstants.packet_minlength - 4; i++) {
        sum1 = (sum1 + packet[i]) % 255;
        sum2 = (sum2 + sum1) % 255;
    }

    return [(sum2 & 0xFF), (sum1 & 0xFF)];
}

function VerifyChecksum(packet) {
    var sum1 = 0, sum2 = 0;
    for (var i = 0; i < DpsConstants.packet_minlength - 4; i++) {
        sum1 = (sum1 + packet[i]) % 255;
        sum2 = (sum2 + sum1) % 255;
    }

    if (packet[13] != (sum2 & 0xFF))
        return false;
    if (packet[14] != (sum1 & 0xFF))
        return false;
    return true;
}

function VerifySync(packet) {
    return (packet[0] == 0xAA) && (packet[1] == 0xAA)
        && (packet[15] == 0xAA) && (packet[16] == 0xAA);
}