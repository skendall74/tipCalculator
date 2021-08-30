import React, { Component } from 'react'
import IconPerson from './../images/icon-person.svg'

class People extends Component {
  constructor(props) {
      super(props)
  }

  render() {
    return (
      <div>
        <div className="calculator__flex-label">
          <label htmlFor="people" className="calculator__label grey">Number of People</label>
          <span className={`calculator__label ${this.props.PeopleError ? "error_msg" : "none"}`}>Can't be zero</span>
        </div>

        <div className="calculator__input">
          <img className="calculator__icon" src={IconPerson} alt="Person"/>
          <input 
            type="text"
            className={`calculator__text ${this.props.PeopleError ? "error" : ""}`} 
            name="people" 
            id="people"
            value={this.props.People}
            placeholder="0" 
            onChange={(e) => this.props.handleChange(e)}
          />
        </div> 
      </div>
    )
  }
}

export default People