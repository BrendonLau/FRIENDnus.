import React, { useRef, useState } from 'react'
import { Form, Button, Card, Alert } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import db from "../../firebase.js"
import userEntry from './user'

/**
 * This component handles the Sign Up page
 */

export default function Signup() {
    const emailRef = useRef()
    const passwordRef = useRef()
    const passwordConfirmRef = useRef()
    const { signup } = useAuth()
    const [error, setError] = useState('')
    const [email, setEmail] = useState("")
    const [message, setMessage] = useState("")
    const [loading, setLoading] = useState(false)
    const [firstName, setFirstName] = useState("")
    const [lastName, setLastName] = useState("")
    const [gender, setGender] = useState("Male")
    const [handphone_Number, setNumber] = useState("+65")

    async function handleSubmit(e) {
        e.preventDefault()
        userEntry.firstName = firstName
        userEntry.lastName = lastName
        userEntry.email = email
        userEntry.gender = gender
        userEntry.phone = handphone_Number
        userEntry.bio = ""
        userEntry.interest = ""
        userEntry.major = ""
        userEntry.image = ""
        userEntry.friendRequest = []
        userEntry.friendList = []
        userEntry.chatList = []

        if (passwordRef.current.value !== 
            passwordConfirmRef.current.value) {
                return setError('Password do not match!')
            }

            await db.collection('users').doc(email).set(userEntry)
            .then(() => console.log("profile successfully added into database"))
            .catch((e) => console.error("Error writing document", e))
            //firestoreHelper.createNewDocument(db, 'users',userEntry )

        try {
            setError('')
            setMessage('')
            setLoading(true)
            await signup(emailRef.current.value, passwordRef.current.value)
            setMessage('Sign up successful! Please log in.')
        } catch (error){
            setError(error.message)
        }
        setLoading(false)
    }

    return (
        <React.Fragment>
        <Card>
            <Card.Body>
                <h2 className="text-center mb-4">Sign Up</h2>
                {error && <Alert variant="danger">{error}</Alert>}
                {message && <Alert variant="success">{message}</Alert>}
                <Form onSubmit={handleSubmit}>
                    <Form.Group id="email">
                        <Form.Label>Email</Form.Label>
                        <Form.Control  type="email" ref={emailRef} onChange={e=>setEmail(e.target.value)} required/>
                    </Form.Group>
                    <Form.Group id="password">
                         <Form.Label>Password</Form.Label>
                         <Form.Control type="password" ref={passwordRef} required/>
                     </Form.Group>
                     <Form.Group id="password-confirm">
                        <Form.Label>Password Confirmation</Form.Label>
                        <Form.Control type="password" ref={passwordConfirmRef} required/>
                     </Form.Group>
                     <Form.Group id="firstname">
                        <Form.Label>First Name</Form.Label>
                        <Form.Control type="firstName" onChange={e => setFirstName(e.target.value)}  required/>
                     </Form.Group>
                     <Form.Group id="lastname">
                        <Form.Label>Last Name</Form.Label>
                        <Form.Control type="lastName" onChange={e => setLastName(e.target.value)}  required/>
                     </Form.Group>
                     <Form.Group id= "Gender"> 
                     <Form.Label>Gender </Form.Label>
                     <select>
                        <option value= "male" onClick={e => setGender(e.target.value)}>Male</option>
                        <option value= "female" onClick={e => setGender(e.target.value)}>Female</option>
                    </select>
                    </Form.Group>
                     <Form.Group id="number">
                        <Form.Label>Handphone Number</Form.Label>
                        <Form.Control type="8 digit number" onChange={e => setNumber(e.target.value)}  required/>
                     </Form.Group>

                     <Button disabled={loading} className="w-100 mt-2" type = "submit" >
                        Sign Up
                     </Button> 
                </Form>
            </Card.Body>
        </Card>
        <div className="w-100 text-center mt-2">
            Already have an account? <Link to="/login">Log In</Link>
        </div>
        </React.Fragment>
    )

}