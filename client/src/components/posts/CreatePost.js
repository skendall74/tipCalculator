import React, { Component } from 'react'
import { connect } from 'react-redux'
import { createPost } from '../../store/actions/postActions'
import { Redirect } from 'react-router-dom'

class CreatePost extends Component {
  state = {
    title: '',
    description: '',
    price: '',
    image: ''
  }
  handleChange = (e) => {
    this.setState({
      [e.target.id]: e.target.value
    })
  }
  handleSubmit = (e) => {
    e.preventDefault();
    // console.log(this.state);
    this.props.createPost(this.state);
    this.props.history.push('/');
  }
  render() {
    const { auth } = this.props;
    if (!auth.uid) return <Redirect to='/login' /> 
    return (
      <div className="container">
        <form className="white" onSubmit={this.handleSubmit}>
          <h5 className="grey-text text-darken-3">Create a New Post</h5>
          <div className="input-field">
            <input type="text" id='title' onChange={this.handleChange} />
            <label htmlFor="title">Post Title</label>
          </div>
          <div className="input-field">
            <input type="text" id='description' onChange={this.handleChange} />
            <label htmlFor="description">Post Description</label>
          </div>
          <div className="input-field">
            <input type="text" id='price' onChange={this.handleChange} />
            <label htmlFor="price">Post Price</label>
          </div>
          <input type='hidden' key={this.id} />
          <div className="input-field">
            <button onClick={this.handleSubmit} className="btn red darken-4">Create</button>
          </div>
        </form>
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    auth: state.firebase.auth
  }
}

const mapDispatchToProps = dispatch => {
  return {
    createPost: (post) => dispatch(createPost(post))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(CreatePost)
