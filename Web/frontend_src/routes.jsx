/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React from "react";
import { Route, Switch } from "react-router-dom";
import { Container } from 'reactstrap';
import Login from './login.jsx';
import Dashboard from './dashboard.jsx';
import Settings from './settings.jsx';
import NavHeader from './header.jsx';

export default ({ childProps }) => {
    if (!childProps.isAuthenticated) {
        return(<Login onLoggedIn={childProps.authenticate} />);
    } else {
        return (
            <Container>
                <NavHeader />
                <Switch>
                    <Route path="/" exact component={Dashboard} />
                    <Route path="/settings" exact component={Settings} />
                </Switch>
            </Container>
        );
    }
};