import React from 'react'
import Profile from '../components/user/Profile'
import NavBar from '../components/Layout/NavBar'
import "../style/css/App.css"

export default function ProfilePage() {
    return (
        <React.Fragment>
        <NavBar></NavBar>
        <div className="box">
             <Profile></Profile>
        </div>
        </React.Fragment>
    )
}