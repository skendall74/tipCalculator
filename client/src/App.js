import React, { Component } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom'
import Navbar from './components/layout/Navbar'
import Dashboard from './components/dashboard/Dashboard'
import PostPage from './components/posts/PostPage'
import Login from './components/auth/Login'
import CreateJob from './components/jobs/CreateJob'
import JobDashboard from './components/jobs/JobDashboard';
import JobPage from './components/jobs/JobPage'
import UserDashboard from './components/users/UserDashboard'
import UserDetails from './components/users/UserDetails'
import UserNavbar from './components/layout/UserNavbar'
import UsersNavbar from './components/layout/UsersNavbar'
import TextadorsNavbar from './components/layout/TextadorsNavbar'
import TextadorNavbar from './components/layout/TextadorNavbar'
import MyPostsDashboard from './components/posts/MyPostsDashboard';
import Join from './components/users/Join';


class App extends Component {

  render() {
    return (
      <BrowserRouter>
        <div className="App">
          <Switch>
            <Route exact path='/'component={Navbar} />
            <Route exact path='/posts/'component={TextadorsNavbar} />
            <Route exact path='/post/:id' component={TextadorNavbar} />
            <Route exact path='/posts/users/:id' component={TextadorNavbar} />
            <Route path='/login' component={Navbar} />
            <Route exact path='/jobs' component={Navbar} />
            <Route exact path='/hire' component={Navbar} />
            <Route exact path='/job/:id' component={Navbar} />
            <Route exact path='/users' component={UsersNavbar} />
            <Route exact path='/user/:id' component={UserNavbar} />
            <Route exact path='/join' component={TextadorsNavbar} />
          </Switch>
          <Switch>
            <Route exact path='/'component={Dashboard} />
            <Route exact path='/posts/'component={Dashboard} />
            <Route exact path='/post/:id' component={PostPage} />
            <Route exact path='/posts/users/:id' component={MyPostsDashboard} />
            <Route path='/login' component={Login} />
            <Route exact path='/jobs' component={JobDashboard} />
            <Route exact path='/hire' component={CreateJob} />
            <Route exact path='/job/:id' component={JobPage} />
            <Route path='/users' component={UserDashboard} />
            <Route exact path='/user/:id' component={UserDetails} />
            <Route exact path='/join' component={Join} />

          </Switch>
        </div>
      </BrowserRouter>
    );
  }
}

export default App;
