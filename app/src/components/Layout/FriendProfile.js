import React, { useState } from "react"
import { Card } from 'react-bootstrap'
import { Avatar, Button, Modal, Popconfirm, message } from 'antd'
import { UserOutlined, MessageOutlined, VideoCameraOutlined } from '@ant-design/icons'
import db from '../../firebase.js'
import { useAuth } from '../../context/AuthContext'


export default function FriendProfile({ friend, setChatData, setFriends}) {
    const [visible, setVisible] = useState(false)
    const [disableBtn, setDisableBtn] = useState(false)
    const { currentUser } = useAuth()

    const showModal = () => {
        setVisible(true)
    }

    const handleChat = () => {
        setChatData(friend)
    }

    const handleRemove = async() => {
        setDisableBtn(true)

        var array1 = []
        await db.collection('users')
        .where('email', '==', currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                array1 = doc.data().friendList
                array1 = array1.filter(email => {
                    if (email !== friend.email) return email
                    else return false 
                })
            })
        })
        await db.collection('users')
        .doc(currentUser.email)
        .update({friendList: array1})
        .then(() => console.log('friend removed from user.'))

        var array2 = []
        await db.collection('users')
        .where('email', '==', friend.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                array2 = doc.data().friendList
                array2 = array2.filter(email => {
                    if (email !== currentUser.email) return email
                    else return false 
                })
            })
        })
        await db.collection('users')
        .doc(friend.email)
        .update({friendList: array2})
        .then(() => console.log('user removed from removed friend.'))

        // remove friend from the UI
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
        message.success(friend.firstName + " is removed successfully.", [4])
        setDisableBtn(false)
    }

    return(
        <div>
        <div style={{borderBottom:'solid', borderColor:'#ebebeb', borderWidth:'0.5px', display:'flex'}}>
            <div style={{float:'left', marginTop:'2%', marginRight:'1%', marginLeft:'2%', width:'10%'}}>
                <Avatar src={friend.image} icon={<UserOutlined/>}></Avatar>
            </div>
            <div onClick={showModal} style={{float:'left', marginTop:'2.5%', width:'80%'}}>
                <p>{friend.firstName + " " + friend.lastName}</p> 
            </div>
            <div style={{float:'right', width:'10%', marginTop:'0.5%', display:'flex', marginRight:'3%', justifyContent:'space-between'}}>
                <Button type='link' size='large' icon={<MessageOutlined/>}
                onClick={handleChat}
                ></Button>
            </div>   
        </div>
        
        <Modal visible={visible} onCancel={(e) => {setVisible(false)}} footer={null}>
            <Card style={{borderRadius:'10px', display:'flex'}} border="dark">
                <div>
                    <div style={{float:'left', padding:'2%'}}>
                        <Avatar size={100} src={friend.image} icon={<UserOutlined/>}></Avatar>
                    </div>       
                    <div style={{padding:"2%", marginTop:'4%'}}>
                        <p style={{display:"block"}}><strong>{friend.firstName + " " + friend.lastName}</strong></p>
                        <p>{friend.major}</p>
                    </div>
                </div>   
                 <hr/>
                <div style={{margin:'2%'}}>
                    <h6>Bio: </h6><p>{friend.bio}</p>
                    <h6>Interests: </h6><p> {friend.interest} </p>
                    <p><strong>Email: </strong>{friend.email}</p>
                </div>
            </Card>
            <Popconfirm title='Are you sure?' disabled={disableBtn} onConfirm={handleRemove}>
                <Button style={{marginTop:'2%'}} type='primary' shape='round'>
                    remove friend
                </Button>
            </Popconfirm>
        </Modal>
        </div>
    )
}