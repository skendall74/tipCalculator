import React from 'react'
import moment from 'moment'

const PostSummary = ({post}) => {
  return (
    <div className="card">
    <div className="card-image">
      <img alt={post.title} src={ post.image ? post.image : ('https://via.placeholder.com/300/09f/333.png') } />
    </div>
    <div className="card-content">
      <span className="card-title">{post.title}</span>
      <p>{post.description}</p>
      {post.price > 0 &&
        <p>${post.price}</p>      
      }
    </div>
    <div className="card-action grey lighten-4 grey-text">
      <div>Posted by: {post.authorHandle}</div>
      <div>{moment(post.createdAt.toDate()).calendar()}</div>
    </div>
  </div>
  )
}

export default PostSummary
