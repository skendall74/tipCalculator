import React, { Component } from 'react'

class Amount extends Component {
  constructor(props) {
      super(props)
  }
  
  render() {
    return (
      <div className="calculator__right">
        <div>
          <div className="calculator__amount">
            <div className="calculator__amount--label">
              <div className="label--one">Tip Amount</div>
              <div className="label--two">/ person</div>
            </div>
            <span className="calculator__amount--text tip">${this.props.TipPerPerson}</span>
          </div>
          <div className="calculator__amount">
            <div className="calculator__amount--label">
              <div className="label--one">Total</div>
              <div className="label--two">/ person</div>
            </div>
            <span className="calculator__amount--text total">${this.props.TotalPerPerson}</span>
          </div>
        </div>
        <div>
          <button className={`calculator__amount--reset ${this.props.ActiveReset ? "active" : ""}`} onClick={this.props.handleClick}>Reset</button>
        </div>
      </div>
    )
  }
}

export default Amount
