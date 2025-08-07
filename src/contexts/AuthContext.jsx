import React, { createContext, useState, useEffect, useContext } from 'react';
import { auth, onAuthStateChanged, db, doc, onSnapshot } from '../lib/firebase';
import Spinner from '../components/Spinner';

const AuthContext = createContext();

export const useAuth = () => {
    return useContext(AuthContext);
}

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setCurrentUser(user);
            if (user) {
                const unsubProfile = onSnapshot(doc(db, 'users', user.uid), (snapshot) => {
                    if (snapshot.exists()) {
                        setUserProfile({ uid: user.uid, ...snapshot.data() });
                    }
                    setLoading(false);
                });
                return () => unsubProfile();
            } else {
                setUserProfile(null);
                setLoading(false);
            }
        });
        return unsubscribe;
    }, []);

    const value = {
        currentUser,
        userProfile,
        loading
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};