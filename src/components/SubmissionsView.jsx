import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { collection, query, where, onSnapshot, doc, updateDoc, db } from '../lib/firebase';
import Spinner from './Spinner';

const SubmissionsView = () => {
    const { userProfile } = useAuth();
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('all');

    useEffect(() => {
        if (!userProfile || userProfile.role !== 'domain-lead') return;

        const submissionsQuery = query(
            collection(db, 'submissions'),
            where('domain', '==', userProfile.domain)
        );

        const unsubscribe = onSnapshot(submissionsQuery, (snapshot) => {
            const submissionsData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setSubmissions(submissionsData);
            setLoading(false);
        }, (error) => {
            console.error('Error fetching submissions:', error);
            setLoading(false);
        });

        return () => unsubscribe();
    }, [userProfile]);

    const handleStatusChange = async (submissionId, newStatus) => {
        try {
            await updateDoc(doc(db, 'submissions', submissionId), {
                status: newStatus,
                reviewedAt: new Date(),
                reviewedBy: userProfile.uid,
                reviewedByName: userProfile.name
            });
        } catch (error) {
            console.error('Error updating submission status:', error);
            alert('Error updating submission status');
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            case 'under-review': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const filteredSubmissions = submissions.filter(submission => {
        switch (filter) {
            case 'pending':
                return submission.status === 'pending';
            case 'approved':
                return submission.status === 'approved';
            case 'rejected':
                return submission.status === 'rejected';
            case 'under-review':
                return submission.status === 'under-review';
            default:
                return true;
        }
    });

    if (!userProfile || userProfile.role !== 'domain-lead') {
        return (
            <div className="text-center p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                <p className="text-gray-600">Only domain leads can access submissions.</p>
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
                    <h2 className="text-2xl font-bold text-gray-900">Task Submissions</h2>
                    <p className="text-gray-600">Review and manage task submissions from your team</p>
                </div>
                
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="all">All Submissions ({submissions.length})</option>
                        <option value="pending">Pending ({submissions.filter(s => s.status === 'pending').length})</option>
                        <option value="under-review">Under Review ({submissions.filter(s => s.status === 'under-review').length})</option>
                        <option value="approved">Approved ({submissions.filter(s => s.status === 'approved').length})</option>
                        <option value="rejected">Rejected ({submissions.filter(s => s.status === 'rejected').length})</option>
                    </select>
                </div>
            </div>

            {filteredSubmissions.length === 0 ? (
                <div className="text-center py-12">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
                    <p className="text-gray-500">
                        {filter === 'all' 
                            ? "No task submissions have been made yet." 
                            : `No submissions with status "${filter}" found.`
                        }
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredSubmissions.map(submission => (
                        <div key={submission.id} className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex-1">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                        {submission.taskTitle || 'Task Submission'}
                                    </h3>
                                    <p className="text-gray-600 text-sm mb-3">
                                        Submitted by: <span className="font-medium">{submission.submittedByName}</span>
                                    </p>
                                </div>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(submission.status)}`}>
                                    {submission.status.replace('-', ' ')}
                                </span>
                            </div>

                            <div className="space-y-3 mb-4">
                                <div>
                                    <h4 className="text-sm font-medium text-gray-700 mb-1">Description:</h4>
                                    <p className="text-sm text-gray-600">{submission.description}</p>
                                </div>

                                {submission.attachments && submission.attachments.length > 0 && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Attachments:</h4>
                                        <div className="space-y-1">
                                            {submission.attachments.map((attachment, index) => (
                                                <a
                                                    key={index}
                                                    href={attachment.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm text-blue-600 hover:text-blue-800 block"
                                                >
                                                    {attachment.name}
                                                </a>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {submission.comments && (
                                    <div>
                                        <h4 className="text-sm font-medium text-gray-700 mb-1">Comments:</h4>
                                        <p className="text-sm text-gray-600">{submission.comments}</p>
                                    </div>
                                )}
                            </div>

                            <div className="text-sm text-gray-500 mb-4">
                                <p><strong>Submitted:</strong> {submission.submittedAt ? new Date(submission.submittedAt).toLocaleDateString() : 'Unknown'}</p>
                                {submission.reviewedAt && (
                                    <p><strong>Reviewed:</strong> {new Date(submission.reviewedAt).toLocaleDateString()}</p>
                                )}
                            </div>

                            {submission.status === 'pending' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleStatusChange(submission.id, 'under-review')}
                                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        Start Review
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(submission.id, 'approved')}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(submission.id, 'rejected')}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}

                            {submission.status === 'under-review' && (
                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleStatusChange(submission.id, 'approved')}
                                        className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
                                    >
                                        Approve
                                    </button>
                                    <button
                                        onClick={() => handleStatusChange(submission.id, 'rejected')}
                                        className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500"
                                    >
                                        Reject
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SubmissionsView;
