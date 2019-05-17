import 'date-fns';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { createJob } from '../../store/actions/jobActions';
import { Redirect } from 'react-router-dom';
import { Select } from 'react-materialize';
import DateFnsUtils from '@date-io/date-fns';
import firebase from '../../config/fbConfig';
import {
  MuiPickersUtilsProvider,
  TimePicker,
  DatePicker,
} from 'material-ui-pickers';
import 'react-datepicker/dist/react-datepicker.css';
import { Elements, StripeProvider } from 'react-stripe-elements';
import CheckoutForm from './CheckoutForm';

class CreateJob extends Component {
  state = {
    imageUrl: '',
    thisUser: '',
    title: '',
    description: '',
    startDate: new Date(),
    startAddress: '',
    endAddress: '',
    systemNumber: '+15183339675',
    jobCreatorPhoneNumber: '',
    systemNumber: '',
    wage: '',
    jobOpen: true
  }


  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.fetchCurrentUser(this.props.auth);
        let thisPhone = user.phoneNumber;
        console.log("PHONE NUMBER: ", thisPhone)
        let db = firebase.firestore()
        db.collection('users').where("myCellNumber", "==", thisPhone).get()
        .then(snapshot => {
          snapshot.forEach( doc => {
            this.setState({ thisUser: doc.id })
            this.setState({ jobCreatorPhoneNumber: user.phoneNumber })
            this.setState({ systemNumber:  doc.data().myFirstTextadorMessageNumber})
          })
        })
        .catch(error => {
          console.log('Error!', error)
        })
    
        console.log('54 User ID!', this.state.jobCreatorPhoneNumber)
      } else {
        // User not logged in or has just logged out.
      }
    });
  }

  componentWillReceiveProps(props) {
    this.fetchCurrentUser(props.auth);
  }

  fetchCurrentUser(auth) {
    let db = firebase.firestore();
    db.collection('users')
      .where('myCellNumber', '==', auth.phoneNumber)
      .get()
      .then(snapshot => {
        snapshot.forEach(doc => {
          this.setState({ thisUser: doc.id });
        });
      })
      .catch(error => {
        console.log('Error!', error);
      });
  }


  handleDateChange = date => {
    this.setState({ startDate: date });
  };

  handleChange = e => {
    console.log(e.target.id);
    console.log(e.target.value);
    this.setState({
      [e.target.id]: e.target.value,
    });
  };

  handleSelect = e => {
    this.setState({
      [e.target.id]: e.target.value,
    });
    if (e.target.value === 'ride') {
      this.setState({ imageUrl: '../img/ride.jpg' });
    }
    if (e.target.value === 'photo') {
      this.setState({ imageUrl: '../img/photo.jpg' });
    }
    if (e.target.value === 'labor') {
      this.setState({ imageUrl: '../img/labor.jpg' });
    }
    if (e.target.value === 'cash') {
      this.setState({ imageUrl: '../img/cash.jpg' });
    }
    if (e.target.value === 'report') {
      this.setState({ imageUrl: '../img/report.jpg' });
    }
    if (e.target.value === 'count') {
      this.setState({ imageUrl: '../img/count.jpg' });
    }
    if (e.target.value === 'clean') {
      this.setState({ imageUrl: '../img/clean.jpg' });
    }
    if (e.target.value === 'deliver') {
      this.setState({ imageUrl: '../img/deliver.jpg' });
    }
    if (e.target.value === 'bank') {
      this.setState({ imageUrl: '../img/bank.jpg' });
    }
  };

  handleSubmit = e => {
    e.preventDefault();
    // console.log(this.state);
    this.props.createJob(this.state);
    this.props.history.push('/jobs');
  };

  render() {
    const { classes } = this.props;
    const { startDate } = this.state;
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to="/login" />;
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          <h5 className="grey-text text-darken-3">
            Create a New Job
          </h5>
          <div className="input-field">
            <Select
              id="title"
              onChange={this.handleSelect}
              value={this.handleSelect}
            >
              <option value="" disabled>
                Choose a job category
              </option>
              <option value="photo">Photo</option>
              <option value="labor">Labor</option>
              <option value="count">Count</option>
              <option value="report">Report</option>
              <option value="clean">Clean</option>
              <option value="ride">Ride</option>
              <option value="deliver">Deliver</option>
            </Select>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="description"
              onChange={this.handleChange}
              required
            />
            <label htmlFor="description">Job Description</label>
          </div>
          <div>
            <MuiPickersUtilsProvider utils={DateFnsUtils}>
              <DatePicker
                margin="normal"
                label="Start Date"
                value={startDate}
                onChange={this.handleDateChange}
              />
              <TimePicker
                margin="normal"
                label="Start Time"
                value={startDate}
                onChange={this.handleDateChange}
              />
            </MuiPickersUtilsProvider>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="startAddress"
              onChange={this.handleChange}
              required
            />
            <label htmlFor="startAddress">Start Address</label>
          </div>
          <div className="input-field">
            <input
              type="text"
              id="endAddress"
              onChange={this.handleChange}
            />
            <label htmlFor="endAddress">End Address</label>
          </div>
          <div className="input-field">

            <input type="number" id='wage' onChange={this.handleChange} required/>
            <label htmlFor="wage">Wage</label>
          </div>
          <input type='hidden' value={this.id} key={this.id} />
          <input type='hidden' value={this.systemNumber} key={this.systemNumber} />
          <input type='hidden' value={this.jobCreatorPhoneNumber} key={this.jobCreatorPhoneNumber} />
          <input type='hidden' value={this.systemNumber} key={this.systemNumber} />
          <input type='hidden' value={this.jobOpen} key={this.jobOpen} />

          <StripeProvider apiKey="STRIPE_PUBLISHABLE_KEY)">
            <Elements>
              <CheckoutForm />
            </Elements>
          </StripeProvider>
        </form>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createJob: job => dispatch(createJob(job)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(CreateJob);
