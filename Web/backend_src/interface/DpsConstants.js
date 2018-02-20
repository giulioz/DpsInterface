/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

const DpsConstants = {
    packet_minlength: 17,
    maxCount: 8,
    write_timeout: 30,
    read_timeout: 30,
    sender: 255,
    defaultBaudRate: 115200,
    retry: 2,
    connectionRetryTimeout: 2000,
    
    noBoardID: 0,
    basicBoardID: 1,
    psuBoardID: 2,

    commandsRead: {
        ping : 0,
        masterEnable: 10,
        standbyEnable: 17,
        powerGood: 18,
        molexEnable: 15,
        buttonEnable: 12,
        automaticPowerOn: 13,
        analogVoltage: 180,
        analogCurrent: 181,
        analogPower: 182,
        analogMaxPower: 183,
        analogMaxCurrent: 184,
        analogKHW: 185,
        temperatureIntake: 226,
        temperatureInternal: 227,
        fanSpeed: 228
    },

    commandsWrite: {
        resetParameters: 90,
        masterEnable: 102,
        buttonEnable: 100,
        standbyEnable: 105,
        molexEnable: 103,
        fanSpeed: 240,
        automaticPowerOn: 101,
        reset: 255
    }
};

export default DpsConstants;