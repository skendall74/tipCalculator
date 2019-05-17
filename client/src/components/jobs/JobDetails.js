import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import moment from 'moment'

const JobDetails = (props) => {
  const id = props.match.id;
  const { job, auth } = props;
  if (!auth.uid) return <Redirect to='/login' /> 
  if (job) {
    return (
      <Link to={'/jobs'}>
        <div className="card" key={id}>
          <div className="card-image">
            <img alt={job.title} src={ job.image ? job.image : ('https://via.placeholder.com/300/09f/333.png') } />
          </div>
          <div className="card-content">
            <span className="card-title">{job.title}</span>
            <p>{job.description}</p>
            <p>${job.price}</p>
          </div>
          <div className="card-action grey lighten-4 grey-text">
            <div>Posted by {job.systemNumber}</div>
            <div>{moment(job.createdAt.toDate()).calendar()}</div>
          </div>
        </div>
      </Link>

    )
  } else {
    return (
      <div className="container center">
        <p>Loading job...</p>
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
