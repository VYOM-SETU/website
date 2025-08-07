import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, orderBy, db } from '../lib/firebase';
import TaskCard from './TaskCard';
import Spinner from './Spinner';

const MemberTasks = () => {
    const { currentUser, userProfile } = useAuth();
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!currentUser) return;

        // Simplified query to avoid composite index issues
        const tasksQuery = query(
            collection(db, 'tasks'),
            where('assignedTo', '==', currentUser.uid)
        );

        const unsubscribe = onSnapshot(tasksQuery, (snapshot) => {
            const tasksData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Sort client-side to avoid index issues
            tasksData.sort((a, b) => {
                if (a.createdAt && b.createdAt) {
                    return b.createdAt.toDate() - a.createdAt.toDate();
                }
                return 0;
            });
            setTasks(tasksData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching tasks:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [currentUser]);

    const filteredTasks = tasks.filter(task => {
        switch (filter) {
            case 'pending':
                return task.status === 'pending';
            case 'in-progress':
                return task.status === 'in-progress';
            case 'completed':
                return task.status === 'completed';
            case 'overdue':
                return task.status === 'overdue';
            default:
                return true;
        }
    });

    const getStatusCount = (status) => {
        return tasks.filter(task => task.status === status).length;
    };

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
                    <h2 className="text-2xl font-bold text-gray-900">My Tasks</h2>
                    <p className="text-gray-600">Manage your assigned tasks and track progress</p>
                </div>
                
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Tasks ({tasks.length})</option>
                        <option value="pending">Pending ({getStatusCount('pending')})</option>
                        <option value="in-progress">In Progress ({getStatusCount('in-progress')})</option>
                        <option value="completed">Completed ({getStatusCount('completed')})</option>
                        <option value="overdue">Overdue ({getStatusCount('overdue')})</option>
                    </select>
                </div>
            </div>

            {/* Status Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{getStatusCount('pending')}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-yellow-800">Pending</p>
                            <p className="text-xs text-yellow-600">Awaiting action</p>
                        </div>
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{getStatusCount('in-progress')}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-blue-800">In Progress</p>
                            <p className="text-xs text-blue-600">Currently working</p>
                        </div>
                    </div>
                </div>

                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{getStatusCount('completed')}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-green-800">Completed</p>
                            <p className="text-xs text-green-600">Finished tasks</p>
                        </div>
                    </div>
                </div>

                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-bold">{getStatusCount('overdue')}</span>
                        </div>
                        <div className="ml-3">
                            <p className="text-sm font-medium text-red-800">Overdue</p>
                            <p className="text-xs text-red-600">Past due date</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tasks List */}
            {filteredTasks.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
                    <p className="text-gray-500">
                        {filter === 'all' 
                            ? "You don't have any tasks assigned yet." 
                            : `No tasks with status "${filter}" found.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredTasks.map(task => (
                        <TaskCard 
                            key={task.id} 
                            task={task} 
                            onUpdate={() => {}} // Real-time updates handled by onSnapshot
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default MemberTasks;
