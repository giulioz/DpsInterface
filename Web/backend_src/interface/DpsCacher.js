/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All this.rights reserved.
    =======================================
*/

'use strict';

import { DpsBoardInfo, BasicBoardInfo, PsuBoardInfo } from "./DpsBoardInfo";
import DpsConstants from "./DpsConstants";

export default class DpsCacher {
    constructor(dpsNum, updateSettingsCallback) {
        this.dpsNum = dpsNum;
        this.cache = [];
        this.updateSettingsCallback = updateSettingsCallback;
        for (var i = 0; i < dpsNum; i++) {
            this.cache.push(new DpsBoardInfo(i));
        }
    }

    async Pool(dpsIO) {
        if (dpsIO && dpsIO.state) {
            this.updateSettingsCallback();
            for (var i = 0; i < this.dpsNum; i++) {
                await this.cache[i].GetState(dpsIO);
                if (this.cache[i].Ping == DpsConstants.noBoardID) {
                    this.cache[i] = new DpsBoardInfo(i);
                }
                if (this.cache[i].Ping == DpsConstants.basicBoardID && !(this.cache[i] instanceof BasicBoardInfo)) {
                    this.cache[i] = new BasicBoardInfo(i);
                    await this.cache[i].GetState(dpsIO);
                }
                else if (this.cache[i].Ping == DpsConstants.psuBoardID && !(this.cache[i] instanceof PsuBoardInfo)) {
                    this.cache[i] = new PsuBoardInfo(i);
                    await this.cache[i].GetState(dpsIO);
                }
            }
            this.Pool(dpsIO);
        }
    }
}
