/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React, { Component } from 'react';
import { Row, Col, Button, Card, CardBody, CardTitle, Collapse} from 'reactstrap';
import { VariableDisplay, VariableDisplayList, Slider } from "./ui_controls.jsx";
import BackendInterface from './backend_interface.jsx';

class DashboardCardTitle extends Component {
    render() {
        const style = {
            color: 'white',
            paddingLeft: '30px',
            paddingBottom: '5px',
            paddingTop: '15px'
        };

        var stateText = "";
        var stateIcon = "";
        var titleColor = "";
        if (!this.props.dpsState || (this.props.dpsState && !this.props.dpsState.Ping)) {
            stateIcon = "fa-times";
            stateText = " Disconnected";
            titleColor = "bg-secondary";
        } else if (this.props.dpsState) {
            if (this.props.dpsState.PowerState || (this.props.dpsState.Ping == 2 && this.props.dpsState.StandbyEnable)) {
                if (this.props.dpsState.Overheat || this.props.dpsState.Overload || this.props.dpsState.Undervoltage
                    || (this.props.dpsState.Ping == 2 && this.props.dpsState.StandbyEnable && !this.props.dpsState.MasterEnable)
                    || (this.props.dpsState.Ping == 2 && this.props.dpsState.MasterEnable && !this.props.dpsState.PowerGood)) {
                    var t1 = this.props.dpsState.Overheat ? " Overheat" : "";
                    var t2 = this.props.dpsState.Overload ? " Overload" : "";
                    var t3 = this.props.dpsState.Undervoltage ? " Undervoltage" : "";
                    var t4 = (this.props.dpsState.Ping == 2 && this.props.dpsState.StandbyEnable && !this.props.dpsState.MasterEnable) ? " Standby" : "";
                    var t5 = (this.props.dpsState.Ping == 2 && this.props.dpsState.MasterEnable && !this.props.dpsState.PowerGood) ? " No Power Good" : "";
                    stateIcon = "fa-exclamation-triangle";
                    stateText = t1 + t2 + t3 + t4 + t5;
                    titleColor = "bg-warning";
                } else {
                    stateIcon = "fa-check";
                    stateText = " OK";
                    titleColor = "bg-success";
                }
            } else {
                stateIcon = "fa-exclamation-triangle";
                stateText = " Power Off";
                titleColor = "bg-danger";
            }
        }

        return (
            <div style={style} className={"card-img-top " + titleColor} onClick={this.props.handleOpenCard}>
                <h3>
                    <i className={(!this.props.dpsState || (this.props.dpsState && !this.props.dpsState.Ping)) ? "" : (this.props.isOpen ? "fa fa-angle-up" : "fa fa-angle-down")} aria-hidden="true"></i>
                    {' '}
                    {this.props.dpsId}
                    {" - "}
                    <i className={"fa " + stateIcon} aria-hidden="true"></i>
                    {stateText}
                </h3>
            </div>
        );
    }
}

export default class DashboardCard extends Component {
    constructor(props) {
        super(props);
        this.state = {
            fanSpeed: 50,
            open: false
        };
    }

    fanSpeedChange = (event) => {
        this.setState({
            fanSpeed: event.target.value
        });
    }

    fanSpeedChangeEnd = () => {
        var dpsState = this.props.dpsState;
        if (dpsState && dpsState.Ping) {
            BackendInterface.SetDpsFan(this.props.dpsId, this.state.fanSpeed);
        }
    }

    powerStateChange = (event) => {
        var dpsState = this.props.dpsState;
        if (dpsState && dpsState.Ping == 1) {
            BackendInterface.SetDpsPower(this.props.dpsId, !dpsState.PowerState);
        } else if (dpsState && dpsState.Ping == 2) {
            BackendInterface.SetDpsPower(this.props.dpsId, !dpsState.StandbyEnable);
        }
    }

    resetChange = (event) => {
        BackendInterface.ResetDpsParameters(this.props.dpsId);
    }

    handleOpenCard = () => {
        this.setState({
            open: !this.state.open
        });
    }
    
    getData() {
        var dpsState = this.props.dpsState;
        if (!dpsState || (dpsState && !dpsState.Ping)) {
            return {
                MasterEnable: "/",
                MolexEnable: "/",
                PowerGood: "/",
                StandbyEnable: "/",
                ButtonEnable: "/",
                AutomaticPowerOn: "/",
                Voltage: "/",
                Current: "/",
                Power: "/",
                MaxPower: "/",
                MaxCurrent: "/",
                "KWH": "/",
                InputVoltage: "/",
                TemperatureIntake: "/",
                TemperatureInternal: "/",
                FanSpeed: "/"
            };
        } else {
            return {
                MasterEnable: dpsState.MasterEnable ? "On" : "Off",
                MolexEnable: dpsState.MolexEnable ? "On" : "Off",
                PowerGood: dpsState.PowerGood ? "Yes" : "No",
                StandbyEnable: dpsState.StandbyEnable ? "On" : "Off",
                ButtonEnable: dpsState.ButtonEnable ? "On" : "Off",
                AutomaticPowerOn: dpsState.AutomaticPowerOn ? "On" : "Off",
                Voltage: dpsState.Voltage != undefined ? (dpsState.Voltage.toFixed(3) + " V") : "/",
                Current: dpsState.Current != undefined ? (dpsState.Current.toFixed(3) + " A") : "/",
                Power: dpsState.Power != undefined ? (dpsState.Power.toFixed(1) + " W") : "/",
                MaxPower:  dpsState.MaxPower != undefined ? (dpsState.MaxPower.toFixed(1) + " W") : "/",
                MaxCurrent: dpsState.MaxCurrent != undefined ? (dpsState.MaxCurrent.toFixed(3) + " A") : "/",
                KWH: dpsState.KWH != undefined ? (dpsState.KWH.toFixed(2) + " KWh") : "/",
                InputVoltage: dpsState.InputVoltage != undefined ? (dpsState.InputVoltage.toFixed(1) + " V") : "/",
                TemperatureIntake: dpsState.TemperatureIntake != undefined ? (dpsState.TemperatureIntake.toFixed(1) + " °C") : "/",
                TemperatureInternal: dpsState.TemperatureInternal != undefined ? (dpsState.TemperatureInternal.toFixed(1) + " °C") : "/",
                FanSpeed: dpsState.FanSpeed != undefined ? (dpsState.FanSpeed.toFixed(0) + " rpm") : "/"
            };
        }
    }

