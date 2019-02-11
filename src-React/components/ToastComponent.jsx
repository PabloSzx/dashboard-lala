import $ from 'jquery';
import React, {Component} from 'react';

import './css/Toast.css';

class ToastComponent extends Component{

   constructor(){
     super();
     this.state = { message:"Message",type:"Error"}
   }
   componentDidMount() {
      this.props.onRef(this);
  }
  componentWillUnmount() {
    this.props.onRef(undefined)
  }

  show(type,message) {

    this.setState({type:type,message:message});
    $('#reactToast').toast('show');
  }

  renderIcon(){
    if(this.state.type=="Error"){
      return (
        <i class="material-icons text-danger mr-3">info</i>
      );
    }else{
      return (
        <i class="material-icons text-success mr-3">check</i>
      );
    }
  }
   render(){
     return(
       <div>
         <div  aria-live="polite" aria-atomic="true" className="">
           <div id="reactToast" class={`toast toastStyle ${(this.state.type=="Error" ? "toastError":"toastSuccess")}`} data-delay={this.props.delay}>
             <div class="toast-header">
               {this.renderIcon()}
               <strong class={`mr-auto ${(this.state.type=="Error" ? "text-danger":"text-success")}`}>{this.state.type}</strong>
               <small></small>
               <button type="button" class="ml-2 mb-1 close" data-dismiss="toast" aria-label="Close">
                 <span aria-hidden="true">&times;</span>
               </button>
             </div>
             <div class={`toast-body ${(this.state.type=="Error" ? "text-danger":"text-success")}`}>
               {this.state.message}
             </div>
           </div>
         </div>
       </div>
     );
   }
}

ToastComponent.defaultProps = {
  delay:'2500'
};

export default ToastComponent;
