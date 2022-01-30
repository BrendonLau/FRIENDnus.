import React, { useRef, useState, useEffect } from "react"
import { Form, Button, Card, Alert } from "react-bootstrap"
import { useAuth } from "../../context/AuthContext"
import { Link, useHistory } from "react-router-dom"
import DisplayPhoto from "../Layout/DisplayPhoto"
import db from "../../firebase.js"

/**
 * This component handles the update of profile page
 */

export default function UpdateProfile() {
  const emailRef = useRef()
  const passwordRef = useRef()
  const passwordConfirmRef = useRef()
  const { currentUser, updatePassword, updateEmail } = useAuth()
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const history = useHistory()

  const [email, setEmail] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [major, setMajor] = useState("")
  const [gender, setGender] = useState("Male")
  const [number, setNumber] = useState("")
  const [interest, setInterest] = useState("")
  const [bio, setBio] = useState("")


  // fetch data
  useEffect(() => {
    const fetchData = async () =>{
        await db.collection("users")
        .where("email","==", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                const userData  = doc.data()
                setFirstName(userData.firstName)
                setLastName(userData.lastName)
                setMajor(userData.major)
                setNumber(userData.phone)
                setGender(userData.gender)
                setEmail(userData.email)
                setBio(userData.bio)
                setInterest(userData.interest)
                console.log("update-profile data successfully fetched from firestore.")
            })
        })
    }
    fetchData()
}, [currentUser.email])

  async function handleSubmit(e) {
    e.preventDefault()

    if (passwordRef.current.value !== passwordConfirmRef.current.value) {
      return setError("Passwords do not match")
    }

    const promises = []
    setLoading(true)
    setError("")

    if (emailRef.current.value !== currentUser.email) {
      promises.push(updateEmail(emailRef.current.value))
    }
    if (passwordRef.current.value) {
      promises.push(updatePassword(passwordRef.current.value))
    }

    await db.collection('users').doc(currentUser.email).update({
      "bio": bio,
      "email": email,
      "firstName": firstName,
      "gender": gender,
      "interest": interest,
      "lastName": lastName,
      "major": major,
      "phone": number
    })
    .then(() => console.log("update-profile successfully written into database."))
    .catch((e) => console.error("Error writing document", e))
   
    Promise.all(promises)
      .then(() => {
        history.push("/")
      })
      .catch((error) => {
        setError(error.message)
      })
      .finally(() => {
        setLoading(false)
      })
  }

  return (
    <React.Fragment>
      <Card>
        <Card.Body>
          <h2 className="text-center mb-4">Update Profile</h2>
          {error && <Alert variant="danger">{error}</Alert>}
            <DisplayPhoto></DisplayPhoto>
            <Form onSubmit={handleSubmit}>

            <Form.Group id="firstname">
              <Form.Label>First Name</Form.Label>
              <Form.Control type="firstName" defaultValue={firstName} required
              onChange={e => {
                setFirstName(e.target.value)
              }}
              />
            </Form.Group>

            <Form.Group id="lastname">
              <Form.Label>Last Name</Form.Label>
              <Form.Control type="lastName" defaultValue={lastName} required
              onChange={e => {
                setLastName(e.target.value)
              }}
              />
            </Form.Group>

            <Form.Group id="major">
              <Form.Label>Major</Form.Label>
              <Form.Control type="major" defaultValue={major}
              onChange={e => {
                setMajor(e.target.value)
              }}
              required
              />
            </Form.Group>

            <Form.Group id= "Gender"> 
              <Form.Label>Gender  </Form.Label>
                <select defaultValue={gender}>
                  <option value= "male" onClick={e => setGender(e.target.value)}>Male</option>
                  <option value= "female" onClick={e => setGender(e.target.value)}>Female</option>
                </select>
            </Form.Group>
            
            <Form.Group id="number">
               <Form.Label>Handphone Number</Form.Label>
               <Form.Control type="8 digit number" defaultValue={number} 
               onChange={e => {
                setNumber(e.target.value)
               }}
               required/>
            </Form.Group>

            <Form.Group id="email">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                ref={emailRef}
                required
                defaultValue={currentUser.email}
                onChange={e => {
                  setEmail(e.target.value)
                }}
              />
            </Form.Group>

            <Form.Group id="interest">
              <Form.Label>Interest</Form.Label>
              <Form.Control type="interest" defaultValue={interest} 
              onChange={e => {
                setInterest(e.target.value)
              }}
              required
              />
            </Form.Group>

            <Form.Group id="bio">
              <Form.Label>Bio</Form.Label>
              <Form.Control type="Bio" defaultValue={bio}
              onChange={e => {
                setBio(e.target.value)
              }}
              required
              />
            </Form.Group>

            <Form.Group id="password">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                ref={passwordRef}
                placeholder="Leave blank to keep the same"
              />
            </Form.Group>
            <Form.Group id="password-confirm">
              <Form.Label>Password Confirmation</Form.Label>
              <Form.Control
                type="password"
                ref={passwordConfirmRef}
                placeholder="Leave blank to keep the same"
              />
            </Form.Group>
            <Button disabled={loading} className="w-100 mt-2" type="submit">
              Update
            </Button>
          </Form>
        </Card.Body>
      </Card>
      <div className="w-100 text-center mt-2">
        <Link to="/">Cancel</Link>
      </div>
     
    </React.Fragment>
  )
}

