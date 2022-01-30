import React, { useState, useEffect } from 'react'
import 'antd/dist/antd.css'
import { Avatar, Modal } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import { useAuth } from '../../context/AuthContext'
import db, { app } from '../../firebase.js'
import { PacmanLoader} from 'react-spinners'


export default function DisplayPhoto() {
    const { currentUser } = useAuth()
    const [visible, setVisible] = useState(false)
    const [profileImg, setProfileImg] = useState("")
    const [modalImg, setModalImg] = useState(profileImg)
    const [uploadImg, setUploadImg] = useState(null)
    const [loadingBar, setLoadingBar] = useState(false)
    
    
    const handleImgChange= (img) => {
        if (img.target.files[0]){ 
            setModalImg(URL.createObjectURL(img.target.files[0]))
            setUploadImg(img.target.files[0])
        }
    }

    const showModal = () => {
        setModalImg(profileImg)
        setVisible(true)
    }

    const handleOk = async (e) => {
        setLoadingBar(true)

        if (uploadImg){
            const storageRef = app.storage().ref()
            const fileRef = storageRef.child("display_images/" + uploadImg.name)
            await fileRef.put(uploadImg).then(() => console.log("image successfully written into storage/display_images/" + uploadImg.name))
            const fileUrl = await fileRef.getDownloadURL()
            setProfileImg(fileUrl)
            await db.collection("users").doc(currentUser.email).update({"image": fileUrl})
            .then(() => console.log("successfully updated image into datebase: ", fileUrl))
            .catch((error) => console.log("Error in writting image :", error))
            
        }

        setLoadingBar(false)
        setVisible(false)
    }

    // fetch profile image
    useEffect(() => {
        const fetchDP = async () =>{
            await db.collection("users")
            .where("email","==", currentUser.email)
            .get()
            .then(snap => {
                snap.docs.forEach(doc => {
                    setProfileImg(doc.data().image)
                    console.log("dp successfully fetched from firestore.")
                })
            })
        }
        fetchDP()
    }, [profileImg, currentUser.email])

    const handleCancel = e => { 
        setUploadImg(null)
        setModalImg(profileImg)
        setVisible(false)
    }

    return (
        <div className="dp" style={{display:"flex", justifyContent:"center"}}>
            <button style={{border: 0, backgroundColor: 'transparent'}} onClick={showModal}> 
                <Avatar size={100} icon={<UserOutlined/>} src={profileImg} alt=""/> 
            </button>
            <Modal title="Display Photo" 
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            >
            <img src={modalImg} style={{maxWidth:"100%", maxHeight:"50%"}} alt=""></img>
            {!loadingBar && <input type="file" onChange={handleImgChange}></input>}
            <div style={{paddingTop:"10px"}}>
                <PacmanLoader loading={loadingBar} color="#307fff"></PacmanLoader>
            </div>
           </Modal>
        </div>
    )
}