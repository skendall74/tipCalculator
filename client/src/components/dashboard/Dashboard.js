import React, { Component } from 'react'
import PostList from '../posts/PostList'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
let filter = { collection: 'posts', limit: 10, orderBy: ['createdAt', 'desc']}

class Dashboard extends Component {
  state = {
    firstName: '',
    lastName: '',
    systemNumber: '',
    title: '',
    geoLocation: ''
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

  updateFilter = state => {
    let conditions = [];
    if (state.firstName) {
      conditions.push(['authorFirstName', '==', state.firstName]);
    }
   if (state.title) {
      conditions.push(['title', '==', state.title]);
    }
    if (state.systemNumber) {
      conditions.push(['ringNumber', '==', state.systemNumber]);
    }
    if (state.title) {
      conditions.push(['title', '==', state.title]);
    }
    filter.where = conditions;
  };

  render() {
    const { posts, auth } = this.props;
    if (!auth.uid) return <Redirect to='/login' /> 
    return (
      <div className="dashboard container">
        <form className="white" onSubmit={this.handleSubmit} >
            <div className="row">
                <div className="input-field col s6 l6">
                    <i className="material-icons prefix">phone</i>
                    <input id="icon_telephone textadorPhone" type="tel" name="systemNumber" onChange={this.handleChange} />
                    <label htmlFor="icon_telephone">Search by RING</label>
                </div>
                <div className="input-field col s6 l6">
                    <i className="material-icons prefix">Title</i>
                    <input type="text" name="title" id='icon_prefix texadorTitle' onChange={this.handleChange} />
                    <label htmlFor="icon_prefix">Search by TITLE</label>
                </div>
                <div>
                <div className="row2">
                <div className="col s12 m12">
                <input type='hidden' key={this.id} />
                <div className="input-field  center-align">
                  <button onClick={this.handleSubmit} className="btn black lighten-1">Search</button>
                </div>
                </div>
                </div>
                </div>
            </div>
        </form>
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
    posts: state.firestore.ordered.posts,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([filter])
)(Dashboard)