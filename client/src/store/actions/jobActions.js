export const createJob = (job) => {
  return (dispatch, getState, {getFirestore}) => {
    const firestore = getFirestore();
    const profile = getState().firebase.profile;
    const authorId = getState().firebase.auth.uid;
    firestore.collection('jobs').add({
      ...job,
      systemNumber: '+12028398236',
      createdAt: new Date()
      }).then(() => {
        dispatch({ type: 'CREATE_JOB_SUCCESS' });
      }).catch(err => {
        dispatch({ type: 'CREATE_JOB_ERROR' }, err);
      });
    }
  };