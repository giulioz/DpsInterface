/*
    =======================================
        DpsInterface
        Copyright, 2018 Giulio Zausa
        All rights reserved.
    =======================================
*/

'use strict';

import React, { Component } from 'react';
import { Route } from "react-router-dom";
import { NavItem } from "reactstrap";

export class VariableDisplay extends Component {
    render() {
        return [
            <dt className="col-sm-7" key={"dt_" + this.props.name}>{this.props.name}: </dt>,
            <dd className="col-sm-5" key={"dd_" + this.props.name}>{this.props.value}</dd>
        ];
    }
}

export class VariableDisplayList extends Component {
    render() {
        return (
            <dl className="row" style={{fontSize: '8pt'}}>
                {this.props.children}
            </dl>
        );
    }
}

export class Slider extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const style = {
            marginBottom: "1em"
        };

        return (
            <input style={style} type="range" value={this.props.value} onMouseUp={this.props.onChangeEnd}
                disabled={this.props.disabled} onChange={this.props.onChange} className="form-control" />
        );
    }
}

export class RouteNavItem extends Component {
    render() {
        return (
            <Route
                path={this.props.href}
                exact
                children={({ match, history }) =>
                    <NavItem
                        onClick={e => history.push(e.currentTarget.getAttribute("href"))}
                        {...this.props}
                        active={match && this.props.highlight ? true : false}>
                        {this.props.children}
                    </NavItem>}
                />
        );
    }
}