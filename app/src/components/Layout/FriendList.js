import React, { useState } from "react"
import FriendProfile from './FriendProfile'

export default function FriendList({ setChatData, friends, setFriends }) {
    
    const [searchTerm, setSearchTerm] = useState('')
   
    return(
        <div> 
            <div style={{borderBottom:'solid', borderColor:'#ebebeb'}}>
                <input type='text' placeholder='Search...' style={{borderWidth:'0px', width:'100%'}}
                onChange={e => {setSearchTerm(e.target.value)}}
                ></input>
            </div>
            
            <div style={{overflowY:"auto", maxHeight: "400px"}} >
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
                       <FriendProfile key={friend.phone + friend.lastName} 
                       friend={friend} 
                       setChatData={setChatData}
                       setFriends={setFriends}
                       ></FriendProfile>
                    ))
                }
            </div>
        </div>
    )
}