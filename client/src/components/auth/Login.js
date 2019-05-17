import React, { Component } from 'react';
import { connect } from 'react-redux';
import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import { createUser } from '../../store/actions/userActions';
import firebase from 'firebase';
import crypto from "crypto";
import '../../firebaseui-styling.global.css'; // Import globally. Not with CSS modules.

// Configure FirebaseUI.
const uiConfig = {
  // Popup signin flow rather than redirect flow.
  signInFlow: 'popup',
  // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
  signInSuccessUrl: `/`,
  // We will display Google and Facebook as auth providers.
  signInOptions: [firebase.auth.PhoneAuthProvider.PROVIDER_ID],
};

class Login extends Component {
  componentDidMount() {
    firebase.auth().onAuthStateChanged(user => {
      if (user) {
        // User logged in already or has just logged in.
        console.log(user);
        this.props.createUser({
          myCellNumber: user.phoneNumber,
          myRingNumber: '+12028398236',
          balance: 100,
          createdAt: new Date(),
          passcode: crypto.randomBytes(2).toString('hex'),
          textadorImage: 'https://s3.amazonaws.com/dfc_attachments/images/3543659/textadorLogo.jpg'
        });
      } else {
        // User not logged in or has just logged out.
      }
    });
  }
  render() {
    return (
      <div>
        <div className="row"></div>
        <div className="row center"><h5>Mobile numbers only.</h5></div>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
    );
  }
}

const mapStateToProps = state => {
  return {
    auth: state.firebase.auth,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    createUser: user => dispatch(createUser(user)),
  };
};

export default connect(
  mapStateToProps,
  mapDispatchToProps,
)(Login);
