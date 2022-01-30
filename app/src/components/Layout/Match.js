import React, {useState} from 'react'
import MatchProfile from './MatchProfile'
import db from '../../firebase.js'
import { useAuth } from '../../context/AuthContext'
import { PuffLoader} from 'react-spinners'
import Image from '../../iconfinder-256.png'
import { Alert } from "react-bootstrap"

export default function Match() {
    const [matches, setMatches] = useState([])
    const { currentUser } = useAuth()
    const [userInterest, setUserInterest] = useState([])
    const [loader, setLoader] = useState(false)
    const [friends, setFriends] = useState([])
    const [displayMessage, setDisplayMessage] = useState('Ready to make friends?')
    const [displaySecMessage, setDisplaySecMessage] = useState('click match to connect!')

    const handleClick = async () => {
        setDisplayMessage('Finding...')
        setDisplaySecMessage('please be patient.')
        setLoader(true)
        //clear matches
        if (matches.length > 0) {
            setMatches([])
        }
      
        await db.collection("users")
       // .where("email", "!=", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                if (doc.data().email === currentUser.email) {
                    // split interest into array by ", "
                    setUserInterest(doc.data().interest.toLowerCase().split(", "))
                    setFriends(doc.data().friendList)
                } else { 
                setMatches(matches => [...matches, doc.data()])
                }
            })
        })
        .then(() => console.log("successfully read all matches"))
        .catch((error) => console.log("Error in reading matches :", error))
        setLoader(false)
        setDisplayMessage('')
    }


    return(
        <div style={{textAlign:'center', width:'600px'}}>
            <br/>
            <div style={{overflowY:"auto", maxHeight: "400px"}}>
                {
                    matches.filter(match => {
                        for (var i = 0; i < userInterest.length; i++) {
                            const uInterest = userInterest[i]
                            const mInterest = match.interest.toLowerCase()
                            const mEmail = match.email
                            
                            // if they have similar interest and it is not a friend return the data
                            if (mInterest.includes(uInterest) && !friends.includes(mEmail)) { 
                                return match
                            }
                        }
                        return false;
                    }).map(match =>(
                        <MatchProfile key={match.email} userData={match}></MatchProfile>
                    ))
                }
                <div>{displayMessage&&<Alert variant='light'>
                    <Alert.Heading>{displayMessage}</Alert.Heading>
                    <hr/>
                    <p style={{margin:'0', padding:'0'}}>Matches are based on your interests.</p>
                    {displaySecMessage}
                </Alert>}</div>
            </div>
            {!loader && <button onClick={handleClick} style={{borderRadius:'25px', borderColor:'#ebebeb', 
            borderWidth:'0.25px', backgroundColor:'transparent', marginTop:'8%'}}>
                <div>
                   <img src={Image} alt="MATCH" style={{height:"110px", width:'110px'}}></img>
                </div>  
            </button>}
            <div style={{display:"flex", alignItems:"center", justifyContent:"center", marginTop:"10%"}}>
                <PuffLoader loading={loader} color="#0d70e0" size={150}></PuffLoader>
            </div>
        </div>
    )

}