import React, { Component } from "react";
import { connect } from "react-redux";
import { Route, Switch, withRouter } from "react-router-dom";
import { getCurrentUser } from "../actions";
import { App } from "../components";
import { Security, SecureRoute, ImplicitCallback } from "@okta/okta-react";

const Protected = () => {
  return <div>protegido</div>;
};

class Router extends Component {
  componentDidMount() {
    this.props.getCurrentUser();
  }

  render() {
    return (
      <Security
        issuer="https://dev-600137.oktapreview.com/oauth2/default"
        client_id="0oajf1rz79jwdG4kZ0h7"
        redirect_uri={window.location.origin + "/implicit/callback"}
      >
        <Switch>
          <Route exact path="/dashboard" component={App} />
          <SecureRoute path="/protected" component={Protected} />
          <Route path="/implicit/callback" component={ImplicitCallback} />
        </Switch>
      </Security>
    );
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = { getCurrentUser };

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Router));
