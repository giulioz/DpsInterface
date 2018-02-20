/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';
import "babel-polyfill";

import 'bootstrap/dist/css/bootstrap.min.css';
import 'font-awesome/css/font-awesome.min.css';
import './style.css';

import 'bootstrap';
import 'jquery';
import 'popper.js';
import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter as Router } from "react-router-dom";
import { Container, Row, Col, Button, Form, FormGroup, Label, Input, FormText } from 'reactstrap';
import Routes from "./routes.jsx";
import BackendInterface from './backend_interface.jsx';


class App extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isAuthenticated: props.isAuthenticated
        };
    }

    authenticate = (value) => {
        this.setState({ isAuthenticated: value });
    }

    render() {
        const childProps = {
            isAuthenticated: this.state.isAuthenticated,
            authenticate: this.authenticate
        };
        
        return (
            <Routes childProps={childProps} />
        );
    }
}


async function Main() {
    var loggedIn = await BackendInterface.LoggedIn();
    ReactDOM.render(
        <Router>
            <App isAuthenticated={loggedIn} />
        </Router>,
        document.getElementById('root')
    );
} Main();