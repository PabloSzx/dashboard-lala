import React, {Component} from 'react';
import d3Comp from './js/d3Dashboard';

import './css/Dashboard.css';

class D3DashboardReactComponent extends Component {

  constructor() {
    super();

    // Keep a reference of a DOM element
    this.nodeRef = null;
    this.setRef = (ref)=>{
      this.nodeRef = ref;
    }
  }

  componentDidMount(){
    d3Comp.createGraphic(this.nodeRef,this.props.Program,this.props.StudentAcademic);
  }

  shouldComponentUpdate(){
      return false;
  }
  componentDidUpdate() {
    // LLamada a D3. Update().
    //d3Comp.updateGraphic(this.nodeRef,this.props.PGA,this.props.PGP);
  }
  render(){
    return(<div className="D3_DasboardContainer" ref={this.setRef} />);
  }
}

export default D3DashboardReactComponent;
