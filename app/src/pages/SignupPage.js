import React from 'react'
import Signup from '../components/user/Signup'
import { Container } from "react-bootstrap"
import "../style/css/App.css"

export default function SignupPage() {
    return (
        <Container className="container">
            <div className="box">
                <Signup></Signup>
            </div>
        </Container>
    )
}