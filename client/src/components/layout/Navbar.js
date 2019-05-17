import React from 'react'
import { Link } from 'react-router-dom'
import { connect } from 'react-redux'
import './style.css';

const Navbar = (props) => {
  const { auth, profile } = props;
  // console.log(auth);

  return (
    <div className="navbar-fixed">
      <nav>
        <div className="nav-wrapper black">
        <div className="container">
          <Link to='/users' className="brand-logo left"><img className="img-responsive" src="/img/textIcon.png" alt="logo"/></Link>
          <Link to='/posts' className="brand-logo center">TEXTADOR</Link>
          <Link to='/jobs' className="brand-logo right dropdown-trigger" data-target="jobsDropdown"><img className="img-responsive" src="/img/jobIcon.png" alt="logo"/></Link>
        </div>
        </div>
      </nav>
    </div>
  )
}

const mapStateToProps = (state) => {
  // console.log(state);
  return {
    auth: state.firebase.auth,
    profile: state.firebase.profile
  }
}

export default connect(mapStateToProps)(Navbar)
