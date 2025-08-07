import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, query, where, getDocs, db } from '../lib/firebase';
import Spinner from './Spinner';

const CreateTaskForm = () => {
    const { userProfile } = useAuth();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [members, setMembers] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: '',
        assignedTo: '',
        domain: userProfile?.domain || ''
    });

    useEffect(() => {
        fetchMembers();
    }, []);

    const fetchMembers = async () => {
        setLoading(true);
        try {
            const membersQuery = query(
                collection(db, 'users'),
                where('role', '==', 'member'),
                where('domain', '==', userProfile?.domain)
            );
            const snapshot = await getDocs(membersQuery);
            const membersData = snapshot.docs.map(doc => ({
                uid: doc.id,
                ...doc.data()
            }));
            setMembers(membersData);
        } catch (error) {
            console.error('Error fetching members:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!userProfile || userProfile.role !== 'domain-lead') {
            alert('Only domain leads can create tasks');
            return;
        }

        if (!formData.title.trim() || !formData.description.trim()) {
            alert('Please fill in all required fields');
            return;
        }

        setSubmitting(true);
        try {
            const assignedMember = members.find(m => m.uid === formData.assignedTo);
            
            const taskData = {
                title: formData.title.trim(),
                description: formData.description.trim(),
                priority: formData.priority,
                status: 'pending',
                domain: userProfile.domain,
                assignedTo: formData.assignedTo,
                assignedToName: assignedMember?.name || 'Unassigned',
                createdBy: userProfile.uid,
                createdByName: userProfile.name,
                createdAt: new Date(),
                dueDate: formData.dueDate ? new Date(formData.dueDate) : null
            };

            await addDoc(collection(db, 'tasks'), taskData);
            
            // Reset form
            setFormData({
                title: '',
                description: '',
                priority: 'medium',
                dueDate: '',
                assignedTo: '',
                domain: userProfile.domain
            });
            
            alert('Task created successfully!');
        } catch (error) {
            console.error('Error creating task:', error);
            alert('Error creating task. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Task Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                            Task Title *
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Enter task title"
                            required
                        />
                    </div>

                    {/* Task Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                            Description *
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Describe the task in detail"
                            required
                        />
                    </div>

                    {/* Priority and Due Date Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-2">
                                Priority
                            </label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            >
                                <option value="low">Low</option>
                                <option value="medium">Medium</option>
                                <option value="high">High</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="dueDate" className="block text-sm font-medium text-gray-700 mb-2">
                                Due Date
                            </label>
                            <input
                                type="date"
                                id="dueDate"
                                name="dueDate"
                                value={formData.dueDate}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                    </div>

                    {/* Assign To */}
                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-medium text-gray-700 mb-2">
                            Assign To
                        </label>
                        <select
                            id="assignedTo"
                            name="assignedTo"
                            value={formData.assignedTo}
                            onChange={handleInputChange}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                            <option value="">Select a team member</option>
                            {members.map(member => (
                                <option key={member.uid} value={member.uid}>
                                    {member.name} ({member.email})
                                </option>
                            ))}
                        </select>
                        {members.length === 0 && (
                            <p className="text-sm text-gray-500 mt-1">
                                No members found in your domain. Contact super admin to add members.
                            </p>
                        )}
                    </div>

                    {/* Domain (Read-only) */}
                    <div>
                        <label htmlFor="domain" className="block text-sm font-medium text-gray-700 mb-2">
                            Domain
                        </label>
                        <input
                            type="text"
                            id="domain"
                            name="domain"
                            value={formData.domain}
                            disabled
                            className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
                        />
                    </div>

                    {/* Submit Button */}
                    <div className="flex justify-end space-x-4">
                        <button
                            type="button"
                            onClick={() => {
                                setFormData({
                                    title: '',
                                    description: '',
                                    priority: 'medium',
                                    dueDate: '',
                                    assignedTo: '',
                                    domain: userProfile?.domain || ''
                                });
                            }}
                            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            Clear Form
                        </button>
                        <button
                            type="submit"
                            disabled={submitting || members.length === 0}
                            className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                        >
                            {submitting ? (
                                <>
                                    <Spinner size="sm" />
                                    <span>Creating...</span>
                                </>
                            ) : (
                                <span>Create Task</span>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateTaskForm;
