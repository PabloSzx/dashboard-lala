import axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  d3Timeline as D3Component,
  d3Dashboard as D3DashboardComponent,
} from "./d3";
import { Nav, Toast } from "./";
import { withAuth } from "@okta/okta-react";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
axios.defaults.headers.common = { "X-Requested-With": "XMLHttpRequest" };

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      programStructure: null,
      studentAcademic: null,
      PGA: [],
      PSP: [],
      lastDate: "mm/dd/yyyy",
      authenticated: null,
    };
    this.searchStudent = this.searchStudent.bind(this);

    this.checkAuthentication = this.checkAuthentication.bind(this);
    this.login = this.login.bind(this);
    this.logout = this.logout.bind(this);
  }

  async checkAuthentication() {
    const authenticated = await this.props.auth.isAuthenticated();
    console.log("authenticated", authenticated);
    if (authenticated !== this.state.authenticated) {
      this.setState({ authenticated });
    }

    return authenticated;
  }

  async login() {
    this.props.auth.login("/");
  }

  async logout() {
    this.props.auth.logout("/");
  }

  async componentDidMount() {
    const authenticated = await this.checkAuthentication();
    if (!authenticated) {
      this.login();
    }
  }

  async componentDidUpdate() {
    this.checkAuthentication();
  }

  searchStudent(studentId) {
    let component = this;
    component.setState({
      programStructure: null,
      studentAcademic: null,
      PSP: null,
      PGA: null,
    });
    return new Promise((resolve, reject) => {
      setTimeout(function() {
        /*if(true){
            let programStructure = require('./components/config/program.json');
            let studentAcademic = require('./components/config/studentInfo.json');
            let PSP = studentAcademic.terms.map(function(d,i){return d.termAvg});
            let PGA = studentAcademic.terms.map(function(d,i){return d.accAvg});

            let date = component.getDate(programStructure.lastDataUpdate);

            component.setState({programStructure: programStructure,studentAcademic:studentAcademic,PSP:PSP,PGA:PGA,lastDate:date});
            component.toast.show("Success","Estudiante de prueba");
          }
          else{
            component.setState({programStructure: null,studentAcademic:null,PSP: null,PGA: null});
            component.toast.show("Error","No se encontró al estudiante");
          }*/

        component
          .getStudentacademics(studentId, component.props.auth.programs[0])
          .then(response => {
            let studentAcademic = response.data;
            let year = studentAcademic.planYear;
            let PSP = studentAcademic.terms.map(function(d, i) {
              return d.termAvg;
            });
            let PGA = studentAcademic.terms.map(function(d, i) {
              return d.accAvg;
            });
            component.setState({
              studentAcademic: studentAcademic,
              PSP: PSP,
              PGA: PGA,
            });
            return component.getProgram(component.props.auth.programs[0], year);
          })
          .then(response => {
            let programStructure = response.data;
            let date = component.getDate(programStructure.lastDataUpdate);
            component.setState({
              programStructure: programStructure,
              lastDate: date,
            });
            component.toast.show("Success", "Estudiante " + studentId);
            resolve();
          })
          .catch(error => {
            component.setState({
              programStructure: null,
              studentAcademic: null,
              PSP: null,
              PGA: null,
            });
            component.toast.show("Error", error.response.data.detail);
            resolve();
          });
        //resolve();
      }, 1000);
    });
  }

  getProgram(programId, year) {
    let URL =
      process.env.NODE_ENV === "production"
        ? `http://${
            window.location.hostname
          }:8000/programs/${programId}?year=${year}`
        : `/programs/${programId}?year=${year}`;
    return axios.get(URL);
  }

  getStudentacademics(studentId, programId) {
    let URL =
      process.env.NODE_ENV === "production"
        ? `http://${
            window.location.hostname
          }:8000/students/${studentId}?program=${programId}`
        : `/students/${studentId}?program=${programId}`;
    return axios.get(URL);
  }

  getDate(date) {
    if (!date) return "mm/dd/yyyy";
    date = new Date(date);
    return date.toDateString();
  }

  render() {
    return (
      <div>
        {this.state.authenticated ? (
          <button onClick={this.logout}>Logout</button>
        ) : (
          <button onClick={this.login}>Login</button>
        )}
        <Nav
          searchFunction={this.searchStudent}
          programa={this.props.auth.programs[0]}
          lastDate={this.state.lastDate}
        />
        {this.state.programStructure && this.state.studentAcademic && (
          <div>
            <D3Component PGA={this.state.PGA} PSP={this.state.PSP} />
            <D3DashboardComponent
              Program={this.state.programStructure}
              StudentAcademic={this.state.studentAcademic}
            />
          </div>
        )}
        <Toast onRef={ref => (this.toast = ref)} />
      </div>
    );
  }
}

export default withAuth(connect(({ auth }) => ({ authUser: auth }), {})(App));
