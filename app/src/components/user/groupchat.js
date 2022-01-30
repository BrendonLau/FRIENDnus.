
import React, { useState, useEffect } from 'react'
import moment from 'moment'
import { SendOutlined } from '@ant-design/icons'
import { Drawer } from 'antd'

import { useAuth } from '../../context/AuthContext'
import db from "../../firebase.js"
import firebase from 'firebase/app';

import { useCollectionData } from 'react-firebase-hooks/firestore'
import { Button } from 'react-bootstrap'

import GroupChatInfo from './GroupChatInfo'
import '../../style/css/chat.css'


export default function Groupchat({ID}){
    // const chatID = ID.location.state
    const chatID = ID;
    const [first, setFirst] = useState(" ")
    const messagesRef = db.collection("chats").doc("all").collection(chatID)

    // displaying group info 
    const [chatMember, setChatMember] = useState([])
    const [visibleDrawer, setVisibleDrawer] = useState(false)
    const [userName, setUserName] = useState('')
    
    const { currentUser } = useAuth()

     messagesRef.where('uid', '==', 'System').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {setFirst(doc.data())})
    })
 
    const query = messagesRef.orderBy('createdAt').limit(25);

    
    const [formValue, setFormValue] = useState('');
            
            const [messages] = useCollectionData(query, { idField: 'id' });


            const sendMessage = async (e) => {
                e.preventDefault();
                
                const value = formValue
                setFormValue('')

                await messagesRef.add({
                  text: value,
                  createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                  time: moment().format('HH:mm'),
                  uid: currentUser.email,
                  chatName: first.chatName,
                  userList: first.userList,

                })
              }

              // fetch all the members in the group chat
              useEffect(() => {
                setChatMember([])
                const fetchData = async () => {
                  await  db.collection('users') 
                  .where('email', '!=', currentUser.email) 
                  .get() 
                  .then(snap => { 
                   snap.docs.forEach(doc => { 
                    const per = doc.data()
                    
                    // if in the same group append to array
                    if (per.chatList.includes(chatID)) {
                      setChatMember(chatMember => [...chatMember, per])
                    }

                      }) 
                  }) 
                }

                const fetchName = async() => {
                  await  db.collection('users') 
                  .where('email', '==', currentUser.email) 
                  .get() 
                  .then(snap => { 
                   snap.docs.forEach(doc => { 
                      setUserName(doc.data().firstName)
                   })
                  })

                }

                fetchData()
                fetchName()
      
              }, [chatID, currentUser.email])

              const onHeaderClick = () => {
                setVisibleDrawer(true)
              }


              function concatMembersName(members) {
                return members.map(mem => (mem.firstName)).join(', ')
              }

              function shortenText(text, limit) {
                if (text.length > limit) {
                    return text.substring(0, limit) + '...'
                } 
                return text
              }

           
             
              return (
                <div style={{border:'solid', borderWidth:'0.2px', borderColor:'#d9d9d9', height:'100%'}}>
                   <div style={{display:'flex', borderWidth:'0.02px', border:'solid', borderColor:'#e3e3e3', backgroundColor:'#fbfbfb'}}>
                     <div style={{width:'100%'}}> 
                        <Button variant='outline-secondary' style={{borderWidth:'0px',width:'100%', backgroundColor:'transparent'}}
                          onClick={onHeaderClick}>
                          <h4>{first.chatName}</h4>
                          {shortenText(concatMembersName(chatMember), 30)}
                        </Button>
                     </div>
                   </div>
                <div style={{height:'80vh', position:'relative', textAlign:'center'}}>
                  <main style={{overflowY:'auto', maxHeight:'77vh', flexDirection: "column"}}>
                    {messages && messages.map(msg => <ChatMessage key={msg.id} id = {msg.id} message={msg} userName={userName} chatMember={chatMember}/>)}
                  </main>
                    <form onSubmit={sendMessage} style={{position:'absolute', bottom:'0px', display:'flex', width:'100%', paddingTop:'0px'}}>
                      <input type='text' style={{borderWidth:'0.5px', borderRadius:'20px', marginLeft:'1%',
                      width:'92%', float:'left'}} value={formValue} 
                      onChange={(e) => setFormValue(e.target.value)} placeholder="  say something nice" />
                      <button type="submit" style={{borderWidth:'0px', float:'right', marginBottom:'8px'}} disabled={!formValue}>
                      <SendOutlined size={24}/>
                      </button>
                    </form>
                  </div>
                  <Drawer visible={visibleDrawer} placement='left' title={first.chatName}
                    width={'450px'} onClose={() => setVisibleDrawer(false)}>
                    <GroupChatInfo chatMember={chatMember} setChatMember={setChatMember} groupName={first.chatName}  chatID={chatID}/>  
                  </Drawer>
              </div>)
          }
       
            
            function ChatMessage(props) {
              const {time, text, uid} = props.message;
              const userName = props.userName
              const chatMember = props.chatMember

              const { currentUser } = useAuth()
              
              const messageClass = uid === currentUser.email ? 'sent' : 'received';

              const selected = chatMember.find(per => {
                return per.email === uid ? per: false
              })

              const name = uid === currentUser.email ? userName 
                                                    : selected ?
                                                      selected.firstName
                                                      : uid
            
              return (<div>
               <div className={`message ${messageClass}`}>
                  <p  name="p-message">
                    {name + ":"} {text } 
                    <span style={{fontSize:'10px', fontFamily:'Courier New'}}> {time}
                    </span></p>
                </div>
              </div>)
            }
  
            