import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { getCurrentUser } from "../actions";
import { App } from "../components";

class Router extends Component {
  componentDidMount() {
    this.props.getCurrentUser();
  }

  render() {
    return (
      <Switch>
        <Route exact path="/" component={App} />
        <Redirect from="/*" to="/" />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = { getCurrentUser };

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Router));
