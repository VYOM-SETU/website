import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { doc, updateDoc, deleteDoc, db } from '../lib/firebase';
import Spinner from './Spinner';
import TaskSubmission from './TaskSubmission';

const TaskCard = ({ task, onUpdate }) => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [showSubmissionModal, setShowSubmissionModal] = useState(false);

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'in-progress': return 'bg-blue-100 text-blue-800';
            case 'completed': return 'bg-green-100 text-green-800';
            case 'overdue': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'high': return 'bg-red-500';
            case 'medium': return 'bg-yellow-500';
            case 'low': return 'bg-green-500';
            default: return 'bg-gray-500';
        }
    };

    const handleStatusChange = async (newStatus) => {
        if (!userProfile || (userProfile.role !== 'member' && userProfile.role !== 'domain-lead')) {
            return;
        }

        setLoading(true);
        try {
            await updateDoc(doc(db, 'tasks', task.id), {
                status: newStatus,
                updatedAt: new Date()
            });
            onUpdate();
        } catch (error) {
            console.error('Error updating task status:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!userProfile || userProfile.role !== 'domain-lead') {
            return;
        }

        setLoading(true);
        try {
            await deleteDoc(doc(db, 'tasks', task.id));
            onUpdate();
        } catch (error) {
            console.error('Error deleting task:', error);
        } finally {
            setLoading(false);
            setShowDeleteConfirm(false);
        }
    };

    const canEdit = userProfile?.role === 'domain-lead' || userProfile?.role === 'member';
    const canDelete = userProfile?.role === 'domain-lead';
    const canSubmit = userProfile?.role === 'member' && task.status === 'completed';

    return (
        <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200 hover:shadow-lg transition-shadow duration-200">
            <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{task.title}</h3>
                    <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${getPriorityColor(task.priority)}`}></div>
                    <span className="text-xs text-gray-500 capitalize">{task.priority}</span>
                </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-4">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status.replace('-', ' ')}
                </span>
                {task.domain && (
                    <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
                        {task.domain}
                    </span>
                )}
            </div>

            <div className="text-sm text-gray-500 mb-4">
                <p><strong>Assigned to:</strong> {task.assignedToName || 'Unassigned'}</p>
                <p><strong>Due:</strong> {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No due date'}</p>
                {task.createdAt && (
                    <p><strong>Created:</strong> {new Date(task.createdAt).toLocaleDateString()}</p>
                )}
            </div>

            {canEdit && (
                <div className="flex flex-wrap gap-2 mb-4">
                    <select
                        value={task.status}
                        onChange={(e) => handleStatusChange(e.target.value)}
                        disabled={loading}
                        className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                    {canSubmit && (
                        <button
                            onClick={() => setShowSubmissionModal(true)}
                            className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                        >
                            Submit Task
                        </button>
                    )}
                </div>
            )}

            <div className="flex justify-between items-center">
                <div className="text-xs text-gray-400">
                    ID: {task.id}
                </div>
                
                {canDelete && (
                    <div className="flex space-x-2">
                        {!showDeleteConfirm ? (
                            <button
                                onClick={() => setShowDeleteConfirm(true)}
                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                disabled={loading}
                            >
                                Delete
                            </button>
                        ) : (
                            <div className="flex space-x-2">
                                <button
                                    onClick={handleDelete}
                                    disabled={loading}
                                    className="text-red-600 hover:text-red-800 text-sm font-medium"
                                >
                                    {loading ? <Spinner size="sm" /> : 'Confirm'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(false)}
                                    className="text-gray-600 hover:text-gray-800 text-sm font-medium"
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
            
            {showSubmissionModal && (
                <TaskSubmission
                    task={task}
                    onClose={() => setShowSubmissionModal(false)}
                    onSubmitted={onUpdate}
                />
            )}
        </div>
    );
};

export default TaskCard;
