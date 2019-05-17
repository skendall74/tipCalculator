import React, { Component } from 'react'
import PostList from '../posts/PostList'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import  firebase  from '../../config/fbConfig';
let filter = { collection: 'posts', limit: 24, orderBy: ['createdAt', 'desc']}

class MyPostsDashboard extends Component {
  state = {
    firstName: '',
    lastName: '',
    thisUser: '',
    title: '',
    geoLocation: ''
  }

  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        this.fetchCurrentUser(this.props.auth)
        let conditions = [];
        conditions.push(['authorId', '==', this.props.auth.phoneNumber]);
        filter.where = conditions;
      } else {
        // User not logged in or has just logged out.
      }
    });
  }

  componentWillReceiveProps(props) {
    this.fetchCurrentUser(props.auth)
  }

  fetchCurrentUser(auth) {
    let db = firebase.firestore()
    db.collection('users').where("myCellNumber", "==", auth.phoneNumber).get()
    .then(snapshot => {
      snapshot.forEach( doc => {
        this.setState({ thisUser: doc.data().phoneNumer })
      })
    })
    .catch(error => {
      console.log('Error!', error)
    })
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
    const { posts, auth } = this.props;
    if (!auth.uid) return <Redirect to='/login' /> 
    return (
      <div className="dashboard container">
        <div className="row">
          <div className="col s12 m12">
            <div className="section section1">
              <PostList posts={posts} />            
            </div>
          </div>
        </div>
      </div>
    )
  }
}
const mapStateToProps = (state) => {
  return {
    user: state.thisUser,
    posts: state.firestore.ordered.posts,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([filter])
)(MyPostsDashboard)