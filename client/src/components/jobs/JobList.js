import React from 'react'
import JobSummary from './JobSummary'
import { Link } from 'react-router-dom'

const JobList = ({jobs}) => {
  return (
    <div className="section">
      <div className="row">
        { jobs && jobs.map(job => {
          console.log("THIS JOB ID: ======>", job.id)
          if (job.jobOpen) {
            return (
              <div className="col l4 m4 s12" key={job.id}>
                <Link to={'/job/' + job.id}>
                    <JobSummary job={job} />
                </Link>
              </div>
            )
          }
          else {
            return
          }
        })}  
      </div>
    </div>
  )
}

export default JobList
