import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import { HelloWorld } from "../components";

class App extends Component {
  render() {
    return (
      <Switch>
        <Route exact path="/" component={HelloWorld} />
        <Redirect from="/*" to="/" />
      </Switch>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(App));
