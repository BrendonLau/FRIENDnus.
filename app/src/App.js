import React from "react"
import "./style/css/App.css"
import { AuthProvider } from "./context/AuthContext"
import { BrowserRouter as Router, Switch, Route } from
'react-router-dom'
import PrivateRoute from "./components/user/PrivateRoute"
import Dashboard from "./pages/Dashboard"
import SignupPage from "./pages/SignupPage"
import LoginPage from "./pages/LoginPage"
import ForgotPasswordPage from "./pages/ForgotPasswordPage"
import ProfilePage from "./pages/ProfilePage"
import MatchPage from "./pages/MatchPage"
import UpdateProfile from "../src/components/user/UpdateProfile"
import Chat from "./components/user/chat"
import Groupchat from "./components/user/groupchat"



function App() {

  return (
  
    <Router>
      <AuthProvider>
        <Switch>
        <PrivateRoute className="dashboard" exact path='/' component={Dashboard}/>
        <Route path="/signup" component={SignupPage}/>
        <Route path="/login" component={LoginPage}/>
        <Route path="/forgot-password" component={ForgotPasswordPage}/>
        <Route path="/profile" component={ProfilePage}/>
        <Route path='/update-profile' component={UpdateProfile}/>
        <Route path='/match' component={MatchPage}/>
        <Route path = "/chat" component ={Chat}/>
        <Route path = '/groupchat' component={Groupchat}/>
        </Switch>
      </AuthProvider>
    </Router>
  )
}

export default App