    cardTextRender(data) {
        return (
            <CardBody>
                <Row>
                    <Col>
                        <h6><i className="fa fa-bolt" aria-hidden="true"></i> Power <small><a href="#" className="text-muted" onClick={this.resetChange}>(reset)</a></small>:</h6>
                        <VariableDisplayList>
                            <VariableDisplay name="Voltage" value={data.Voltage} />
                            <VariableDisplay name="Current" value={data.Current} />
                            <VariableDisplay name="Power" value={data.Power} />
                            <VariableDisplay name="MaxPower" value={data.MaxPower} />
                            <VariableDisplay name="MaxCurrent" value={data.MaxCurrent} />
                            <VariableDisplay name="KWh" value={data.KWH} />
                        </VariableDisplayList>
                    </Col>
                    <Col>
                        <h6><i className="fa fa-thermometer-half" aria-hidden="true"></i> Thermals:</h6>
                        <VariableDisplayList>
                            <VariableDisplay name="Intake" value={data.TemperatureIntake} />
                            <VariableDisplay name="Internal" value={data.TemperatureInternal} />
                            <VariableDisplay name="Fan Speed" value={data.FanSpeed} />
                        </VariableDisplayList>
                        <h6><i className="fa fa-tachometer" aria-hidden="true"></i> Fan Speed Override:</h6>
                        <Slider value={this.state.fanSpeed}
                            disabled={!(this.props.dpsState && this.props.dpsState.Ping != null)}
                            onChange={this.fanSpeedChange}
                            onChangeEnd={this.fanSpeedChangeEnd} />
                    </Col>
                    <Col>
                        <h6><i className="fa fa-power-off" aria-hidden="true"></i> Control:</h6>
                        <VariableDisplayList>
                            {(this.props.dpsState.Ping == 1) && <VariableDisplay name="MolexEnable" value={data.MolexEnable} />}
                            {(this.props.dpsState.Ping == 2) && <VariableDisplay name="PowerGood" value={data.PowerGood} />}
                            {(this.props.dpsState.Ping == 2) && <VariableDisplay name="StandbyEnable" value={data.StandbyEnable} />}
                            <VariableDisplay name="ButtonEnable" value={data.ButtonEnable} />
                            <VariableDisplay name="AutomaticPowerOn" value={data.AutomaticPowerOn} />
                        </VariableDisplayList>
                        { (this.props.dpsState && this.props.dpsState.Ping == 1) &&
                            <Button color={(this.props.dpsState && this.props.dpsState.Ping != null) ? (this.props.dpsState.PowerState ? "danger" : "success") : "secondary"}
                                    onClick={this.powerStateChange}
                                    disabled={!(this.props.dpsState && this.props.dpsState.Ping != null)}>
                                <i className="fa fa-power-off" aria-hidden="true" /> Power {(this.props.dpsState && this.props.dpsState.PowerState) ? "Off" : "On"}
                            </Button>
                        }
                        { (this.props.dpsState && this.props.dpsState.Ping == 2) &&
                            <Button color={(this.props.dpsState && this.props.dpsState.Ping != null) ? (this.props.dpsState.StandbyEnable ? "danger" : "success") : "secondary"}
                                    onClick={this.powerStateChange}
                                    disabled={!(this.props.dpsState && this.props.dpsState.Ping != null)}>
                                <i className="fa fa-power-off" aria-hidden="true" /> Power {(this.props.dpsState && this.props.dpsState.StandbyEnable) ? "Off" : "On"}
                            </Button>
                        }
                    </Col>
                </Row>
            </CardBody>
        );
    }

    render() {
        const cardStyle = {
            minWidth: '200px',
            marginBottom: "20px"
        };

        var data = this.getData();
        return (
            <Card style={cardStyle} className={!this.props.dpsState || (this.props.dpsState && !this.props.dpsState.Ping) ? "text-muted" : ""}>
                <DashboardCardTitle handleOpenCard={this.handleOpenCard}
                    isOpen={this.state.open || (!this.props.dpsState || (this.props.dpsState && !this.props.dpsState.Ping))}
                    dpsId={this.props.dpsId} dpsState={this.props.dpsState} />
                <Collapse isOpen={this.state.open}>
                    {(!this.props.dpsState || (this.props.dpsState && !this.props.dpsState.Ping)) ? [] : this.cardTextRender(data)}
                </Collapse>
            </Card>
        );
    }
}
