import React from 'react'
import Timestamp from 'react-timestamp'

const JobSummary = ({job}) => {

  return (
    <div className="card" key={job.id}>
      <div className="card-image">
        <img alt={job.title} src={ job.imageUrl } />
      </div>
      <div className="card-content">
        <div className="row nomargin">
          <div className="col s12 l12">
            <h5 className="cardPadding">{job.description}</h5>
            <p>Location: <b>{job.startAddress}</b></p>
          </div>
          <div className="col s12">
            <p>When: <b><Timestamp relative date={job.startDate.toDate()} /></b></p>
            <h5 className="cardPadding right">You get: <b>${job.wage}</b></h5>
          </div>
        </div>
      </div>
      <div className="card-action">
        <div>Posted:<b><Timestamp relative date={job.createdAt.toDate()} /></b></div>
      </div>
    </div>
  )
}

export default JobSummary
