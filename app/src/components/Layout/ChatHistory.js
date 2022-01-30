import { UserOutlined, TeamOutlined } from '@ant-design/icons'
import React, {useState, useEffect} from 'react'
import { Avatar, Drawer } from 'antd'
import db from "../../firebase.js"
import { useAuth } from '../../context/AuthContext'
import { ButtonGroup, ToggleButton, Button } from 'react-bootstrap'
import AddGroupList from './AddGroupList.js'

const ChatHistory = ({ chatHist, groupList, setChatData, friendEmails, setIsFriend, setGrpChatID}) => {
    const { currentUser } = useAuth()
    const [chatInfo, setChatInfo] = useState([])

    //group info
    const [groupChatInfo, setGroupChatInfo] = useState([])

    //display new group
    const [newGrpIDs, setNewGrpIDs] = useState([])

    // displaying add group
    const [displayGrpBtn, setDisplayGrpBtn] = useState(false)
    const [visibleDrawer, setVisibleDrawer] = useState(false)

    // for button group
    const [radioValue, setRadioValue] = useState('1');

    const radios = [
        { name: ' All', value: '1' },
        { name: ' Friends', value: '2' },
        { name: ' Groups', value: '3' },
      ];

    const handleChat = (e) => {
        if (radioValue === '1' || radioValue === '2'){
        const selected = chatHist.find(per => {
           return per.email === e ? per: false
        })
        try {
        setIsFriend(!friendEmails.includes(selected.email))
        } 
        catch (e) {
            console.log('error reading chat')
        }
        setGrpChatID('')
        setChatData(selected)

        } else {
            setChatData('')
            setGrpChatID(e)
        }
    }

    // fetch personal chat data
     useEffect(() => {
        const timeOut = setTimeout(() => { 
        const fetchChat = async () => {
            var list = []
            await chatHist.map(chat =>{ 
                 db.collection('chats')
                .doc('all')
                .collection(currentUser.email + chat.email)
                .orderBy('createdAt', 'desc').limit(1)
                .get()
                .then(snap => {
                    snap.docs.forEach(doc => {
                        const per = doc.data()
                        per['name'] = chat.firstName + " " + chat.lastName
                        per['image'] = chat.image
                        list =  [...list, per]   
                        
 
                        if (list.length === chatHist.length) {
                           list.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                            setChatInfo(list)
                        } 
                    })
                })
                return chat
            })
         }
         

         if (radioValue !== '3') {
            fetchChat()
         } 


         console.log('trigger ' + 10 )
         //set timer, load it instant if havent been loaded else rerender every 5s
        }, chatInfo.length === chatHist.length ? 10000 : 500)

        return () => clearTimeout(timeOut)
     }, [chatHist, currentUser.email, chatInfo, radioValue])

     // fetch group chat data
     useEffect(() => {
            const fetchGroupData = async () => {
                // if got more groups are created 
                for (var i = 0; i < newGrpIDs.length; i++) {
                    groupList = [newGrpIDs[i], ...groupList]
                }
            
                var list = []
                try {
                await groupList.map(chat =>{ 
                    db.collection('chats')
                   .doc('all')
                   .collection(chat)
                   .orderBy('createdAt', 'desc').limit(1)
                   .get()
                    .then(snap => {
                       snap.docs.forEach(doc => {
                           const per = doc.data()
                           per.rid = chat
                           per.name = per.chatName
                           list =  [...list, per]
                           if (list.length === groupList.length && list[0].createdAt !== null) {
                               list.sort((a, b) => b.createdAt.seconds - a.createdAt.seconds)
                           } 
                           
                        setGroupChatInfo(list)
                        if (newGrpIDs.length > 0) {
                            setChatInfo(list)
                        }
                       })
                   })
                   return chat
                })
                } catch (e) { 
                    // console.log (e)
                    console.log('error reading grouplist in chatHistory')
                }
            }
            
            if (groupChatInfo.length !== groupList.length || newGrpIDs !== []) {
                fetchGroupData()
            } 
            if (radioValue === '3') {
                setChatInfo(groupChatInfo)
            }
            
     }, [groupList, radioValue, currentUser.email, newGrpIDs])


     const handleGroupButton = (e) => {
        // set the button mode to All, Friends or Groups 
        setRadioValue(e)

           if (e === '3') {
            setDisplayGrpBtn(true)
        } else {
            setDisplayGrpBtn(false)
        }
     }

     // output appropriate date format in dd/mm/yy and hh:mm
     function handleDate(date) {
        if (date !== null) {
            var split1 = date.toDate().toString().split(' ')
            var day = split1[2] + "-" + split1[1] + '-' + split1[3] +'\n'
            var time = split1[4].substring(0, 5)
            return day + time
        } else {
            return '...'
        }
     }

     // shortern text display in a box if too long
     function shortenText(text, limit) {
         if (text.length > limit) {
             return text.substring(0, limit) + '...'
         } 
         return text
     }

    return(
        <div> 
        <div style={{textAlign:'center', backgroundColor:'#e0e0e0'}}>
           
        </div>
        <ButtonGroup toggle style={{width:'100%'}}>
            {radios.map((radio, idx) => (
                <ToggleButton
                key={idx}
                type="radio"
                variant="secondary"
                name="radio"
                value={radio.value}
                checked={radioValue === radio.value}
                onChange={(e) => handleGroupButton(e.target.value)}
                >
                {radio.name}
                </ToggleButton>
            ))}
        </ButtonGroup>
        {displayGrpBtn && <Button onClick={() => setVisibleDrawer(true)} variant='outline-secondary' style={{'width':'100%', 'border':'0px'}}> 
        + New Group </Button>}
        <Drawer visible={visibleDrawer} placement='left' title='New Group'
        width={'450px'} onClose={() => setVisibleDrawer(false)}>
                <AddGroupList setVisibleDrawer={setVisibleDrawer} setNewGrpIDs={setNewGrpIDs} newGrpIDs={newGrpIDs}></AddGroupList>
        </Drawer>
        <div style={{overflowY:'auto', maxHeight:'82vh'}}>
            {   
                chatInfo
                .filter(person => {
                    if (radioValue === '1') {
                        return person
                    }else if (radioValue === '2' && friendEmails.includes(person.rid)) {
                        return person
                    }   else if(radioValue === '3') {
                        return person
                    }
                    return false
                })
                .map(person => (
                    <Button variant='primary'
                    onClick={() => handleChat(person.rid)}
                    key={person.createdAt}
                    style={{display:'flex', width:'100%', backgroundColor:'transparent', borderColor:'#fafafa', borderWidth:'0.01px', color:'black'}}>
                        <div style={{float:'left',  margin:'2%'}}>
                           {radioValue === '3' ? <Avatar size={60} icon={<TeamOutlined/>}></Avatar>  
                                            : <Avatar size={60} src={person.image} icon={<UserOutlined/>}></Avatar>}
                        </div>
                        <div style={{margin:'2%', width:'60%'}}>
                            <div style={{float:'left', textAlign:'left'}}>
                                <h5>{person.name}</h5>
                                {shortenText(person.text, 22)}
                            </div>
                        </div>
                        <div style={{float:'left', margin:'2%', width:'40%'}}>
                            <div style={{float:'right', textAlign:'right'}}>
                                <p>{handleDate(person.createdAt)}</p>
                            </div>
                        </div>
                    </Button>))
            }
        </div>        
        </div>
    )

}
export default ChatHistory
