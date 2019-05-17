import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import moment from 'moment'
import Timestamp from 'react-timestamp'
import './jobPage.css';


const JobDetails = (props) => {
  const { job, auth } = props;
  if (!auth.uid) return <Redirect to='/login' /> 
  if (job) {


    if (job.textadorImage) {
      return (
        <div className="container">
          <button className="btn directions"><a href={"//maps.google.com/?q=" + job.startAddress } target="_blank" params={job.startAddress}>Directions: {job.startAddress}</a></button>
          <a href='/jobs'>
            <div className="card" key={job.id}>
              <div className="card-image">
                <img alt={job.title} src={ job.imageUrl } />
              </div>
              <div className="card-content">
                <div className="row nomargin">
                  <div className="col s12">
                    <h5 className="cardPadding">{job.description}</h5>
                  </div>
                  <div className="col s6 l6">
                    <p>Start Location:</p>
                    <b>{job.startAddress}</b>
                  </div>
                  <div className="col s6 l6">
                    <p>End Location:</p>
                    <b>{job.endAddress}</b>
                  </div>
                </div>
                <div className="row nomargin">
                  <div className="col">
                    <p>When: <b><Timestamp relative date={job.startDate.toDate()} /></b></p>
                  </div>
                  <div className="col right">
                  <h5 className="cardPadding">You get: <b>${job.wage}</b></h5>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <div>Posted:<b><Timestamp relative date={job.createdAt.toDate()} /></b></div>
                <div className="giveTo">
                  <p>Deliver to:</p>
                  <img alt={job.title} src={ job.textadorImage } width="100%"/>
                </div>
              </div>
            </div>
          </a>
        </div>
      )
    }
  
    else {
      return (
        <div className="container">
          <button className="btn directions"><a href={"//maps.google.com/?q=" + job.startAddress } target="_blank" params={job.startAddress}>Directions: {job.startAddress}</a></button>
          <a href='/jobs'>
            <div className="card" key={job.id}>
              <div className="card-image">
                <img alt={job.title} src={ job.imageUrl } />
              </div>
              <div className="card-content">
                <div className="row nomargin">
                  <div className="col s12">
                    <h5 className="cardPadding">{job.description}</h5>
                  </div>
                  <div className="col s6 l6">
                    <p>Start Location:</p>
                    <b>{job.startAddress}</b>
                  </div>
                  <div className="col s6 l6">
                    <p>End Location:</p>
                    <b>{job.endAddress}</b>
                  </div>
                </div>
                <div className="row nomargin">
                  <div className="col">
                    <p>When: <b><Timestamp relative date={job.startDate.toDate()} /></b></p>
                  </div>
                  <div className="col right">
                  <h5 className="cardPadding">You get: <b>${job.wage}</b></h5>
                  </div>
                </div>
              </div>
              <div className="card-action">
                <div>Posted:<b><Timestamp relative date={job.createdAt.toDate()} /></b></div>
              </div>
            </div>
          </a>
        </div>

      )
    }
  } else {
    return (
      <div className="container center">
        <p>Loading jobs...</p>
      </div>
    )
  }
}

const mapStateToProps = (state, ownProps) => {
  // console.log(state);
  const id = ownProps.match.params.id;
  const jobs = state.firestore.data.jobs;
  const job = jobs ? jobs[id] : null
  return {
    job: job,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([{
    collection: 'jobs'
  }])
)(JobDetails)
