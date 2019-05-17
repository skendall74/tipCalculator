export const createUser = user => {
  return (dispatch, getState, { getFirestore }) => {
    const firestore = getFirestore();
    const { uid, ...user } = user;
    firestore
      .collection('users')
      .doc(uid)
      .set({
        ...user,
        lastLoggedIn: new Date(),
      })
      .then(() => {
        dispatch({ type: 'CREATE_USER_SUCCESS' });
      })
      .catch(err => {
        dispatch({ type: 'CREATE_USER_ERROR' }, err);
      });
  };
};
