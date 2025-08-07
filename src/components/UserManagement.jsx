import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, db } from '../lib/firebase';
import Spinner from './Spinner';

const UserManagement = () => {
    const { userProfile } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingUser, setEditingUser] = useState(null);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!userProfile || userProfile.role !== 'super-admin') return;

        const usersQuery = query(collection(db, 'users'));
        const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
            const usersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setUsers(usersData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching users:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleRoleChange = async (userId, newRole) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                role: newRole,
                updatedAt: new Date()
            });
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user role:', error);
            alert('Error updating user role');
        }
    };

    const handleDomainChange = async (userId, newDomain) => {
        try {
            await updateDoc(doc(db, 'users', userId), {
                domain: newDomain,
                updatedAt: new Date()
            });
            setEditingUser(null);
        } catch (error) {
            console.error('Error updating user domain:', error);
            alert('Error updating user domain');
        }
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
            return;
        }

        try {
            await deleteDoc(doc(db, 'users', userId));
        } catch (error) {
            console.error('Error deleting user:', error);
            alert('Error deleting user');
        }
    };

    const filteredUsers = users.filter(user => {
        switch (filter) {
            case 'super-admin':
                return user.role === 'super-admin';
            case 'admin':
                return user.role === 'admin';
            case 'domain-lead':
                return user.role === 'domain-lead';
            case 'member':
                return user.role === 'member';
            default:
                return true;
        }
    });

    if (!userProfile || userProfile.role !== 'super-admin') {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">Only super admins can access user management.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">User Management</h2>
                    <p className="text-gray-600">Manage all users in the system</p>
                </div>
                
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Users ({users.length})</option>
                        <option value="super-admin">Super Admin ({users.filter(u => u.role === 'super-admin').length})</option>
                        <option value="admin">Admin ({users.filter(u => u.role === 'admin').length})</option>
                        <option value="domain-lead">Domain Lead ({users.filter(u => u.role === 'domain-lead').length})</option>
                        <option value="member">Member ({users.filter(u => u.role === 'member').length})</option>
                    </select>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    User
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Role
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Domain
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {filteredUsers.map(user => (
                                <tr key={user.uid} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex items-center">
                                            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                                                <span className="text-white text-sm font-medium">
                                                    {user.name?.charAt(0) || user.email?.charAt(0)}
                                                </span>
                                            </div>
                                            <div className="ml-4">
                                                <div className="text-sm font-medium text-gray-900">{user.name}</div>
                                                <div className="text-sm text-gray-500">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUser === user.uid ? (
                                            <select
                                                value={user.role}
                                                onChange={(e) => handleRoleChange(user.uid, e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="member">Member</option>
                                                <option value="domain-lead">Domain Lead</option>
                                                <option value="admin">Admin</option>
                                                <option value="super-admin">Super Admin</option>
                                            </select>
                                        ) : (
                                            <span className={`px-2 py-1 text-xs font-medium rounded-full capitalize ${
                                                user.role === 'super-admin' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'admin' ? 'bg-red-100 text-red-800' :
                                                user.role === 'domain-lead' ? 'bg-blue-100 text-blue-800' :
                                                'bg-green-100 text-green-800'
                                            }`}>
                                                {user.role}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        {editingUser === user.uid ? (
                                            <input
                                                type="text"
                                                value={user.domain || ''}
                                                onChange={(e) => handleDomainChange(user.uid, e.target.value)}
                                                className="px-2 py-1 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                placeholder="Enter domain"
                                            />
                                        ) : (
                                            <span className="text-sm text-gray-900">{user.domain || 'No domain'}</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                            user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                        }`}>
                                            {user.status || 'active'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                        <div className="flex space-x-2">
                                            {editingUser === user.uid ? (
                                                <>
                                                    <button
                                                        onClick={() => setEditingUser(null)}
                                                        className="text-gray-600 hover:text-gray-900"
                                                    >
                                                        Cancel
                                                    </button>
                                                </>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => setEditingUser(user.uid)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                    </button>
                                                    {user.uid !== userProfile.uid && (
                                                        <button
                                                            onClick={() => handleDeleteUser(user.uid)}
                                                            className="text-red-600 hover:text-red-900"
                                                        >
                                                            Delete
                                                        </button>
                                                    )}
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default UserManagement;
