import React, { Component } from "react";
import ReactGA from "react-ga";

//ReactGA.initialize('UA-133535891-1'); // Here we should use our GA id

class NavComponent extends Component {
  constructor() {
    super();
    this.state = { textInput: "", searching: false };
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    ReactGA.initialize("UA-133535891-1");
  }

  handleChange(event) {
    this.setState({ textInput: event.target.value });
  }
  handleSubmit(event) {
    event.preventDefault();
    ReactGA.event({
      category: "User",
      action: "Example2",
    });
    let component = this;
    this.setState({ searching: true });
    this.props.searchFunction(this.state.textInput).then(() => {
      component.setState({ searching: false });
    });
  }

  renderSearchButton() {
    if (!this.state.searching) {
      if (this.state.textInput == "") {
        return (
          <button
            className="btn btn-secondary my-2 my-sm-1"
            type="submit"
            disabled
          >
            Buscar
          </button>
        );
      } else {
        return (
          <button className="btn btn-secondary my-2 my-sm-1" type="submit">
            Buscar
          </button>
        );
      }
    } else {
      return (
        <button
          className="btn btn-secondary my-2 my-sm-1"
          type="submit"
          disabled
        >
          <span
            className="spinner-border spinner-border-sm mr-3"
            role="status"
            aria-hidden="true"
          />
          Buscando...
        </button>
      );
    }
  }

  render() {
    return (
      <nav className="navbar navbar-expand-lg navbar-dark bg-dark">
        <button
          className="navbar-toggler"
          type="button"
          data-toggle="collapse"
          data-target="#navbarSupportedContent"
          aria-controls="navbarSupportedContent"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="navbarSupportedContent">
          <span className="navbar-text mr-sm-3 text-white">
            {this.props.programa} | estudiante:
          </span>

          <form className="form-inline" onSubmit={this.handleSubmit}>
            <input
              className="form-control mr-sm-3"
              type="search"
              placeholder="ID del estudiante"
              aria-label="Search"
              onChange={this.handleChange}
            />
            {this.renderSearchButton()}
          </form>
          <ul className="navbar-nav mr-auto" />

          <span className="navbar-text mr-3 text-white">
            Ultima actualización de datos: {this.props.lastDate}
          </span>

          <i className="material-icons text-primary mr-3">info</i>

          <a className="navbar-brand" href="/logout">
            Salir
          </a>
        </div>
      </nav>
    );
  }
}

export default NavComponent;
