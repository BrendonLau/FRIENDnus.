import React from 'react'
import Match from '../components/Layout/Match'
import NavBar from '../components/Layout/NavBar'


export default function MatchPage() {

    return(
        <div>
            <NavBar/>
            <div style={{ display:'flex', justifyContent:'center', width:'100%'}}>
                <Match/>
            </div>
        </div>
    )
}