import React from 'react'
import ForgotPassword from '../components/user/ForgotPassword'
import { Container } from "react-bootstrap"
import "../style/css/App.css"

export default function ForgetPasswordPage() {
    return (
        <Container className="container">
            <div className="box">
                <ForgotPassword></ForgotPassword>
            </div>
        </Container>
    )
}