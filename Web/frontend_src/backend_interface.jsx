/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

const maxDps = 8;

export default class BackendInterface {

    static GetDpsNum() {
        return maxDps;
    }



    //
    // Login
    //
    static async Login(password) {
        var response;
        try {
            response = await fetch("/login", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    password: password
                })
            });
        } catch (e) { }
        return (response && response.status == 200);
    }
    static async Logout() {
        try {
            await fetch("/logout", {
                method: "POST",
                credentials: 'include'
            });
        } catch (e) { }
    }
    static async LoggedIn() {
        try {
            var response = await fetch("/login", {
                method: "GET",
                credentials: 'include'
            });
            var loggedIn = await response.json();
            return loggedIn;
        } catch (e) {
            return null;
        }
    }

    //
    // App settings
    //
    static async GetAppSettings() {
        try {
            var response = await fetch("/appsettings", {
                method: "GET",
                credentials: 'include'
            });
            var settings = await response.json();
            return settings;
        } catch (e) {
            return null;
        }
    }
    static async SetAppSettings(settings) {
        try {
            var response = await fetch("/appsettings", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(settings)
            });
            return response.status == 200;
        } catch (e) {
            return false;
        }
    }

    //
    // Dps Connection
    //
    static async Interfaces() {
        try {
            var response = await fetch("/interfaces", {
                method: "GET",
                credentials: 'include'
            });
            var interfaces = await response.json();
            return interfaces;
        } catch (e) {
            return null;
        }
    }
    static async ConnectionState() {
        try {
            var response = await fetch("/connection", {
                method: "GET",
                credentials: 'include'
            });
            var connectionState = await response.json();
            return connectionState;
        } catch (e) {
            return null;
        }
    }
    static async Connect(port) {
        try {
            var response = await fetch("/connection", {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({port:port})
            });
            return response.status == 200;
        } catch (e) {
            return false;
        }
    }

    //
    // Dps Interface
    //
    static async GetAllStates() {
        try {
            var response = await fetch("/states", {
                method: "GET",
                credentials: 'include'
            });
            var states = await response.json();
            return states;
        } catch (e) {
            return null;
        }
    }
    static async GetState(id) {
        try {
            var response = await fetch("/states/" + id, {
                method: "GET",
                credentials: 'include'
            });
            var states = await response.json();
            return states;
        } catch (e) {
            return null;
        }
    }
    static async ResetDpsParameters(id) {
        var response;
        try {
            response = await fetch("/resetParams/" + id, {
                method: "POST",
                credentials: 'include'
            });
        } catch (e) { }
        return (response && response.status == 200);
    }
    static async SetDpsFan(id, fanSpeed) {
        var response;
        try {
            response = await fetch("/fan/" + id, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({fanSpeed:fanSpeed})
            });
        } catch (e) { }
        return (response && response.status == 200);
    }
    static async SetDpsPowerSettings(id, buttonEnable, molexEnable, automaticPowerOn) {
        var response;
        try {
            response = await fetch("/powerSettings/" + id, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    buttonEnable: buttonEnable,
                    molexEnable: molexEnable,
                    automaticPowerOn: automaticPowerOn
                })
            });
        } catch (e) { }
        return (response && response.status == 200);
    }
    static async SetAllDpsPowerSettings(buttonEnable, molexEnable, automaticPowerOn) {
        for (var i = 0; i < maxDps; i++) {
            this.SetDpsPowerSettings(i, buttonEnable, molexEnable, automaticPowerOn);
        }
    }
    static async SetDpsPower(id, state) {
        var response;
        try {
            response = await fetch("/power/" + id + "/" + state, {
                method: "POST",
                credentials: 'include',
                headers: {
                    'Accept': 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            });
        } catch (e) { }
        return (response && response.status == 200);
    }
    static async SetAllDpsPower(state) {
        for (var i = 0; i < maxDps; i++) {
            this.SetDpsPower(i, state);
        }
    }
}