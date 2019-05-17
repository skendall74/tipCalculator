import React from 'react'
import PostSummary from './PostSummary'
import { Link } from 'react-router-dom'

const PostList = ({posts}) => {
  return (
    <div className="section">
      <div className="row">
        { posts && posts.map(post => {
          return (
            <div className="col l3 m4 s6" key={post.id}>
              <Link to={'/post/' + post.id}>
                  <PostSummary post={post} />
              </Link>
            </div>
          )
        })}  
      </div>
    </div>
  )
}

export default PostList
