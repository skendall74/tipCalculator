import React from 'react'
import moment from 'moment'

const UserSummary = ({user}) => {

  return (
    <div className="card" key={user.id}>
      <div className="card-image">
        <img alt={user.title} src={ user.textadorImage } />
      </div>
      <div className="card-content">
        <div className="row">
          <div className="col s12 l12">
            <h5>{user.handle}</h5>
          </div>
        </div>
      </div>
      <div className="card-action">
        <div>Joined:<br></br>{moment(user.createdAt.toDate()).calendar()}</div>
      </div>
    </div>
  )
}

export default UserSummary
