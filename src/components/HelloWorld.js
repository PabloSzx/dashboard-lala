import React, { Component } from "react";
import { connect } from "react-redux";

class App extends Component {
  render() {
    return <div>Hola Mundo!</div>;
  }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default connect(mapStateToProps, mapDispatchToProps)(App);
