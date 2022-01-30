import React, {useEffect, useState} from 'react'
import RequestProfile from './RequestProfile.js'
import db from '../../firebase.js'

const FriendRequest = ({ userData, setFriends }) => {
    const [requests, setRequests] = useState([])
    const [requestEmails, setRequestEmails] = useState([])

    useEffect(() => {
        const setReq = () => {
            setRequestEmails(userData.friendRequest)
        }
        setReq()
    }, [userData.friendRequest])

    useEffect(() => {
        const fetchRequests = async () => {
            setRequests([])
            await db.collection("users")
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    if(requestEmails.includes(doc.data().email)) {
                        setRequests(requests => [...requests, doc.data()])
                    }
               })
           })
            .then(() => console.log("successfully read all requests"))
            .catch((error) => console.log("Error in reading requests :", error))
        }
        if (requestEmails) fetchRequests()
        
    }, [requestEmails])


    return(<div>
            {
              requests.map(request => (
                  <RequestProfile key={request.firstName + requests.phone} 
                  setRequestEmails={setRequestEmails}
                  requestData={request} 
                  setFriends={setFriends}/>
              ))  
            }
        </div>)
}
export default FriendRequest
