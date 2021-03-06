import React, {Component} from 'react';
import d3Comp from './js/d3TimeLine';

import './css/TimeLine.css';
class D3TimeLineReactComponent extends Component {

  constructor() {
    super();

    // Keep a reference of a DOM element
    this.nodeRef = null;
    this.setRef = (ref)=>{
      this.nodeRef = ref;
    }

  }

  componentDidMount(){
    d3Comp.createGraphic(this.nodeRef,this.props.PGA,this.props.PSP,false);
  }

  shouldComponentUpdate(prevProps){
      return prevProps.PGA !== this.props.PGA;
  }

  componentDidUpdate() {
    // LLamada a D3. Update().
    //d3Comp.updateGraphic(this.nodeRef,this.props.PGA,this.props.PSP);
  }
  render(){
    return(<div className="D3container" ref={this.setRef} />);
  }
}

export default D3TimeLineReactComponent;
