import axios from "axios";
import React, { Component } from "react";
import { connect } from "react-redux";
import {
  d3Timeline as D3Component,
  d3Dashboard as D3DashboardComponent,
} from "./d3";
import { Nav, Toast } from "./";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min";
axios.defaults.headers.common = { "X-Requested-With": "XMLHttpRequest" };

class App extends Component {
  constructor() {
    super();
    this.state = {
      programStructure: null,
      studentAcademic: null,
      PGA: [],
      PSP: [],
      lastDate: "mm/dd/yyyy",
    };
    this.searchStudent = this.searchStudent.bind(this);
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
          .getStudentacademics(studentId, component.props.auth.programaId)
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
            return component.getProgram(component.props.auth.programaId, year);
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
        <Nav
          searchFunction={this.searchStudent}
          programa={this.props.programa}
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

export default connect(
  ({ auth }) => ({ auth }),
  {}
)(App);
