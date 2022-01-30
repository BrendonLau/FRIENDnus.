import React, {useState, useEffect} from 'react'
import NavBar from '../components/Layout/NavBar'
import FriendList from '../components/Layout/FriendList'
import "../style/css/dashboard.css"
import { Accordion, Card } from 'react-bootstrap'
import { CommentOutlined } from '@ant-design/icons'
import ChatRoom from '../components/user/chat2'
import db from '../firebase.js'
import { useAuth } from '../context/AuthContext'
import ChatHistory from '../components/Layout/ChatHistory'
import Groupchat from '../components/user/groupchat'


/**
 * This component handles the main page after the user
 * successfully login
 */

export default function Dashboard() {
    const [chatData, setChatData] = useState("")
    
    // for friend list 
    const [friends, setFriends] = useState([])
    const { currentUser } = useAuth()

    // for chat list 
    const  [chatHist, setChatHist ] = useState([])
    const [friendEmails, setFriendEmails] = useState([])
    const [isFriend, setIsFriend] = useState(false)

    // for thomas group chat
    const [groupList, setGroupList] = useState(' ')
    const [grpChatID, setGrpChatID] = useState('')
    

    useEffect(() => {
        var frenList = []
        var chatList = []
        var gchatList = []

        const fetchUserData = async () =>{
            // fetch user friend list
            //fetch user chat list
            await db.collection("users")
            .where("email","==", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    frenList = doc.data().friendList
                    chatList = doc.data().chatList
                    
                })
            })
            for (let i = 0 ; i< chatList.length; i ++){
                if(chatList[i].includes("GROUP")){
                    gchatList.push(chatList[i])
                }

            }
            setGroupList(gchatList)
            setFriendEmails(frenList)

            // fetch all the data in the friend list 
            await db.collection("users")
            .where("email","!=", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    // append data into array if it is in the friend list
                    if (frenList.includes(doc.data().email)) {
                        setFriends(friends => [...friends, doc.data()])
                    }
                })
            })
            .then(() => console.log("successfully read all in friendlist"))
            .catch((error) => console.log("Error in reading friendlist:", error))
        }
        

        const fetchChatList = async () =>{ 
                      //fetch all data from chat List
                      await db.collection("users")
                      .where("email","!=", currentUser.email)
                      .get()
                      .then(snap => {
                          snap.docs.forEach(doc => {
                              // append data into array if it is in the friend list
                              if (chatList.includes(doc.data().email)) {
                                  setChatHist(chatHist => [...chatHist, doc.data()])
                              }
                          })
                      })
                      .then(() => console.log("successfully read all in chatlist"))
                      .catch((error) => console.log("Error in reading chatlist:", error))
                }

        
        if (friends.length === 0) {
            fetchUserData()
        }
   
        fetchChatList()   
        
    }, [currentUser.email, friends.length])
 

         
    return (
        <div>
            <NavBar setFriends={setFriends}/>
            <div className="body">
                <div className="leftpane">
                    {chatHist !== [] ? <ChatHistory chatHist={chatHist}
                    setChatData={setChatData}
                    friendEmails={friendEmails}
                    groupList = {groupList}
                    setIsFriend={setIsFriend}
                    setGrpChatID={setGrpChatID}
                    ></ChatHistory> : false}
                    
                </div>
                <div className="middlepane">
                    {!grpChatID && !chatData && <div  style={{textAlign:'center', paddingTop:'25%'}}>
                       <CommentOutlined style={{fontSize:'100px', color:'#106cfc'}}/>
                       <p>chat</p>
                    </div>}
                    
                    {chatData ? <ChatRoom  friendData={chatData} isFriend={isFriend}></ChatRoom> : false}
                    {grpChatID && <Groupchat ID={grpChatID}></Groupchat>}
                </div>
                <div className="rightpane">
                    <Accordion defaultActiveKey='0'>
                        <Card>
                            <Accordion.Toggle as={Card.Header} eventKey="0">
                                Friends
                            </Accordion.Toggle>
                            <Accordion.Collapse eventKey="0">
                               {friends && <FriendList setChatData={setChatData}
                                friends={friends}
                                setFriends={setFriends}/>}
                            </Accordion.Collapse>
                        </Card>
                    </Accordion>
                </div>
            </div>
        </div>
    )
}