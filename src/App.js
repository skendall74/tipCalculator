import React, { Component } from 'react'
import Bill from './component/Bill.js'
import Tip from './component/Tip.js'
import People from './component/People.js'
import Amount from './component/Amount.js'
import './index.css'
import logo from './images/logo.svg' 

class App extends Component {
  constructor() {
    super()
    this.state = {
      billError: false,
      peopleError: false,
      bill: "",
      tip: "",
      custom: "",
      people: "",
      activeReset: false,
      tipPerPerson: "0.00",
      totalPerPerson: "0.00",
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleClick = this.handleClick.bind(this)
    this.figureTip = this.figureTip.bind(this)
  }

  handleChange(event) {
    const {name, value} = event.target

    if(name === "bill") {
      const re = /^\d{0,8}(\.\d{0,2})?$/g
      if(value === "0") {
        this.setState ({ billError: true })
      } else {
        if (re.test(value)) {
          this.setState ({
            billError: false,
            bill: value,
            activeReset: true
          }, () => { this.figureTip() })
        }
      }
    }
    if(name === "people") {
      const re = /^\d{0,6}?$/g
      if(value === "0") {
        this.setState ({ peopleError: true })
      } else {
        if(re.test(value)) {
          this.setState ({
            peopleError: false,
            people: value,
            activeReset: true
          }, () => { this.figureTip() })
        }
      }
    }

    if(name === "tip_custom") {
      const re = /^\d{0,3}(\.\d{0,2})?$/g
      if(re.test(value)) {
         this.setState ({
          tip: value,
          custom: value,
          activeReset: true
        }, () => {
          this.figureTip()
        })
      }
    }
    if(name === "tip") {
      this.setState ({
        tip: value,
        custom: "",
        activeReset: true
      }, () => { this.figureTip() })
    }
  }

  figureTip() {
    if(this.state.people > 0) {
      let tip = ((this.state.bill * (this.state.tip/100)) / this.state.people).toFixed(2)
      let total = (parseFloat(this.state.bill / this.state.people) + parseFloat(tip)).toFixed(2)
      this.setState ({
        tipPerPerson: tip,
        totalPerPerson: total
      })
    }
  }

  handleClick() {
    this.setState ({
      billError: false,
      peopleError: false,
      activeReset: false,
      bill: "",
      tip: "",
      custom: "",
      people: "",
      tipPerPerson: "0.00",
      totalPerPerson: "0.00"
    })
  }

  render() {
    return (
      <div className="container container--holder">
        <img className="tip_cal_logo" src={logo} alt="Tip Calculator Logo" />
        <div className="calculator">
          <div className="calculator__left">
            <Bill BillError={this.state.billError} Bill={this.state.bill} handleChange={this.handleChange}/>
            <Tip Tip={this.state.tip} Custom={this.state.custom} handleChange={this.handleChange}/>  
            <People PeopleError={this.state.peopleError} People={this.state.people} handleChange={this.handleChange}/>
          </div>

          <Amount 
            ActiveReset={this.state.activeReset} 
            TipPerPerson={this.state.tipPerPerson} 
            TotalPerPerson={this.state.totalPerPerson} 
            handleClick={this.handleClick}
          />

        </div>
      </div>
    )
  }
}

export default App;