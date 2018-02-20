/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All this.rights reserved.
    =======================================
*/

'use strict';

import DpsIO from './DpsIO';
import DpsConstants from "./DpsConstants";

const commandsRead = DpsConstants.commandsRead;
const commandsWrite = DpsConstants.commandsWrite;

export class DpsBoardInfo {
    constructor(id) {
        this.Ping = DpsConstants.noBoardID;
        this.FirmwareVersion = 0;
        this.ChainID = id;

        // Settings
        this.ResetParameters = false;
        this.ResetPending = false;
        this.TurnOnSet = false;
        this.TurnOffSet = false;
        this.ButtonEnableSet = 1;
        this.AutomaticPowerOnSet = 0;
        this.FanSpeedSet = 0.0;

        // Read-only
        this.MasterEnable = 0;
        this.ButtonEnable = 1;
        this.AutomaticPowerOn = 0;
        this.Voltage = null;
        this.Current = null;
        this.Power = null;
        this.MaxPower = null;
        this.MaxCurrent = null;
        this.KWH = null;
        this.InputVoltage = null;
        this.TemperatureIntake = null;
        this.TemperatureInternal = null;
        this.FanSpeed = 0.0;
    }

    async GetState(dpsIO) {
        var reading = null;

        reading = await dpsIO.GetValueBytes(this.ChainID, commandsRead.ping);
        if (reading != null && reading != undefined)  {
            this.Ping = reading[0];
            this.FirmwareVersion = reading[1];
        } else {
            this.Ping = 0;
        }
        
        if (this.Ping > 0) {
            if (this.ResetParameters) {
                this.ResetParameters = !(await dpsIO.GetValueBoolean(this.ChainID, commandsWrite.resetParameters));
            }
            if (this.ResetPending) {
                this.ResetPending = !(await dpsIO.GetValueBoolean(this.ChainID, commandsWrite.reset));
            }

            reading = await dpsIO.GetValueBoolean(this.ChainID, commandsRead.masterEnable);
            if (reading != null && reading != undefined) this.MasterEnable = reading;

            reading = await dpsIO.GetValueBoolean(this.ChainID, commandsRead.buttonEnable);
            if (reading != null && reading != undefined) this.ButtonEnable = reading;
            if (this.ButtonEnableSet != reading) {
                await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.buttonEnable, this.ButtonEnableSet);
            }

            reading = await dpsIO.GetValueBoolean(this.ChainID, commandsRead.automaticPowerOn);
            if (reading != null && reading != undefined) this.AutomaticPowerOn = reading;
            if (this.AutomaticPowerOnSet != reading) {
                await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.automaticPowerOn, this.AutomaticPowerOnSet);
            }
    
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogVoltage);
            if (reading != null && reading != undefined) this.Voltage = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogCurrent);
            if (reading != null && reading != undefined) this.Current = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogPower);
            if (reading != null && reading != undefined) this.Power = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogMaxPower);
            if (reading != null && reading != undefined) this.MaxPower = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogMaxCurrent);
            if (reading != null && reading != undefined) this.MaxCurrent = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.analogKHW);
            if (reading != null && reading != undefined) this.KWH = reading;
    
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.temperatureIntake);
            if (reading != null && reading != undefined) this.TemperatureIntake = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.temperatureInternal);
            if (reading != null && reading != undefined) this.TemperatureInternal = reading;
            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.fanSpeed);
            if (reading != null && reading != undefined) this.FanSpeed = reading;

            this.Overload = this.AnalogCurrent > 90;
            this.Undervoltage = this.AnalogVoltage < 11.5;
            this.Overheat = (this.TemperatureIntake > 70
                    || this.TemperatureInternal > 70);
            this.PowerState = this.MasterEnable;
        }
    }
}

export class BasicBoardInfo extends DpsBoardInfo {
    constructor(id) {
        super(id);

        this.MolexEnableSet = undefined;
        this.MolexEnable = 1;
    }

    async GetState(dpsIO) {
        await super.GetState(dpsIO);

        if (this.Ping == DpsConstants.basicBoardID) {
            if (this.TurnOnSet) {
                this.TurnOnSet = !(await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.masterEnable, 1));
            }
            if (this.TurnOffSet) {
                this.TurnOffSet = !(await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.masterEnable, 0));
            }

            var reading = null;
            reading = await dpsIO.GetValueBoolean(this.ChainID, commandsRead.molexEnable);
            if (reading != null && reading != undefined) this.MolexEnable = reading;
            if (this.MolexEnableSet != reading) {
                await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.molexEnable, this.MolexEnableSet);
            }
        }
    }
}

export class PsuBoardInfo extends DpsBoardInfo {
    constructor(id) {
        super(id);

        this.StandbyEnable = 0;
        this.PowerGood = 0;
    }

    async GetState(dpsIO) {
        await super.GetState(dpsIO);

        if (this.Ping == DpsConstants.psuBoardID) {
            if (this.TurnOnSet) {
                this.TurnOnSet = !(await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.standbyEnable, 1));
            }
            if (this.TurnOffSet) {
                this.TurnOffSet = !(await dpsIO.SendValueBoolean(this.ChainID, commandsWrite.standbyEnable, 0));
            }

            var reading = null;

            reading = await dpsIO.GetValueFloat(this.ChainID, commandsRead.powerGood);
            if (reading != null && reading != undefined) this.PowerGood = reading;

            reading = await dpsIO.GetValueBoolean(this.ChainID, commandsRead.standbyEnable);
            if (reading != null && reading != undefined) this.StandbyEnable = reading;
        }
    }
}
