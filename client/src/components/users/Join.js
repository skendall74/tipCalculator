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
        <div className="row">
            <h1>You a member of this RING</h1>
        </div>
      </div>
    )
  } else {
    return (
    <div className="container">
        <div className="row">
            <h1 className="center">Join this RING</h1>
            <div className="col s12">
                <h4 className="center">1) Send an SMS message:<br></br><br></br>TO: +12028398236<br></br>FROM: {auth.phoneNumber}</h4>
                <h4 className="center">2) Use this JOIN code: 12345</h4>
                <h4 className="center">3) Follow the prompts to create your account.</h4>
            </div>
        </div>
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
