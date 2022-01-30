
import React, { useState, useRef, useEffect } from 'react'
import moment from 'moment'
import { useAuth } from '../../context/AuthContext'
import db, { auth } from "../../firebase.js"
import firebase from 'firebase/app';
import { Avatar, message } from 'antd'
import { UserOutlined, SendOutlined, UserAddOutlined } from '@ant-design/icons'
import { useCollectionData } from 'react-firebase-hooks/firestore'
import '../../style/css/chat.css'
      

        export default function ChatRoom({ friendData, isFriend }) {
            const receiver = friendData
            const { currentUser } = useAuth()
            const [disableAdd, setDisableAdd] = useState(false)

            const addToChatList = async () => {
              if (!(receiver.chatList.includes(currentUser.email))){
                // add currentuser email to receiver chat history 
                var tempChatList1 = receiver.chatList 
                tempChatList1.push(currentUser.email)
                await db.collection('users') 
                  .doc(receiver.email) 
                  .update({chatList: tempChatList1})
                
                // query currentUser chatList 
                var tempChatList2 = []
                await db.collection('users')
                  .where('email', '==', currentUser.email)
                  .get()
                  .then(snap => {
                    snap.docs.forEach(doc => {
                      tempChatList2 = doc.data().chatList
                    })
                  }) 
                
                // update currentUser chatList
                tempChatList2.push(receiver.email)
                await  db.collection('users') 
                  .doc(currentUser.email) 
                  .update({chatList: tempChatList2})
                
                console.log("new chat added")
              }
            }

            const collectionid = receiver.email + currentUser.email
            const collectionid2 = currentUser.email + receiver.email
           
            const messagesRef = db.collection("chats").doc("all").collection(collectionid)
            const messageRef2 = db.collection("chats").doc("all").collection(collectionid2)

            const query = messagesRef.orderBy('createdAt').limit(25);
            const [messages] = useCollectionData(query, { idField: 'id' });
            const [formValue, setFormValue] = useState('');

          
            const sendMessage = async (e) => {
              e.preventDefault();
              
              // add chat to chat history
              addToChatList()
              
              const message = formValue
              setFormValue('');

              await messagesRef.add({
                text: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                time: moment().format('HH:mm'),
                uid: currentUser.email,
                rid: receiver.email,
                

              })
              await messageRef2.add({
                text: message,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                time: moment().format('HH:mm'),
                uid: currentUser.email,
                rid: receiver.email,
              })
          
              
            }

            const handleAdd = async() => {
              setDisableAdd(true)
              var array = []
              var isRequested = false
              await db.collection('users')
              .where('email', '==', receiver.email)
              .get()
              .then(snap => {
                snap.docs.forEach(doc => {
                  const friendreq = doc.data().friendRequest
                  for (var i = 0; i < friendreq.length; i++) {
                    if (friendreq[i] === currentUser.email) {
                      message.error("Request is already sent.", [2])
                      isRequested = true
                      break;
                    }
                  }
                 if (!isRequested) array = [...friendreq, currentUser.email]
                });
              })
              .then(() => console.log("fetched friend request."))

              if (!isRequested) {
                await db.collection('users')
                .doc(receiver.email)
                .update({friendRequest: array})
                .then(() => console.log('friend request is added successfully.'))
                message.success("Request has been sent.", [4])
              }
              setDisableAdd(false)
            }

            const AlwaysScrollToBottom = () => {
              const elementRef = useRef();
              useEffect(() => elementRef.current.scrollIntoView())
              return <div ref={elementRef} />
            }
          
            return (
              <div style={{border:'solid', borderWidth:'0.2px', borderColor:'#d9d9d9', height:'100%'}}>
                 <div style={{display:'flex', borderWidth:'0.02px', border:'solid', borderColor:'#e3e3e3', backgroundColor:'#fbfbfb'}}>
                   <div style={{float:'left', margin:'1%', marginLeft:'3%'}}>
                      <Avatar size={50} src={receiver.image} icon={<UserOutlined/>}></Avatar>
                   </div> 
                   <div style={{float:'left', marginTop:'2.5%', marginLeft:'3%'}}> 
                      <h4 className="mb-4">{receiver.firstName + " " + receiver.lastName}</h4> 
                   </div>
                 </div>
              <div style={{height:'80vh', position:'relative', textAlign:'center'}}>
                <main style={{overflowY:'auto', maxHeight:'76vh', flexDirection: "column"}}>
                  {messages && messages.map(msg => <ChatMessage key={msg.id} id = {msg.id} message={ msg} time = {msg.createdAt} />)}
                  <AlwaysScrollToBottom/>
                </main>
                  <form onSubmit={sendMessage} style={{position:'absolute', bottom:'0px', display:'flex', width:'100%', paddingTop:'0px'}}>
                    <input type='text' style={{borderWidth:'0.5px', borderRadius:'20px', marginLeft:'1%',
                    width:'94%', float:'left'}} value={formValue} 
                    onChange={(e) => setFormValue(e.target.value)} placeholder="  say something nice" />
                    <button type="submit" style={{borderWidth:'0px', float:'right', marginBottom:'0px', width:'6%', backgroundColor:'transparent'}} disabled={!formValue}>
                    <SendOutlined size={24}/>
                    </button>
                    {isFriend && <button disabled={disableAdd} style={{borderWidth:'0px', float:'right', backgroundColor:'transparent', marginRight:'2%'}}
                    onClick={handleAdd}>
                      <UserAddOutlined/>
                    </button> }
                  </form>     
                </div>
            </div>)
          }

          function ChatMessage(props) {
            const {time, text, uid } = props.message;
          
            const messageClass = uid === auth.currentUser.email ? 'sent' : 'received';
          
            return (<div>
              <div className={`message ${messageClass}`}>
                <p  name="p-message"> {text } <span style={{fontSize:'10px', fontFamily:'Courier New'}}>{ time}</span></p>
              </div>
            </div>)
          }

