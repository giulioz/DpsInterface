/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input,
    Collapse, Alert, CardDeck } from 'reactstrap';
import BackendInterface from './backend_interface.jsx';


export default class Settings extends Component {
    constructor(props) {
        super(props);

        this.state = {
            "noLogin": false,
            "adminPassword": "",
            "secret": "",
            "defaultPort": 0,
            "molexEnable": true,
            "buttonEnable": true,
            "automaticPowerOn": false,

            saved: true
        };
    }
    
    async componentDidMount() {
        var _settings = await BackendInterface.GetAppSettings();
        // var _states = await BackendInterface.GetAllStates();
        // if (_states) {
        //     _states.forEach(element => {
        //         if (element && element.Ping) {
        //             _settings.molexEnable = element.molexEnable;
        //             _settings.buttonEnable = element.buttonEnable;
        //             _settings.automaticPowerOn |= element.AutomaticPowerOn;
        //         }
        //     });
        // }
        this.setState(_settings);
    }

    validateForm() {
        return this.state.adminPassword.length > 0;
    }

    handleChangePassword = (event) => {
        this.setState({
            adminPassword: event.target.value,
            saved: false
        });
    }
    handleChangeCheck = (event) => {
        this.setState({
            [event.target.id]: event.target.checked,
            saved: false
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();
        var settings = {
            noLogin: this.state.noLogin,
            adminPassword: this.state.adminPassword,
            secret: this.state.secret,
            defaultPort: this.state.defaultPort,
            molexEnable: this.state.molexEnable,
            buttonEnable: this.state.buttonEnable,
            automaticPowerOn: this.state.automaticPowerOn
        };
        await BackendInterface.SetAppSettings(settings);
        this.setState({
            saved: true
        });
    }

    render() {
        return (
            <Form onSubmit={this.handleSubmit}>
                <Row className="justify-content-md-center">
                    <Col>
                        <h3>Interface Settings</h3><hr />
                        <FormGroup>
                            <Label for="adminPassword">Admin Password:</Label>
                            <Input type="password" id="adminPassword" disabled={this.state.noLogin}
                                    onChange={this.handleChangePassword} value={this.state.adminPassword} />
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" id="noLogin" onChange={this.handleChangeCheck} checked={this.state.noLogin} />{' '}
                                No Login
                            </Label>
                        </FormGroup>
                    </Col>
                    <Col>
                        <h3>Dps Settings</h3><hr />
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" id="buttonEnable" onChange={this.handleChangeCheck} checked={this.state.buttonEnable} />{' '}
                                ButtonEnable
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" id="molexEnable" onChange={this.handleChangeCheck} checked={this.state.molexEnable} />{' '}
                                MolexEnable
                            </Label>
                        </FormGroup>
                        <FormGroup check>
                            <Label check>
                                <Input type="checkbox" id="automaticPowerOn" onChange={this.handleChangeCheck} checked={this.state.automaticPowerOn} />{' '}
                                AutomaticPowerOn
                            </Label>
                        </FormGroup>
                    </Col>
                </Row>
                <FormGroup style={{marginTop: "20px"}}>
                    <Button type="submit" color="success" disabled={this.state.saved || !this.validateForm()}>
                        <i className="fa fa-save"></i>{this.state.saved ? " Saved" : " Save"}
                    </Button>
                </FormGroup>
            </Form>
        );
    }
}