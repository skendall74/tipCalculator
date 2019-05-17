import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import moment from 'moment'
import { Link } from 'react-router-dom'

const UserDetails = (props) => {
  const id = props.match.id;
  const { user, auth } = props;
  if (!auth.uid) return <Redirect to='/login' /> 


  if (user) {
    let handle = user.handle
    let city = '';
    let state = '';
    let myClosest = '';

    if (user.whitePages.current_addresses[0]){
      city = user.whitePages.current_addresses[0].city;
    }
    else {
      city = 'N/A';
    }

    if (user.whitePages.current_addresses[0]){
      state = user.whitePages.current_addresses[0].state_code;
    }
    else {
      state = 'N/A';
    }

    if (user.whitePages.associated_people[0]){
      myClosest = user.whitePages.associated_people[0].name;
    }
    else {
      myClosest = 'N/A';
    }
    
    let carrier = user.whitePages.carrier;
    
  
    return (
      <Link to={'/users'}>
        <div className="container">
            <div className="card" key={user.id}>
              <div className="row">
                <div className="col s6 l6">
                  <div className="card-image col">
                    <img alt={user.title} src={ user.textadorImage } />
                  </div>
                </div>
                <div className="col s6 l6">
                  <h5>{handle}</h5>
                  <h6>{city}, {state}</h6>
                  <p>{carrier}</p>
                  <h6>My Ring: {user.myRingNumber}</h6>
                  <p>Real people: {myClosest}</p>
                </div>              
              </div>
              <div className="card-action">
                  <div>Joined:<br></br>{moment(user.createdAt.toDate()).calendar()}</div>
              </div>
            </div>
        </div>
      </Link>
    )
  } else {
    return (
      <div className="container center">
        <p>Loading post...</p>
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