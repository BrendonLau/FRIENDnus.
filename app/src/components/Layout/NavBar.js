import React, { useState, useEffect } from 'react'
import {Navbar, Nav, NavDropdown, Alert} from "react-bootstrap"
import { useAuth } from '../../context/AuthContext'
import { useHistory } from "react-router-dom"
import { HomeOutlined, UserOutlined, FireOutlined, BellOutlined } from '@ant-design/icons'
import { Avatar, Tooltip, Drawer, Badge } from 'antd'
import db from '../../firebase'
import Image from "../../iconfinder-512.png"
import FriendRequest from './FriendRequest'


  const NavBar = ({ setFriends }) => {
   const [error, setError] = useState('')
   const [userData, setUserData] = useState('')
   const [visibleDrawer, setVisibleDrawer] = useState(false)
   const { logout, currentUser } = useAuth()
   const history = useHistory()

   const [showNoti, setShowNoti] = useState(true)

   useEffect(() => {
    const fetchUserData = async () =>{
        await db.collection("users")
        .where("email","==", currentUser.email)
        .get()
        .then(snap => {
            snap.docs.forEach(doc => {
                setUserData(doc.data()) 
            })
        })
        .then(() => console.log("successfully read profile photo for menu"))
        .catch((error) => console.log("Error in reading profile photo for menu", error))
    }
    fetchUserData()
  }, [currentUser.email])

   async function handleLogout() {
      setError('')
      try {
          await logout
          history.push('/login')
          setError("Hello")
      } catch (error) {
          setError(error.message)
      }
    }

    const handleDrawer = () => {
      setVisibleDrawer(true)
    }

    const handleCloseDrawer = () => {
      setShowNoti(false)
      setVisibleDrawer(false)
    }

    return (
      <div>
        <Navbar collapseOnSelect expand="xl" bg="primary" variant="dark">  
           <Navbar.Brand href="/" style={{paddingLeft: "8%"}}> 
            <img src={Image} alt="" style={{width:'32px', height:'32px'}}/>FRIENDnus
           </Navbar.Brand>
           <Navbar.Toggle aria-controls="responsive-navbar-nav" />
           <Navbar.Collapse id="responsive-navbar-nav">
              <Nav className="justify-content-end" style={{ width: "88%" }}>
                <Tooltip placement='bottom' title='match'>
                  <Badge><Nav.Link href="/match"><FireOutlined style={{fontSize:'24px', color:'white'}}/></Nav.Link></Badge>
                </Tooltip>
                <Badge count={showNoti ? userData && userData.friendRequest.length: 0} size='small' offset={[-7,7]}>
                   <Nav.Link onClick={handleDrawer}><BellOutlined style={{fontSize:'24px', color:'white'}}/></Nav.Link>
                </Badge>
                <Drawer title="Friend Request" width="350px" visible={visibleDrawer} onClose={handleCloseDrawer}>
                   <FriendRequest setFriends={setFriends} userData={userData}/>
                </Drawer>
                <Tooltip placement='bottom' title='home'>
                  <Badge><Nav.Link href='/'><HomeOutlined style={{fontSize:'24px', color:'white'}}/></Nav.Link></Badge>
                </Tooltip>
                <NavDropdown title={<Avatar size={25} icon={<UserOutlined/>} src={userData.image}/>} id="collasible-nav-dropdown" alignRight>
                    <NavDropdown.Item href="/profile">Profile</NavDropdown.Item>
                    <NavDropdown.Divider />
                    <NavDropdown.Item href="/login" onClick={handleLogout}>Log Out</NavDropdown.Item>
                </NavDropdown>
              </Nav>
           </Navbar.Collapse>
        </Navbar>
        {error && <Alert variant="danger">{error}</Alert>}
      </div>
      )
    }
export default NavBar 