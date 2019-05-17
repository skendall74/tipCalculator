export const updateUser = (user) => {
    return (dispatch, getState, {getFirestore}) => {
      const firestore = getFirestore();
      const profile = getState().firebase.profile;
      const authorId = getState().firebase.auth.uid;
      firestore.collection('users').update({
        ...user,
        authorId: authorId,
        updatedAt: new Date()
        }).then(() => {
          dispatch({ type: 'UPDATE_USER_SUCCESS' });
        }).catch(err => {
          dispatch({ type: 'UPDATE_USER_ERROR' }, err);
        });
      }
    };