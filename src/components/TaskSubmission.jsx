import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, addDoc, db } from '../lib/firebase';
import Spinner from './Spinner';

const TaskSubmission = ({ task, onClose, onSubmitted }) => {
    const { userProfile } = useAuth();
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        description: '',
        comments: '',
        attachments: []
    });

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const files = Array.from(e.target.files);
        setFormData(prev => ({
            ...prev,
            attachments: files
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.description.trim()) {
            alert('Please provide a description of your work');
            return;
        }

        setSubmitting(true);
        try {
            const submissionData = {
                taskId: task.id,
                taskTitle: task.title,
                description: formData.description.trim(),
                comments: formData.comments.trim(),
                submittedBy: userProfile.uid,
                submittedByName: userProfile.name,
                domain: userProfile.domain,
                status: 'pending',
                submittedAt: new Date(),
                attachments: formData.attachments.map(file => ({
                    name: file.name,
                    size: file.size,
                    type: file.type
                    // In a real app, you'd upload files to storage and get URLs
                }))
            };

            await addDoc(collection(db, 'submissions'), submissionData);
            
            // Update task status to submitted
            // await updateDoc(doc(db, 'tasks', task.id), {
            //     status: 'submitted',
            //     updatedAt: new Date()
            // });
            
            alert('Task submitted successfully!');
            onSubmitted();
            onClose();
        } catch (error) {
            console.error('Error submitting task:', error);
            alert('Error submitting task. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-900">Submit Task</h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>

                    <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-2">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                                Work Description *
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={4}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Describe the work you completed..."
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="comments" className="block text-sm font-medium text-gray-700 mb-2">
                                Additional Comments
                            </label>
                            <textarea
                                id="comments"
                                name="comments"
                                value={formData.comments}
                                onChange={handleInputChange}
                                rows={3}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Any additional comments or notes..."
                            />
                        </div>

                        <div>
                            <label htmlFor="attachments" className="block text-sm font-medium text-gray-700 mb-2">
                                Attachments
                            </label>
                            <input
                                type="file"
                                id="attachments"
                                multiple
                                onChange={handleFileChange}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                You can select multiple files. Supported formats: PDF, DOC, DOCX, images, etc.
                            </p>
                            {formData.attachments.length > 0 && (
                                <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700 mb-1">Selected files:</p>
                                    <ul className="text-sm text-gray-600">
                                        {formData.attachments.map((file, index) => (
                                            <li key={index}>{file.name} ({(file.size / 1024).toFixed(1)} KB)</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>

                        <div className="flex justify-end space-x-4 pt-4">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={submitting}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                            >
                                {submitting ? (
                                    <>
                                        <Spinner size="sm" />
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <span>Submit Task</span>
                                )}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default TaskSubmission; 