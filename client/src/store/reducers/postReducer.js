const initState = {}

const postReducer = (state = initState, action) => {
  switch (action.type) {
    case 'CREATE_POST_SUCCESS':
      console.log('create post success');
      return state;
    case 'CREATE_POST_ERROR':
      console.log('create post error');
      return state;
    default:
      return state;
  }
};

export default postReducer;