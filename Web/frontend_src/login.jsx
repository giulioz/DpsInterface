/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React, { Component } from 'react';
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, Collapse, Alert } from 'reactstrap';
import BackendInterface from './backend_interface.jsx';

export default class Login extends Component {
    constructor(props) {
        super(props);

        this.state = {
            password: "",
            wrongPassword: false
        };
    }

    validateForm() {
        return this.state.password.length > 0;
    }

    handleChange = (event) => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    handleSubmit = async (event) => {
        event.preventDefault();

        var loggedIn = await BackendInterface.Login(this.state.password);
        if (loggedIn) {
            this.props.onLoggedIn(true);
        } else {
            this.setState({
                wrongPassword: true
            });
        }
    }

    render() {
        return (
            <Container>
                <Row className="justify-content-md-center">
                    <Col sm="4">
                        <h2><i className="fa fa-bolt" aria-hidden="true"></i> DpsInterface</h2>
                        <hr />
                        <Form onSubmit={this.handleSubmit}>
                            <FormGroup>
                                <Label for="password">Password:</Label>
                                <Input autoFocus value={this.state.password} onChange={this.handleChange} id="password" type="password" />
                            </FormGroup>
                            <Button type="submit" color="success" block disabled={!this.validateForm()}>
                                <i className="fa fa-sign-in"></i> Login
                            </Button>
                            <Collapse isOpen={this.state.wrongPassword}>
                                <Alert color="danger">
                                    Wrong password: try again.
                                </Alert>
                            </Collapse>
                        </Form>
                    </Col>
                </Row>
            </Container>
        );
    }
}