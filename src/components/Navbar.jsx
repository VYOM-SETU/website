import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { signOut, auth } from '../lib/firebase';

const Navbar = () => {
    const { currentUser, userProfile } = useAuth();

    const handleLogout = async () => {
        try {
            await signOut(auth);
        } catch (error) {
            console.error('Error logging out:', error);
        }
    };

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            <h1 className="text-xl font-bold text-gray-900">VyomSetu</h1>
                        </div>
                    </div>
                    
                    {currentUser && (
                        <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-2">
                                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                                    <span className="text-white text-sm font-medium">
                                        {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0)}
                                    </span>
                                </div>
                                <div className="hidden md:block">
                                    <p className="text-sm font-medium text-gray-900">{userProfile?.name || 'User'}</p>
                                    <p className="text-xs text-gray-500 capitalize">{userProfile?.role || 'Member'}</p>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200"
                            >
                                Logout
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
