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
import ReactInterval from './react_interval.jsx';
import BackendInterface from './backend_interface.jsx';
import DashboardCard from './dashboard_card.jsx';

const updateTimeout = 500;

export default class Dashboard extends Component {
    constructor(props) {
        super(props);

        this.state = {
            states: [],
            backendConnection: true,
            serialConnection: true
        };
    }

    onUpdate = async () => {
        var auth = await BackendInterface.LoggedIn();
        if (auth === false) {
            window.location.reload();
        } else {
            var connection = await BackendInterface.ConnectionState();
            var _states;
            if (connection != null && connection.state) {
                _states = await BackendInterface.GetAllStates();
                if (!_states) {
                    _states = Array(BackendInterface.GetDpsNum()).fill(null);
                }
            } else {
                _states = Array(BackendInterface.GetDpsNum()).fill(null);
            }
            this.setState({
                states: _states,
                backendConnection: connection != null,
                serialConnection: connection != null && connection.state
            });
        }
    }

    render() {
        var noNodes = true;
        this.state.states.forEach(v => {
            if (v && v.Ping > 0) {
                noNodes = false;
            }
        });

        return (
            <div>
                <ReactInterval timeout={updateTimeout} callback={() => this.onUpdate(this)} />

                <Collapse isOpen={!this.state.serialConnection}>
                    <Alert color="danger">
                        {this.state.backendConnection ? "Serial port not connected." : "Cannot connect to server."}
                    </Alert>
                </Collapse>
                <Collapse isOpen={noNodes && this.state.serialConnection}>
                    <Alert color="warning">
                        No PSUs found.
                    </Alert>
                </Collapse>
                <div>
                    {this.state.states.map((state, i) => {
                        // remove TRUE to hide disconnected nodes
                        if (state && state.Ping) {
                            return (<DashboardCard key={i} dpsId={i} dpsState={state} />);
                        }
                    })}
                </div>
            </div>
        );
    }
}