export const createPost = (post) => {
  return (dispatch, getState, {getFirestore}) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const authorId = getState().firebase.auth.uid;
    firestore.collection('posts').add({
      ...post,
      authorMyCellNumber: profile.myCellNumber,
      authorSystemNumber: profile.mySystemNumber,
      authorId: authorId,
      createdAt: new Date()
    }).then(() => {
      dispatch({ type: 'CREATE_POST_SUCCESS' });
    }).catch(err => {
      dispatch({ type: 'CREATE_POST_ERROR' }, err);
    });
  }
};