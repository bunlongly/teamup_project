import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import PreviewSubmissionModal from '../components/PreviewSubmissionModal';

function TaskDetailPage() {
  const { id } = useParams(); // Task ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Task data and loading state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Submission form state
  const [submissionLinks, setSubmissionLinks] = useState([{ url: '' }]);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionAttachment, setSubmissionAttachment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportField, setShowReportField] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Track submission result from the server
  const [submissionResult, setSubmissionResult] = useState(null);
  // Track whether user has already submitted (local flag)
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Modal state for preview submission
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submissionPreviewData, setSubmissionPreviewData] = useState({});

  // Private comments (demo only)
  const [privateComment, setPrivateComment] = useState('');
  const [privateComments, setPrivateComments] = useState([]);

  // Fetch task details
  useEffect(() => {
    const fetchTask = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5200/api/tasks/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTask(response.data.data);
      } catch (error) {
        console.error('Error fetching task details:', error);
        if (error.response && error.response.status === 404) {
          setErrorMessage('You are not authorized to view this task.');
        } else {
          setErrorMessage('An error occurred while fetching task details.');
        }
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  // Fetch existing submission for the current task (if any)
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        const res = await axios.get(
          `http://localhost:5200/api/tasks/${id}/submission`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSubmissionResult(res.data.data);
        setHasSubmitted(true);
      } catch (error) {
        // If 404, then no submission exists (which is fine)
        if (error.response && error.response.status === 404) {
          setSubmissionResult(null);
          setHasSubmitted(false);
        } else {
          console.error('Error fetching submission:', error);
        }
      }
    };
    fetchSubmission();
  }, [id, token]);

  // Handlers for submission links
  const handleAddLinkField = () => {
    setSubmissionLinks(prev => [...prev, { url: '' }]);
  };

  const handleRemoveLinkField = index => {
    setSubmissionLinks(prev => prev.filter((_, i) => i !== index));
  };

  const handleLinkChange = (index, value) => {
    setSubmissionLinks(prev => {
      const updated = [...prev];
      updated[index].url = value;
      return updated;
    });
  };

  // Show preview before confirming submission
  const handlePreviewSubmit = e => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitMessage('');

    if (submissionLinks.every(link => !link.url.trim())) {
      setErrorMessage('Please provide at least one submission link.');
      return;
    }

    const now = new Date().toLocaleString();
    const previewData = {
      links: submissionLinks.map(link => link.url),
      comment: submissionComment,
      attachment: submissionAttachment,
      reportReason,
      timestamp: now
    };
    setSubmissionPreviewData(previewData);
    setShowPreviewModal(true);
  };

  // Confirm submission from the preview modal
  const handleConfirmSubmission = async () => {
    setShowPreviewModal(false);
    const formData = new FormData();
    formData.append('taskId', id);
    formData.append(
      'links',
      JSON.stringify(submissionLinks.map(link => link.url))
    );
    formData.append('comment', submissionComment);
    formData.append('reportReason', reportReason);
    if (submissionAttachment) {
      formData.append('attachment', submissionAttachment);
    }

    try {
      const res = await axios.post(
        `http://localhost:5200/api/tasks/${id}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSubmissionResult(res.data.data);
      setSubmitMessage('Task submitted successfully!');
      setHasSubmitted(true);
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrorMessage('Failed to submit task.');
    }
  };

  // Private comments (demo only)
  const handlePostComment = e => {
    e.preventDefault();
    if (!privateComment.trim()) return;
    const newComment = {
      id: Date.now(),
      text: privateComment,
      date: new Date().toISOString()
    };
    setPrivateComments([...privateComments, newComment]);
    setPrivateComment('');
  };

  if (loading) return <p className='p-4'>Loading task details...</p>;
  if (errorMessage) {
    return (
      <div className='p-4'>
        <p className='text-red-600'>{errorMessage}</p>
        <button
          onClick={() => navigate(-1)}
          className='mt-4 px-4 py-2 bg-blue-500 text-white rounded'
        >
          Go Back
        </button>
      </div>
    );
  }
  if (!task) return <p className='p-4'>Task not found.</p>;

  const assignedBy = task.post?.user
    ? `${task.post.user.firstName} ${task.post.user.lastName}`
    : 'Owner';

  let editedInfo = '';
  if (task.updatedAt) {
    const dateStr = new Date(task.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    editedInfo = ` (Edited ${dateStr})`;
  }

  // Helper: check if a link is an image
  const isImageLink = link =>
    link && /\.(png|jpe?g|gif|webp)$/i.test(link.trim());

  // Helper for submission attachment if it's a URL
  const isImageAttachment = fileUrl =>
    fileUrl && /\.(png|jpe?g|gif|webp)$/i.test(fileUrl.trim());

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column: Task Details & Private Comments */}
        <div className='lg:col-span-2 space-y-6'>
          <div className='bg-white rounded-md shadow p-6'>
            <h1 className='text-2xl font-bold mb-1'>
              {task.name || 'Untitled Task'}
            </h1>
            <div className='text-sm text-gray-500 mb-4'>
              Assigned by {assignedBy}{' '}
              {editedInfo && <span>&middot; {editedInfo}</span>}
            </div>
            <p className='mb-4 text-gray-700'>
              {task.description || 'No description provided.'}
            </p>
            {task.attachment && (
              <div className='mb-4'>
                <p className='font-semibold text-gray-700'>Attachment:</p>
                {isImageLink(task.attachment) ? (
                  <img
                    src={task.attachment}
                    alt='Attachment'
                    className='mt-2 max-w-sm border rounded'
                  />
                ) : (
                  <div className='flex items-center space-x-2 mt-2'>
                    <img src={fallbackLogo} alt='Link' className='w-8 h-8' />
                    <a
                      href={task.attachment}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-500 underline break-all'
                    >
                      {task.attachment}
                    </a>
                  </div>
                )}
              </div>
            )}
            {task.link && (
              <div className='mb-4'>
                <p className='font-semibold text-gray-700'>Reference Link:</p>
                {isImageLink(task.link) ? (
                  <img
                    src={task.link}
                    alt='Reference'
                    className='mt-2 max-w-sm border rounded'
                  />
                ) : (
                  <div className='flex items-center space-x-2 mt-2'>
                    <img src={fallbackLogo} alt='Link' className='w-8 h-8' />
                    <a
                      href={task.link}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-500 underline break-all'
                    >
                      {task.link}
                    </a>
                  </div>
                )}
              </div>
            )}
            <div className='text-sm text-gray-600 space-y-1'>
              {task.startDate && (
                <p>
                  <span className='font-semibold'>Start Date:</span>{' '}
                  {new Date(task.startDate).toLocaleDateString()}
                </p>
              )}
              {task.endDate && (
                <p>
                  <span className='font-semibold'>End Date:</span>{' '}
                  {new Date(task.endDate).toLocaleDateString()}
                </p>
              )}
              {task.status && (
                <p>
                  <span className='font-semibold'>Status:</span> {task.status}
                </p>
              )}
              {task.assignedTo && (
                <p>
                  <span className='font-semibold'>Assigned To:</span>{' '}
                  {`${task.assignedTo.firstName} ${task.assignedTo.lastName}`}
                </p>
              )}
            </div>
          </div>

          {/* Submission Result Panel (Full Width) */}
          {submissionResult && (
            <div className='bg-white rounded-md shadow p-6 w-full'>
              <h2 className='text-xl font-bold mb-2'>Your Submission</h2>
              <p className='text-sm text-gray-600 mb-2'>
                Submitted at:{' '}
                {new Date(submissionResult.createdAt).toLocaleString()}
              </p>
              {submissionResult.links &&
                Array.isArray(submissionResult.links) && (
                  <div className='mb-2'>
                    <h3 className='font-semibold'>Links:</h3>
                    <ul className='list-disc list-inside'>
                      {submissionResult.links.map((link, idx) => (
                        <li key={idx} className='text-blue-600 break-all'>
                          {link}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              <div className='mb-2'>
                <h3 className='font-semibold'>Comment:</h3>
                <p>{submissionResult.comment || 'No comment provided.'}</p>
              </div>
              {submissionResult.attachment && (
                <div className='mb-2'>
                  <h3 className='font-semibold'>Attachment:</h3>
                  {isImageAttachment(submissionResult.attachment) ? (
                    <img
                      src={submissionResult.attachment}
                      alt='Submitted Attachment'
                      className='w-full max-w-md border rounded mt-1'
                    />
                  ) : (
                    <a
                      href={submissionResult.attachment}
                      target='_blank'
                      rel='noreferrer'
                      className='text-blue-500 underline break-all'
                    >
                      {submissionResult.attachment}
                    </a>
                  )}
                </div>
              )}
              {submissionResult.reportReason && (
                <div>
                  <h3 className='font-semibold text-red-600'>Report Reason:</h3>
                  <p>{submissionResult.reportReason}</p>
                </div>
              )}
            </div>
          )}

          {/* Private Comments Section (rendered below submission result) */}
          <div className='bg-white rounded-md shadow p-4'>
            <h2 className='text-lg font-semibold mb-2'>Private Comments</h2>
            <form onSubmit={handlePostComment} className='flex space-x-2 mb-4'>
              <input
                type='text'
                value={privateComment}
                onChange={e => setPrivateComment(e.target.value)}
                placeholder='Add a comment...'
                className='flex-1 border rounded p-2'
              />
              <button
                type='submit'
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Post
              </button>
            </form>
            <div className='space-y-2'>
              {privateComments.map(c => (
                <div key={c.id} className='bg-gray-50 p-2 rounded'>
                  <p className='text-sm text-gray-800'>{c.text}</p>
                  <p className='text-xs text-gray-500'>
                    {new Date(c.date).toLocaleString()}
                  </p>
                </div>
              ))}
              {privateComments.length === 0 && (
                <p className='text-gray-500 text-sm'>No comments yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Submission Panel */}
        <div className='space-y-6'>
          <div className='bg-white rounded-md shadow p-4'>
            <h2 className='text-lg font-semibold mb-2'>Submit Your Work</h2>
            <p className='text-sm text-green-600 mb-4'>Assigned</p>

            {hasSubmitted ? (
              <p className='text-green-700 font-semibold'>
                You have already submitted for this task.
              </p>
            ) : (
              <form onSubmit={handlePreviewSubmit} className='space-y-4'>
                {/* Submission Links */}
                {submissionLinks.map((linkObj, index) => (
                  <div key={index} className='flex items-center space-x-2'>
                    <input
                      type='text'
                      value={linkObj.url}
                      onChange={e => handleLinkChange(index, e.target.value)}
                      placeholder='Submission link (GitHub, Figma, etc.)'
                      className='flex-1 border rounded p-2'
                    />
                    {index === 0 ? (
                      <button
                        type='button'
                        onClick={handleAddLinkField}
                        className='text-sm text-blue-600 underline'
                      >
                        + Add
                      </button>
                    ) : (
                      <button
                        type='button'
                        onClick={() => handleRemoveLinkField(index)}
                        className='text-sm text-red-600 underline'
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                {/* File Attachment */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Upload Attachment (Optional)
                  </label>
                  <input
                    type='file'
                    onChange={e => setSubmissionAttachment(e.target.files[0])}
                    className='mt-1 block w-full'
                  />
                </div>
                {/* Submission Comment */}
                <div>
                  <label className='block text-sm font-medium text-gray-700'>
                    Submission Comment (Optional)
                  </label>
                  <textarea
                    value={submissionComment}
                    onChange={e => setSubmissionComment(e.target.value)}
                    rows={3}
                    placeholder='Enter your comments here...'
                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
                  ></textarea>
                </div>
                {/* Report Submission Toggle & Reason */}
                <div>
                  <button
                    type='button'
                    onClick={() => setShowReportField(!showReportField)}
                    className='text-sm text-red-600 underline'
                  >
                    {showReportField ? 'Cancel Report' : 'Report Submission'}
                  </button>
                  {showReportField && (
                    <div className='mt-2'>
                      <label className='block text-sm font-medium text-gray-700'>
                        Report Reason (Optional)
                      </label>
                      <textarea
                        value={reportReason}
                        onChange={e => setReportReason(e.target.value)}
                        rows={2}
                        placeholder='Why are you reporting this submission?'
                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
                      ></textarea>
                    </div>
                  )}
                </div>
                {errorMessage && (
                  <p className='text-red-600 text-sm'>{errorMessage}</p>
                )}
                {submitMessage && (
                  <p className='text-green-600 text-sm'>{submitMessage}</p>
                )}
                <button
                  type='submit'
                  className='mt-4 w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                >
                  Preview Submission
                </button>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreviewModal && (
        <PreviewSubmissionModal
          submissionData={submissionPreviewData}
          onConfirm={handleConfirmSubmission}
          onCancel={() => setShowPreviewModal(false)}
        />
      )}
    </div>
  );
}

export default TaskDetailPage;
