import React, { Component } from 'react'
import JobList from '../jobs/JobList'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import  firebase  from '../../config/fbConfig';
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import { DateTime } from 'luxon';
let filter = { collection: 'jobs', limit: 10, orderBy: ['startDate', 'desc'], jobOpen: true, systemNumber: '+12028398236'}

class JobDashboard extends Component {
  constructor(props) {
    super(props)
    this.state = {
      thisUser: '',
      authorMyCellNumber: '',
      authorMySystemNumber: '',
      jobSystemNumber: '',
      title: '',
      description: '',
      startLocation: '',
      startDate: '',
      endLocation: '',
      wage: '',
      jobOpen: ''
    }
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

  updateFilter = state => {
    let conditions = [];
    if (state.mySystemNumber) {
      conditions.push(['authorMySystemNumber', '==', state.authorMySystemNumber]);
    }
   if (state.title) {
      conditions.push(['title', '==', state.title]);
    }
    filter.where = conditions;
  };

  render() {

    const buttonStyle = {
        marginLeft: 10
      }

    const { jobs, auth } = this.props;
    if (!auth.uid) return <Redirect to='/login' /> 

    if (this.state.thisUser) {
      return (
        <div className="dashboard container">
            <div className="row">
                <div className="col s12 m12 center">
                    <Link to='/hire'><button className="btn red darken-4" style={buttonStyle}>CREATE A JOB</button></Link>
                </div>
            </div>
            <div className="row">
                <div className="col s12 m12">
                    <div className="section section1">
                        <JobList jobs={jobs} />            
                    </div>
                </div>
            </div>
        </div>
      )
    }
    else {
      return (
        <div className="dashboard container">
            <div className="row">
                <div className="col s12 m12">
                    <div className="section section1">
                        <JobList jobs={jobs} />            
                    </div>
                </div>
            </div>
        </div>
      )
    }

  }
}


const mapStateToProps = (state) => {
  return {
    user: state.thisUser,
    auth: state.firebase.auth,
    profile: state.firebase.profile,
    jobs: state.firestore.ordered.jobs,
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([filter])
)(JobDashboard)