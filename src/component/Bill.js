import React, { Component } from 'react'
import IconDollar from './../images/icon-dollar.svg'

class Bill extends Component {
  constructor(props) {
      super(props)
  }

  render() {
    return (
      <div>
        <div className="calculator__flex-label">
          <label htmlFor="bill" className="calculator__label grey">Bill</label>
          <span className={`calculator__label ${this.props.BillError ? "error_msg" : "none"}`}>Can't be zero</span>
        </div>
        <div className="calculator__input">
          <img className="calculator__icon" src={IconDollar} alt="Icon Dollar"/>
          <input 
            type="text" 
            className={`calculator__text ${this.props.BillError ? "error" : ""}`} 
            name="bill" 
            id="bill" 
            placeholder="0" 
            value={this.props.Bill}
            onChange={(e) => this.props.handleChange(e)}
          />
        </div> 
      </div>
    )
  }
}

export default Bill