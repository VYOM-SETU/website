import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import RoleManagement from './RoleManagement';
import MemberTasks from './MemberTasks';
import CreateTaskForm from './CreateTaskForm';
import UserManagement from './UserManagement';
import SubmissionsView from './SubmissionsView';
import Spinner from './Spinner';

const Dashboard = () => {
    const { userProfile } = useAuth();

    if (!userProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <Spinner size="lg" />
                    <p className="mt-4 text-gray-600">Loading user profile...</p>
                </div>
            </div>
        );
    }

    const renderDashboardByRole = () => {
        switch (userProfile.role) {
            case 'super-admin':
                return (
                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Role Management</h3>
                            <RoleManagement />
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">User Management</h3>
                            <UserManagement />
                        </div>
                    </div>
                );
            case 'admin':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Dashboard</h3>
                        <p className="text-gray-600">Admin functionality coming soon...</p>
                    </div>
                );
            case 'domain-lead':
                return (
                    <div className="space-y-8">
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Create Tasks</h3>
                            <CreateTaskForm />
                        </div>
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">Review Submissions</h3>
                            <SubmissionsView />
                        </div>
                    </div>
                );
            case 'member':
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <MemberTasks />
                    </div>
                );
            default:
                return (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Welcome!</h3>
                        <p className="text-gray-600">Your role is not defined. Please contact an administrator.</p>
                    </div>
                );
        }
    };

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                    <p className="mt-2 text-gray-600">
                        Welcome back, <span className="font-semibold text-gray-800">{userProfile.name}</span>! 
                        Your role is: <span className="font-semibold capitalize text-blue-600">{userProfile.role}</span>.
                    </p>
                </div>
                
                {renderDashboardByRole()}
            </div>
        </div>
    );
};

export default Dashboard;