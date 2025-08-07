import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

const RoleManagement = () => {
    const [email, setEmail] = useState('');
    const [role, setRole] = useState('member');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { currentUser } = useAuth();

    const handleRoleChange = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');
        setLoading(true);

        try {
            const token = await currentUser.getIdToken();
            const response = await fetch('/api/setUserRole', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ targetEmail: email, newRole: role })
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Failed to set role.');
            }

            setMessage(data.message);
            setEmail('');

        } catch (err) {
            setError(err.message);
        }
        setLoading(false);
    };

    return (
        <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">Manage User Roles</h2>
            {message && <div className="bg-green-100 text-green-800 p-3 rounded-md mb-4">{message}</div>}
            {error && <div className="bg-red-100 text-red-800 p-3 rounded-md mb-4">{error}</div>}
            <form onSubmit={handleRoleChange} className="space-y-4">
                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">User Email</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        placeholder="user@example.com"
                        required
                    />
                </div>
                <div>
                    <label htmlFor="role" className="block text-sm font-medium text-gray-700">Assign Role</label>
                    <select
                        id="role"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    >
                        <option value="member">Member</option>
                        <option value="domain-lead">Domain Lead</option>
                        <option value="admin">Admin</option>
                        <option value="super-admin">Super Admin</option>
                    </select>
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-indigo-300"
                >
                    {loading ? 'Assigning...' : 'Assign Role'}
                </button>
            </form>
        </div>
    );
};

export default RoleManagement;