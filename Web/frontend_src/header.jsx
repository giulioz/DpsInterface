/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React, { Component } from 'react';
import { Container, Navbar, NavbarBrand,
    Nav, NavItem, NavLink } from 'reactstrap';
import BackendInterface from './backend_interface.jsx';
import { RouteNavItem } from "./ui_controls.jsx";


export default class NavHeader extends Component {
    logout = async () => {
        await BackendInterface.Logout();
        location.reload();
    }

    render() {
        const style = {
            marginBottom: '20px'
        };

        return (
            <Navbar style={style} color="faded" light expand="md">
                <NavbarBrand href="/">
                    <h2><i className="fa fa-bolt" aria-hidden="true"></i> DpsInterface</h2>
                </NavbarBrand>
                <Nav className="ml-auto" navbar>
                    <RouteNavItem highlight={true} href="/">
                        <NavLink href="#">
                            <i className="fa fa-home" aria-hidden="true"></i> Dashboard
                        </NavLink>
                    </RouteNavItem>
                    <RouteNavItem highlight={true} href="/settings">
                        <NavLink href="#">
                            <i className="fa fa-wrench" aria-hidden="true"></i> Settings
                        </NavLink>
                    </RouteNavItem>
                    <RouteNavItem href="/" highlight={false}>
                        <NavLink href="#" onClick={this.logout}>
                            <i className="fa fa-sign-out" aria-hidden="true"></i> Logout
                        </NavLink>
                    </RouteNavItem>
                </Nav>
            </Navbar>
        );
    }
}