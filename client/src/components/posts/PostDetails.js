import React from 'react'
import { connect } from 'react-redux'
import { firestoreConnect } from 'react-redux-firebase'
import { compose } from 'redux'
import { Redirect } from 'react-router-dom'
import moment from 'moment'

const PostDetails = (props) => {
  const id = props.match.id;
  const { post, auth } = props;
  if (!auth.uid) return <Redirect to='/login' /> 
  if (post) {
    return (
      <Link to={'/posts'}>
        <div className="card" key={id}>
          <div className="card-image">
            <img alt={post.title} src={ post.image ? post.image : ('https://via.placeholder.com/300/09f/333.png') } />
          </div>
          <div className="card-content">
            <span className="card-title">{post.title}</span>
            <p>{post.description}</p>
            <p>${post.price}</p>
          </div>
          <div className="card-action grey lighten-4 grey-text">
            <div>Posted by: {post.authorHandle}</div>
            <div>{moment(post.createdAt.toDate()).calendar()}</div>
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
  const posts = state.firestore.data.posts;
  const post = posts ? posts[id] : null
  return {
    post: post,
    auth: state.firebase.auth
  }
}

export default compose(
  connect(mapStateToProps),
  firestoreConnect([{
    collection: 'posts'
  }])
)(PostDetails)
