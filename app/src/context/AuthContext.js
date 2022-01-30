import React, { useContext, useState, useEffect } from 'react'
import { auth } from '../firebase'

//Allows data to be accessible by many components
const AuthContext = React.createContext()

/**
 * This function will trigger a rerender with latest
 * context value
 * 
 * @returns current context values for the current user
 */
export function useAuth() {
    return useContext(AuthContext)
}

/**
 * This function handles all methods regarding to users
 */
export function AuthProvider({ children }) {
    //state of current user
    const [currentUser, setCurrentUser] = useState()
    //stop updating when there is a user 
    const [loading, setLoading] = useState(true)
    
    function signup(email, password) {
        return auth.createUserWithEmailAndPassword(email, password)
    }

    function login(email, password) {
        return auth.signInWithEmailAndPassword(email, password)
    }

    function logout() {
        return auth.signOut()
    }

    function resetPassword(email) {
        return auth.sendPasswordResetEmail(email)
    }

    function updateEmail(email) {
        return currentUser.updateEmail(email)
    }

    function updatePassword(password) {
        return currentUser.updatePassword(password)
    }

    // set the the new user as the current user whenever
    // there is a change in state
    auth.onAuthStateChanged(user => {
        setCurrentUser(user)
    })
    
    //stop updating when there is a user 
    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged(user => {
            setCurrentUser(user)
            setLoading(false)
        })

        return unsubscribe
    }, [])

    // value contains all the information of the user that can be shared globally
    // with other components
    const value = {
        currentUser,
        signup,
        login,
        logout,
        resetPassword,
        updatePassword,
        updateEmail
    }

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    )
}
