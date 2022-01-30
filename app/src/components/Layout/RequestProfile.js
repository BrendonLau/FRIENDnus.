import React, {useState} from 'react'
import { Avatar } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Button } from 'react-bootstrap'
import { useAuth } from '../../context/AuthContext'
import db from '../../firebase.js'
import { message } from 'antd'

const RequestProfile = ({ requestData, setRequestEmails, setFriends }) => {
    const [disableBtn, setDisableBtn] = useState(false)
    const { currentUser } = useAuth()

    const handleAccept = async () => {
        setDisableBtn(true)


        var array1 = []
        // add friend to current user friendList
        await db.collection('users')
        .where('email', '==', currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                array1 = doc.data().friendList
            })
        })
        array1 = [...array1, requestData.email]

        await db.collection('users')
        .doc(currentUser.email)
        .update({friendList: array1})
        .then(() => console.log('friend is added successfully added to currentUser'))

        var array2 = []
        // add friend to current user friendList
        await db.collection('users')
        .where('email', '==', requestData.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                array2 = doc.data().friendList
            })
        })
        array2 = [...array2, currentUser.email]

        await db.collection('users')
        .doc(requestData.email)
        .update({friendList: array2})
        .then(() => console.log('friend is added successfully added to receiver'))

        message.success(requestData.firstName + " is added successfully!", [4])
        
        // Add friend from the UI
        // fetch all the data in the friend list
        var newFriendList = [] 
        await db.collection("users")
        .where("email","!=", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {

            // append data into array if it is in the friend list
                if (array1.includes(doc.data().email)) {
                    newFriendList = [...newFriendList, doc.data()]
                }

            })
        })
        .then(() => console.log("successfully read all in friendlist"))
        setFriends(newFriendList)        

        // remove request from database
        removeRequest()
        setDisableBtn(false)
    }

    const handleDelete = async () => {
        setDisableBtn(true)
        // remove request from database
        removeRequest()
        setDisableBtn(false)
    }

    async function removeRequest() {
        var array = []
        await db.collection('users')
        .where('email', '==', currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
               array = doc.data().friendRequest
            })
        })
        .then(() => console.log("Fetched request array"))

        // remove email
        array = array.filter(email => {
            if (email !== requestData.email) {
                return email;
            }
            return false;
        })

        await db.collection('users')
        .doc(currentUser.email)
        .update({friendRequest: array})
        .then(() => console.log("Request removed"))
        setRequestEmails(array)
    }

    return(<div style={{borderBottom:'solid', borderColor:'#ebebeb', borderWidth:'0.5px', display:'flex'}}>
            <div style={{float:'left', margin:"2%", width:'10%'}}>
                <Avatar src={requestData.image} icon={<UserOutlined/>}></Avatar>
            </div>
            <div style={{float:'left', marginTop:'3%', marginLeft:'2%', width:'40%'}}>
                <p>{requestData.firstName + " " + requestData.lastName}</p>
            </div>
            <div style={{float:'right', width:'35%', display:'flex', marginRight:'1%', marginTop:'3%', justifyContent:'space-between'}}>
                <Button style={{fontSize:'10px', height:'25px'}} size='sm' disabled={disableBtn}
                onClick={handleAccept}
                >Accept
                </Button>
                <Button style={{fontSize:'10px', height:'25px'}} variant='light' size='sm' disabled={disableBtn}
                onClick={handleDelete}
                >Delete
                </Button>
            </div>
        </div>)
}
export default RequestProfile