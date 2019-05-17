import 'date-fns';
import React, { Component } from 'react'
import { connect } from 'react-redux'
import { Redirect } from 'react-router-dom'
import { Select } from 'react-materialize'
import DateFnsUtils from '@date-io/date-fns';
import  firebase  from '../../config/fbConfig';
import { MuiPickersUtilsProvider, TimePicker, DatePicker } from 'material-ui-pickers';
import "react-datepicker/dist/react-datepicker.css";
import { updateUser } from '../../store/actions/updateUser'


class UpdateUser extends Component {
state = {
    myCellNumber: '',
    mySponsorNumber: '',
    passcode: '',
    myFirstTextadorMessageNumber: '',
    handle: '',
    createdAt: ''
}


  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.fetchCurrentUser(this.props.auth)
      } else {
        // User not logged in or has just logged out.
      }
    });
  }

  componentWillReceiveProps(props) {
    this.fetchCurrentUser(props.auth)
  }

  fetchCurrentUser(auth) {
    let db = firebase.firestore()
    db.collection('users').where("myCellNumber", "==", auth.phoneNumber).get()
    .then(snapshot => {
      snapshot.forEach( doc => {
        this.setState({ thisUser: doc.id })
      })
    })
    .catch(error => {
      console.log('Error!', error)
    })
  }


  handleDateChange = date => {
    this.setState({ startDate: date });
  };

  handleChange = (e) => {
    console.log(e.target.id);
    console.log(e.target.value);
    this.setState({
      [e.target.id]: e.target.value
    })
  }

  handleSubmit = (e) => {
    e.preventDefault();
    // console.log(this.state);
    this.props.createJob(this.state);
    this.props.history.push('/jobs');
  }

  render() {
 
    const { classes } = this.props;
    const { startDate } = this.state;
    const { user, auth } = props;
    if (!auth.uid) return <Redirect to='/login' />
    
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          <h5 className="grey-text text-darken-3">Update your profile</h5>
          <div className="input-field">

          </div>
          <div className="input-field">
            <input type="text" id='myCellNumber' onChange={this.handleChange} placeholder={user.myCellNumber}/>
            <label htmlFor="description">My Cell Number</label>
          </div>
          <div>

          </div>
          <div className="input-field">
            <input type="text" id='startAddress' onChange={this.handleChange} />
            <label htmlFor="startAddress">Start Address</label>
          </div>
          <div className="input-field">
            <input type="text" id='endAddress' onChange={this.handleChange} />
            <label htmlFor="endAddress">End Address</label>
          </div>
          <div className="input-field">
            <input type="text" id='wage' onChange={this.handleChange} />
            <label htmlFor="wage">Wage</label>
          </div>
          <input type='hidden' key={this.id} />
        </form>
      </div>
    )
  }
}


const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = dispatch => {
  return {
    updateUser: (user) => dispatch(updateUser(user))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(UpdateUser)
