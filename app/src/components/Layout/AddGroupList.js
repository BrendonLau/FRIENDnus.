import React, {useEffect, useState} from 'react'
import { useAuth } from '../../context/AuthContext'
import db from '../../firebase.js'
import { Avatar, Drawer } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { Button } from 'react-bootstrap'
import firebase from 'firebase/app';
import moment from 'moment';
import index from '../user/grpchatindex';


const AddGroupList = ({ setVisibleDrawer, setNewGrpIDs, newGrpIDs}) => {
    
    const [friends, setFriends] = useState([])
    const { currentUser } = useAuth()
    const [searchTerm, setSearchTerm] = useState('')
    const [visibleDrawer2, setVisibleDrawer2] = useState(false)

    // data for group chat
    const [addedFriends, setAddedFriends] = useState([])
    const [groupName, setGroupName] = useState('')

    useEffect(() => {
        const fetchUserData = async () =>{
            // fetch user friend list

            //fetch user  friend list
            var friendList = []
            await db.collection("users")
            .where("email","==", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    friendList = doc.data().friendList
                })
            })

            // fetch all the data in the friend list 
            await db.collection("users")
            .where("email","!=", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    // append data into array if it is in the friend list
                    if (friendList.includes(doc.data().email)) {
                        setFriends(friends => [...friends, doc.data()])
                    }
                })
            })
            .then(() => console.log("successfully read all in friendlist"))
            .catch((error) => console.log("Error in reading friendlist:", error))
        }
        // reset array
        if(friends.length === 0 && addedFriends.length === 0) {
            setFriends([])
            fetchUserData()
        }

    }, [currentUser.email, friends.length, addedFriends.length])
   

    const handleAdd = (email) => {
        const selected = friends.find(per => {
            return per.email === email ? per: false
         })
         // remove from friends
         setFriends(friends.filter(f => {
             return f.email === email ? false : f
         }))

         // add selected to addedfriend
         setAddedFriends(addedFriends => [...addedFriends, selected])
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
        setFriends(friends => [...friends, selected])
    }

    const handleDrawer = () => {
        setVisibleDrawer2(true)
    }

    const handleCreateChat = async (e) => {
        e.preventDefault()
        
        var tempChatList2 = []
        await db.collection('users')
          .where('email', '==', currentUser.email)
          .get()
          .then(snap => {
            snap.docs.forEach(doc => {
              tempChatList2 = doc.data().chatList
            })
          }) 
          
        
        var chatID = "GROUP" + currentUser.email + groupName
        while (tempChatList2.includes(chatID)){ 
            chatID = chatID + "i"
            console.log(chatID)
          }
        
        
        const addGrpToChatList = async (receiver) => { 
            var tempChatList1 = receiver.chatList  
            tempChatList1.push(chatID) 
            await db.collection('users')  
              .doc(receiver.email)  
              .update({chatList: tempChatList1}) 
            var tempChatList2 = [] 
            await db.collection('users') 
              .where('email', '==', currentUser.email) 
              .get() 
              .then(snap => { 
                snap.docs.forEach(doc => { 
                  tempChatList2 = doc.data().chatList 
                }) 
              })  
            tempChatList2.push(chatID) 
            await  db.collection('users')  
              .doc(currentUser.email)  
              .update({chatList: tempChatList2}) 
            console.log("new chat added") 
          
        }
        const groupChat = async () => {

            for(let i = 0; i<addedFriends.length ; i ++){
                var receiver = addedFriends[i]
                addGrpToChatList(receiver);
            }
           
  
           const grpchatRef = db.collection("chats").doc("all").collection(chatID)
           index.createdAt = firebase.firestore.FieldValue.serverTimestamp()
           index.time = moment().format('HH:mm')
           index.chatName = groupName
           index.userList = addedFriends
           grpchatRef.doc("index").set(index)

           // add to chat history
           setNewGrpIDs([chatID, ...newGrpIDs])
        }
        groupChat()


        

        // reset to default
        setVisibleDrawer(false)
        setVisibleDrawer2(false)
        setFriends([])
        setAddedFriends([])
        setGroupName('')
    }
  


    return (
        <div>
            <div>
          
                {addedFriends.length !== 0 && <Button style={{width:'100%', border:'0px', borderRadius:'10px', marginBottom:'5%'}} 
                    variant='secondary' onClick={handleDrawer}> 
                    next ⋗
                </Button>}

                {
                    addedFriends.map(added => (
                        <Button variant='outline-secondary' style={{borderRadius:'20px', height:'40px'}} 
                        key={added.phone + added.lastName} onClick={() => handleAdded(added.email)}>
                            <p>{added.firstName + " " + added.lastName} <b> x</b></p>
                        </Button>
                    ))
                }
            </div>
            {addedFriends.length !== 0 && <br/>}

            <Drawer title="New Group" visible={visibleDrawer2} placement='left' 
            onClose={() => setVisibleDrawer2(false)} width='450px'>
                <form onSubmit={handleCreateChat} style={{textAlign:'center'}}>
                    <input placeholder=' group subject' style={{width:'100%'}}
                    onChange={e => setGroupName(e.target.value)} value={groupName}></input>
                    <Button type='submit' width='20%' variant='secondary'
                    style={{borderRadius:'50px', marginTop:'10%'}}>create</Button>
                </form> 
            </Drawer>

            <div style={{borderBottom:'solid', borderColor:'#ebebeb'}}>
                <input type='text' placeholder='Type friend name' style={{borderWidth:'0px', width:'100%'}}
                onChange={e => {setSearchTerm(e.target.value)}}
                ></input>
            </div>
            <br/>
                {
                    friends.filter((val) => {
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
                        key={friend.major + friend.lastName} onClick={() => handleAdd(friend.email)}>
                            <div style={{float:'left', marginRight:'5%'}}>
                                <Avatar size={45} src={friend.image} icon={<UserOutlined/>}></Avatar>
                            </div>
                            <div style={{textAlign:'left', marginTop:'3.2%'}}>
                                <h6>{friend.firstName + " " + friend.lastName}</h6>
                            </div>
                        </Button>
                    ))
                }
        </div>
    )

}

export default AddGroupList