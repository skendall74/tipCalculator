// import React, { Component } from 'react';
// import { Redirect } from 'react-router-dom';
// import { connect } from 'react-redux';

// class FilterPost extends Component {
//     state = {
//     name: '',
//     number: '',
//     Geo: '',
//     firstName: '',
//     lastName: '',
//     imageURL: ''
//     }

//     handleChange = (e) => {
//         this.setState({
//         [e.target.id]: e.target.value
//         })
//     }

//     handleSubmit = (e) => {
//         e.preventDefault();
//         this.props.filterPost(this.state);
//     }

//     render() {
//         const { auth } = this.props;
//         if (!auth.uid) return <Redirect to='/signin' /> 
//         return (
//             <div className="container">
//                 <form className="white" onSubmit={this.handleSubmit} >
//                     <div className="row">
//                         <div className="input-field col s3">
//                             <i className="material-icons prefix">account_circle</i>
//                             <input type="text" id='icon_prefix texadorName' onChange={this.handleChange} />
//                             <label for="icon_prefix">Search by Name</label>
//                         </div>
//                         <div className="input-field col s3">
//                             <i className="material-icons prefix">phone</i>
//                             <input id="icon_telephone textadorPhone" type="tel" onChange={this.handleChange} />
//                             <label for="icon_telephone">Search by Phone</label>
//                         </div>
//                         <div className="input-field col s3">
//                             <i className="material-icons prefix">account_circle</i>
//                             <input type="text" id='icon_prefix texadorGEO' onChange={this.handleChange} />
//                             <label for="icon_prefix">Search by GEO</label>
//                         </div>
//                         <div className="input-field col s3">
//                             <i className="material-icons prefix">serach</i>
//                             <input type='submit' value='Submit' />
//                          </div>
//                     </div>
//                 </form>
//           </div>
//         )
//     }
// }

// const mapStateToProps = (state) => {
//     return {
//         auth: state.firebase.auth,
//         authError: state.auth.authError
//     }
// }

// const mapDispatchToProps = (dispatch)=> {
// return {
//     filterPost: (creds) => dispatch(filterPost(creds))
//     }
// }

// export default connect(mapStateToProps, mapDispatchToProps)(FilterPost)
