import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
import moment from 'moment'


const UserDetails = (props) => {
  const { user, auth } = props;
  if (!auth.uid) return <Redirect to='/login' /> 
  if (user) {
    
    return (
      <div className="container">
        <Link to={'/users'}>
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
                    <div className="row">
                    <div className="col">
                        <p>My Textador Sponsor: {user.myFirstTextadorMessageNumber}</p>
                    </div>
                    </div>
                </div>
                <div className="card-action">
                    <div>Joined:<br></br>{moment(user.createdAt.toDate()).calendar()}</div>
                </div>
            </div>
        </Link>
      </div>
    )
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
  const users = state.firestore.data.users;
  const user = users ? users[id] : null
  return {
    user: user,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([{
    collection: 'users'
  }])
)(UserDetails)
