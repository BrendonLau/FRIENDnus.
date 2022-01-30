import React, {useState, useEffect} from 'react'
import { Card } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import { Link} from 'react-router-dom'
import DisplayPhoto from '../Layout/DisplayPhoto'
import db from "../../firebase.js"

/**
 * This component handles the profile page
 */
export default function Profile() {
    const { currentUser } = useAuth()
    const [userData, setUserData] = useState("")

    // fetch data
    useEffect(() => {
        const fetchData = async () =>{
            await db.collection("users")
            .where("email","==", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    setUserData(doc.data())
                    console.log("profile data successfully fetched from firestore.")
                })
            })
        }
        fetchData()
    }, [currentUser.email])

    return (
        <React.Fragment>
            <Card>
                <div style={{display:"flex"}}>
                    <DisplayPhoto></DisplayPhoto>
                    <div style={{marginTop:"auto", marginBottom:"auto", paddingLeft:"5%"}}>
                        <p style={{display:"block"}}><strong>{userData && (userData.firstName + " " + userData.lastName)} </strong></p>
                        <p>{userData.major}</p>
                    </div>
                </div>
                <hr/>
                <div style={{display:"flex", justifyContent:"space-between", width:"80%"}}>
                </div>
                <h6>Bio: </h6><p>{userData.bio}</p>
                <h6>Interests:</h6><p>{userData.interest} </p>
                <p><strong>Email: </strong> {currentUser.email} </p>
                <Link to="/update-profile" className="btn btn-primary w-100 mt-3">Edit Profile</Link>
            </Card>
        </React.Fragment>
    )
}