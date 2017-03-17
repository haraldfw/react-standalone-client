// @flow

import React from 'react';
import { render } from 'react-dom'
import { Router, Route, hashHistory } from 'react-router'

class Menu extends React.Component {
  render() {
    return <div>Menu: <a href="/#/">Customers</a></div>;
  }
}

class CustomerService {
  static instance=null;
  lastId=0;
  customers=[];
  
  // Return singleton
  static get() {
    if(!CustomerService.instance)
      CustomerService.instance=new CustomerService();
    return CustomerService.instance;
  }
  
  constructor() {
    this.customers.push({id: ++this.lastId, name: "Ola", city: "Trondheim"});
    this.customers.push({id: ++this.lastId, name: "Kari", city: "Oslo"});
    this.customers.push({id: ++this.lastId, name: "Per", city: "Tromsø"});
  }
  
  // Returns a manually created promise since we are later going to use fetch(),
  // which also returns a promise, to perform an http request.
  getCustomers() {
    return new Promise((resolve, reject)=>{
      var customer_id_and_names=[];
      for(var c=0;c<this.customers.length;c++) {
        customer_id_and_names.push({id: this.customers[c].id, name: this.customers[c].name});
      }
      resolve(customer_id_and_names);
    });
  }
  
  getCustomer(customerId) {
    return new Promise((resolve, reject)=>{
      for(var c=0;c<this.customers.length;c++) {
        if(this.customers[c].id==customerId) {
          resolve(this.customers[c]);
          return;
        }
      }
      reject("Customer not found");
    });
  }
  
  addCustomer(name, city) {
    return new Promise((resolve, reject)=>{
      if(name && city) {
        this.customers.push({id: ++this.lastId, name: name, city: city});
        resolve(this.lastId);
        return;
      }
      reject("name or city empty");
    });
  }
}

class CustomerListComponent extends React.Component {
  state={status: "", customers: [], newCustomerName: "", newCustomerCity: ""}
  
  constructor() {
    super();
    
    CustomerService.get().getCustomers().then((result)=>{
      this.setState({status: "successfully loaded customer list", customers: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  
  // Event methods, which are called in render(), are declared as properties:
  onNewCustomerFormChanged = (event) => {
    this.setState({[event.target.name]: event.target.value});
  }
  
  // Event methods, which are called in render(), are declared as properties:
  onNewCustomer = (event) => {
    event.preventDefault();
    var name=this.state.newCustomerName;
    var city=this.state.newCustomerCity;
    CustomerService.get().addCustomer(name, city).then((result)=>{
      this.state.customers.push({id: result, name: name, city});
      this.setState({status: "successfully added new customer", customers: this.state.customers, newCustomerName: "", newCustomerCity: ""});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  
  render() {
    var listItems = this.state.customers.map((customer) => 
      <li key={customer.id}><a href={"/#/customer/"+customer.id}>{customer.name}</a></li>
    );
    return <div>status: {this.state.status}<br/><ul>{listItems}</ul>
        <form onSubmit={this.onNewCustomer} onChange={this.onNewCustomerFormChanged}>
          <label>Name:<input type="text" name="newCustomerName" value={this.state.newCustomerName} /></label>
          <label>City:<input type="text" name="newCustomerCity" value={this.state.newCustomerCity} /></label>
          <input type="submit" value="New Customer"/>
        </form>
      </div>
  }
}

class CustomerDetailsComponent extends React.Component {
  state={status: "", customer: {}}
  
  constructor(props) {
    super(props);
    
    CustomerService.get().getCustomer(props.params.customerId).then((result)=>{
      this.setState({status: "successfully loaded customer details", customer: result});
    }).catch((reason)=>{
      this.setState({status: "error: "+reason});
    });
  }
  
  render() {
    return <div>status: {this.state.status}<br/>
      <ul>
        <li>name: {this.state.customer.name}</li>
        <li>city: {this.state.customer.city}</li>
      </ul>
    </div>
  }
}

class Routes extends React.Component {
  render() {
    return <Router history={hashHistory}>
      <Route exact path="/" component={CustomerListComponent}/>
      <Route path="/customer/:customerId" component={CustomerDetailsComponent}/>
    </Router>;
  }
}

render(<div>
  <Menu/>
  <Routes/>
</div>, document.getElementById('root'));
