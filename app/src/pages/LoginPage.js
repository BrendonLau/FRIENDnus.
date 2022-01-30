import React from 'react'
import Login from '../components/user/Login'
import { Container } from "react-bootstrap"
import "../style/css/App.css"

export default function LoginPage() {
    return (
        <Container className="container">
            <div className="box">
                <Login></Login>
            </div>
        </Container>
    )
}