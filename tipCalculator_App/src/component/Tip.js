import React, { Component } from 'react'

class Tip extends Component{
  constructor(props) {
    super(props)
  }

  render() {
    return (
      <div className="calculator__select-tip">
        <label className="calculator__label grey">Select Tip %</label>
        <div className="calculator__tip">
        <div className="calculator__perct">
            <input 
              type="radio" 
              name="tip" 
              id="tip_5" 
              value="5" 
              checked={this.props.Tip === "5"} 
              onChange={(e) => this.props.handleChange(e)}
            />
            <label htmlFor="tip_5">5%</label>
        </div>
        <div className="calculator__perct">
            <input 
              type="radio" 
              name="tip" 
              id="tip_10" 
              value="10" 
              checked={this.props.Tip  === "10"} 
              onChange={(e) => this.props.handleChange(e)}
            />
            <label htmlFor="tip_10">10%</label>
        </div>
        <div className="calculator__perct">
            <input 
              type="radio" 
              name="tip" 
              id="tip_15" 
              value="15" 
              checked={this.props.Tip  === "15"} 
              onChange={(e) => this.props.handleChange(e)}
          />
            <label htmlFor="tip_15">15%</label>
        </div>
        <div className="calculator__perct">
            <input 
              type="radio" 
              name="tip" 
              id="tip_25" 
              value="25" 
              checked={this.props.Tip  === "25"} 
              onChange={(e) => this.props.handleChange(e)}
            />
            <label htmlFor="tip_25">25%</label>
        </div>
        <div className="calculator__perct">
            <input 
              type="radio" 
              name="tip" 
              id="tip_50" 
              value="50" 
              checked={this.props.Tip === "50"} 
              onChange={(e) => this.props.handleChange(e)}
            />
            <label htmlFor="tip_50">50%</label>
        </div>
        <div className="calculator__perct">
            <input 
              type="text" 
              className="calculator__text custom" 
              aria-label="Custom"
              name="tip_custom"
              value={this.props.Custom}
              placeholder="Custom"
              onChange={(e) => this.props.handleChange(e)}
            />
        </div>
        </div>
      </div>
    )
  }
}

export default Tip
