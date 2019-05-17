import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

// Replace this with your own config details
var config = {
  apiKey: "AIzaSyAsdsLeVrFKDFIFXgYWRZwtbRGTKpN6rmw",
  authDomain: "twiliocms.firebaseapp.com",
  databaseURL: "https://twiliocms.firebaseio.com",
  projectId: "twiliocms",
  storageBucket: "twiliocms.appspot.com"
};
firebase.initializeApp(config);
firebase.firestore();

export default firebase 