import React from 'react'
import UserSummary from './UserSummary'
import { Link } from 'react-router-dom'

const UserList = ({users}) => {
  return (
    <div className="section">
      <div className="row">
        { users && users.map(user => {
          return (
            <div className="col l4 m4 s6" key={user.id}>
              <Link to={'/user/' + user.id}>
                  <UserSummary user={user} />
              </Link>
            </div>
          )
        })}  
      </div>
    </div>
  )
}

export default UserList
