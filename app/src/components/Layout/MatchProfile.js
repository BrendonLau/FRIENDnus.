import React, {useState} from "react"
import { Card } from 'react-bootstrap'
import { useHistory } from "react-router-dom";
import { Avatar, Modal } from 'antd'
import { UserOutlined } from '@ant-design/icons'

export default function MatchProfile({ userData }) {
    const [visible, setVisible] = useState(false)
    const history = useHistory()

    const showModal = () => {
        setVisible(true)
    }

    const handleCancel = (e) => {
        setVisible(false)
    }

    const handleOk = (e) => {
        history.push({
            pathname:'/chat',
            state: userData
        })
    }

    return (
        <React.Fragment>
        <Card style={{marginTop:'2%', marginBottom:'2%', marginLeft:'auto', marginRight:'auto',
            borderRadius:'15px', width:"85%", alignItems:'middle'}} 
            border="secondary" 
            onClick={showModal}>
            <div style={{display:'flex'}}>
                <div style={{width:"20%", float:"left", padding:"2%", alignItems:"center", justifyContent:"center"}}>
                    <Avatar size={80} src={userData.image} icon={<UserOutlined/>}></Avatar>
                </div>
                <div style={{width:"70%", float:"left", padding:"1%", marginLeft:'2%', textAlign:'left'}}>
                    <p style={{verticalAlign:'middle'}}><strong>{userData.firstName + " " + userData.lastName}</strong>
                        <br/>
                        <span style={{display:'inline-block', marginTop:'10px'}}>Major: {userData.major}</span>
                        <br/>
                        <span>Interests: {userData.interest}</span>
                    </p>
                </div>
            </div>
        </Card>
        <Modal visible={visible}
        okText="Chat"
        onCancel={handleCancel}
        onOk={ handleOk /*<Link to={{pathname: "/chat", state: userData}}>Chat</Link>*/}
        >
            <Card style={{borderRadius:'10px', display:'flex'}} border="dark">
                <div>
                    <div style={{float:'left', padding:'2%'}}>
                        <Avatar size={100} src={userData.image} icon={<UserOutlined/>}></Avatar>
                    </div>       
                    <div style={{padding:"2%", marginTop:'4%'}}>
                        <p style={{display:"block"}}><strong>{userData.firstName + " " + userData.lastName}</strong></p>
                        <p>{userData.major}</p>
                    </div>
                </div>
                
                <hr/>
                <div style={{margin:'2%'}}>
                    <h6>Bio: </h6><p>{userData.bio}</p>
                    <h6>Interests: </h6><p> {userData.interest} </p>
                    <p><strong>Email: </strong>{userData.email}</p>
                </div>
            </Card>
         {/* <Link to={{pathname: "/chat", state: userData}}>Chat</Link> */}
        </Modal>
        </React.Fragment>
        
        )

}