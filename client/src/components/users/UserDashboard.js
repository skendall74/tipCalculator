import React, { Component } from 'react'
import UserList from '../users/UserList'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import { Link } from 'react-router-dom'
let filter = { collection: 'users', limit: 24, orderBy: ['createdAt', 'desc']}

class UserDashboard extends Component {

state = {
    myCellNumber: '',
    mySponsorNumber: '',
    passcode: '',
    myFirstTextadorMessageNumber: '',
    handle: '',
    createdAt: ''
}


  handleChange = (e) => {
    this.setState({
      [e.target.name]: e.target.value
    })
  }
  
  handleSubmit = (e) => {
    e.preventDefault();
    this.updateFilter(this.state);
    this.props.firestore.get(filter);
    // console.log(this.state);
  }


  render() {

    const buttonStyle = {
        marginLeft: 10
      }

    const { users, auth } = this.props;
    if (!auth.uid) return <Redirect to='/login' /> 
    return (
        <div className="dashboard container">
            <div className="row">
                <div className="col s12 m12">
                    <div className="section section1">
                        <UserList users={users} />            
                    </div>
                </div>
            </div>
        </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    users: state.firestore.ordered.users,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([filter])
)(UserDashboard)