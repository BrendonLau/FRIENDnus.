import React, {useState} from 'react'
import { ListGroup, Button } from 'react-bootstrap'
import { UserOutlined } from '@ant-design/icons'
import { Avatar, Drawer, Popconfirm } from 'antd'
import db from "../../firebase.js"
import { useAuth } from '../../context/AuthContext'

const GroupChatInfo = ({chatMember, setChatMember, groupName, chatID}) => {
    const { currentUser } = useAuth()
    const [visibleAddMember, setVisibleAddMember] = useState(false)

    //display exit group button
    const [disableBtn, setDisableBtn] = useState(false)

    //data to add new members
    const [addedFriends, setAddedFriends] = useState([])
    const [remainingFriends, setRemainingFriends] = useState([])
    const [searchTerm, setSearchTerm] = useState('')
    

    const showAddDrawer = async () => {
        // pull friend's data 
        var friendList = []
        await db.collection("users")
        .where("email","==", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                friendList = doc.data().friendList
            })
        })

        //convert to emails
        const chatMemberEmails = chatMember.map(mem => (mem.email))

        //reset
        setRemainingFriends([])
        setAddedFriends([])

        // fetch all the data in the friend list 
        await db.collection("users")
        .where("email","!=", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                // append data into array if it is in the friend list
                
                if (friendList.includes(doc.data().email) && !chatMemberEmails.includes(doc.data().email)) {

                    setRemainingFriends(remainingFriends => [...remainingFriends, doc.data()])
                }
            })
        })
        .then(() => console.log("successfully read all in friendlist"))
        .catch((error) => console.log("Error in reading friendlist:", error))

        setVisibleAddMember(true)
    }

    const handleAdd = (email) => {
        const selected = remainingFriends.find(per => {
            return per.email === email ? per : false
         })

          // add selected to addedfriend
          addedFriends.push(selected)
          setAddedFriends(addedFriends)

         // remove from friends
         setRemainingFriends(remainingFriends.filter(f => {
             return f.email === email ? false : f
         }))
    }

    const handleAdded = (email) => {
        const selected = addedFriends.find(per => {
            return per.email === email ? per: false
         })

         // remove from addedfriends
         setAddedFriends(addedFriends.filter(f => {
            return f.email === email ? false : f
        }))

        // add friend to friends
        setRemainingFriends(remainingFriends => [...remainingFriends, selected])
    }

    // leave groupchat
    const handleLeave = async() => {
        setDisableBtn(true)

        var chatList = []
        await db.collection("users")
        .where("email","==", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                chatList = doc.data().chatList
            })
        })

        chatList = chatList.filter(chat => chat !== chatID)

        // update new chatList
        await db.collection("users")
        .doc(currentUser.email)
        .update({chatList: chatList})
        .then("successfully leave the group")


        setDisableBtn(false)
        window.location.reload()
    }

    //add member to database
    const handleAddMemberDB = async () => { 
        setDisableBtn(true)
        
        var chatList = []
        for (const friend of addedFriends){

            // fetch chatlist from friend
            
            await db.collection("users")
            .where("email","==", friend.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    chatList = doc.data().chatList
                })
            })

            //update chatList
            chatList = [...chatList, chatID]

            await db.collection("users")
            .doc(friend.email)
            .update({chatList: chatList})
            .then("successfully added " + friend.firstName + " to group")
        }

        for (const friend of addedFriends) {
            setChatMember(chatMember => [...chatMember, friend])
        }

        setDisableBtn(false)
        setVisibleAddMember(false)
    }


    function displayNumMembers(n) {
        return n === 0 ? '' 
                    : n > 1 ? n + ' members'
                            : n + ' member'  
    }

    return(<div>
        <div>
            <h5>{displayNumMembers(chatMember.length)}</h5>
            <hr/>
            <Button onClick={showAddDrawer} type='submit' variant='outline-primary' style={{borderRadius:'30px', width:'100%'}}>
                Add Members 
            </Button>
            <ListGroup variant='flush'>
                {
                    chatMember.map(member => (
                        <ListGroup.Item style={{border:'0px'}} key={member.firstName + member.lastName + member.firstName}>
                            <div style={{width:'100%', backgroundColor:'transparent', borderWidth:'0px'}}>
                                    <div style={{float:'left', marginRight:'5%'}}>
                                        <Avatar size={45} src={member.image} icon={<UserOutlined/>}></Avatar>
                                    </div>
                                    <div style={{textAlign:'left', paddingTop:'3%'}}>
                                        <h6>{member.firstName + " " + member.lastName}</h6>
                                    </div>
                            </div>
                        </ListGroup.Item> 
                    ))
                }
            </ListGroup>
            <Popconfirm title='Are you sure?' disabled={disableBtn} onConfirm={handleLeave}>
                <Button  variant='secondary' style={{borderRadius:'30px', marginTop:'10%', width:'100%'}}>
                        Exit group
                </Button>
            </Popconfirm>
        </div>
        <Drawer visible={visibleAddMember} placement='left' title={groupName}
                    width={'450px'} onClose={() => setVisibleAddMember(false)}>
            {addedFriends.length !== 0 && <Button style={{width:'100%', border:'0px', borderRadius:'10px', marginBottom:'5%'}} 
                    variant='secondary' onClick={handleAddMemberDB} disabled={disableBtn}> 
                confirm
            </Button>}
            {
                addedFriends.map(added => (
                     <Button variant='outline-secondary' style={{borderRadius:'20px', height:'40px'}} 
                        key={added.phone + added.lastName + added.phone} onClick={() => handleAdded(added.email)}>
                            <p>{added.firstName + " " + added.lastName} <b> x</b></p>
                    </Button>
                ))
            }
            <input type='text' placeholder='Type friend name' style={{borderWidth:'0px', width:'100%'}}
                onChange={e => {setSearchTerm(e.target.value)}}
            ></input>
            {
                remainingFriends.filter((val) => {
                    if (searchTerm === "") {
                        return val
                    } else if (val.firstName.toLowerCase().includes(searchTerm.toLocaleLowerCase())
                        || val.lastName.toLowerCase().includes(searchTerm.toLowerCase())
                    ) {
                        return val
                    } 
                    return false
                }).map(friend => (
                    <Button variant='outline-secondary' style={{width:'100%', backgroundColor:'transparent', borderWidth:'0px'}}
                        key={friend.major + friend.lastName + friend.email} onClick={() => handleAdd(friend.email)}>
                            <div style={{float:'left', marginRight:'5%'}}>
                                <Avatar size={45} src={friend.image} icon={<UserOutlined/>}></Avatar>
                            </div>
                            <div style={{textAlign:'left', marginTop:'3.2%'}}>
                                <h6>{friend.firstName + " " + friend.lastName}</h6>
                            </div>
                    </Button>
                ))
            }
        </Drawer>
        </div>)

}

export default GroupChatInfo