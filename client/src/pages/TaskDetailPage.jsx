// TaskDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import PreviewSubmissionModal from '../components/PreviewSubmissionModal';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const isImageLink = link =>
  link && /\.(png|jpe?g|gif|webp)$/i.test(link.trim());

const isImageAttachment = fileUrl =>
  fileUrl && /\.(png|jpe?g|gif|webp)$/i.test(fileUrl.trim());

/**
 * Helper to parse submission links.
 */
const getSubmissionLinks = submission => {
  if (submission && submission.links) {
    if (typeof submission.links === 'string') {
      try {
        const parsed = JSON.parse(submission.links);
        console.log('Parsed submission links:', parsed);
        return parsed;
      } catch (error) {
        console.error('Error parsing submission links:', error);
        return [];
      }
    }
    return submission.links;
  }
  return [];
};

function TaskDetailPage() {
  const { id } = useParams(); // Task ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Task detail state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  // Submission form state (for team members)
  const [submissionLinks, setSubmissionLinks] = useState([{ url: '' }]);
  const [submissionComment, setSubmissionComment] = useState('');
  const [submissionAttachment, setSubmissionAttachment] = useState(null);
  const [reportReason, setReportReason] = useState('');
  const [showReportField, setShowReportField] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  // Submission result state
  // For team members: a single submission object
  // For owner: an array of submissions
  const [submissionResult, setSubmissionResult] = useState(null);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Preview modal state
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [submissionPreviewData, setSubmissionPreviewData] = useState({});


  // For owners: tab state ("details" or "submissions")
  const [viewTab, setViewTab] = useState('details');

  // Determine if current user is the owner of the task’s post
  const [isOwner, setIsOwner] = useState(false);
  useEffect(() => {
    if (task && task.post && task.post.user) {
      const currentUserId = localStorage.getItem('userId');
      setIsOwner(String(currentUserId) === String(task.post.user.id));
    }
  }, [task]);

  // Fetch task details
  const fetchTaskDetails = async () => {
    try {
      const res = await axios.get(`http://localhost:5200/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched task details:', res.data.data);
      setTask(res.data.data);
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

  useEffect(() => {
    fetchTaskDetails();
  }, [id, token]);

  // Fetch submission data
  useEffect(() => {
    const fetchSubmissionData = async () => {
      try {
        if (isOwner) {
          // For owner: fetch all submissions for this task
          const res = await axios.get(
            `http://localhost:5200/api/tasks/${id}/submissions`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Fetched submissions (owner):', res.data.data);
          setSubmissionResult(res.data.data); // expect an array
          setHasSubmitted(res.data.data && res.data.data.length > 0);
        } else {
          // For team member: fetch their own submission
          const res = await axios.get(
            `http://localhost:5200/api/tasks/${id}/submission`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          console.log('Fetched submission (member):', res.data.data);
          setSubmissionResult(res.data.data); // expect a single object
          setHasSubmitted(true);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          setSubmissionResult(null);
          setHasSubmitted(false);
        } else {
          console.error('Error fetching submission:', error);
        }
      }
    };
    if (task) {
      fetchSubmissionData();
    }
  }, [task, id, token, isOwner]);

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

  // Show preview modal for submission confirmation
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
    console.log('Preview Data:', previewData);
    setSubmissionPreviewData(previewData);
    setShowPreviewModal(true);
  };

  // Confirm submission from preview modal
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
      await axios.post(
        `http://localhost:5200/api/tasks/${id}/submit`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      setSubmitMessage('Task submitted successfully!');
      setHasSubmitted(true);
      // Re-fetch task details to update the status from the backend
      await fetchTaskDetails();
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrorMessage('Failed to submit task.');
    }
  };


  if (loading) return <p className='p-4'>Loading task details...</p>;
  if (errorMessage)
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

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      {/* For owners: tabs to switch between "Details" and "Submissions". For team members, only show details. */}
      {isOwner && (
        <div className='mb-4 border-b'>
          <ul className='flex space-x-6'>
            <li
              onClick={() => setViewTab('details')}
              className={`cursor-pointer pb-2 transition-all duration-300 ${
                viewTab === 'details'
                  ? 'border-b-2 border-blue-500 font-semibold text-gray-800'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-300'
              }`}
            >
              Details
            </li>
            <li
              onClick={() => setViewTab('submissions')}
              className={`cursor-pointer pb-2 transition-all duration-300 ${
                viewTab === 'submissions'
                  ? 'border-b-2 border-blue-500 font-semibold text-gray-800'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-300'
              }`}
            >
              Submissions
            </li>
          </ul>
        </div>
      )}

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
                  {formatDate(task.startDate)}
                </p>
              )}
              {task.endDate && (
                <p>
                  <span className='font-semibold'>End Date:</span>{' '}
                  {formatDate(task.endDate)}
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

        
        </div>

        {/* Right Column: Submission Panel */}
        <div className='lg:col-span-1 space-y-6'>
          {isOwner ? (
            // Owner's view: show tabs for "Details" and "Submissions"
            viewTab === 'submissions' ? (
              <div className='bg-white rounded-md shadow p-4'>
                <h2 className='text-lg font-semibold mb-2'>Team Submissions</h2>
                {submissionResult &&
                Array.isArray(submissionResult) &&
                submissionResult.length > 0 ? (
                  submissionResult.map(submission => (
                    <div
                      key={submission.id}
                      className='mb-4 border p-4 rounded'
                    >
                      <p className='text-sm text-gray-600 mb-1'>
                        Submitted at:{' '}
                        {submission.createdAt
                          ? new Date(submission.createdAt).toLocaleString()
                          : 'N/A'}
                      </p>
                      {getSubmissionLinks(submission).length > 0 && (
                        <div className='mb-1'>
                          <h3 className='font-semibold'>Links:</h3>
                          <ul className='list-disc list-inside'>
                            {getSubmissionLinks(submission).map((link, idx) => (
                              <li key={idx} className='text-blue-600 break-all'>
                                {link}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      <div className='mb-1'>
                        <h3 className='font-semibold'>Comment:</h3>
                        <p>{submission.comment || 'No comment provided.'}</p>
                      </div>
                      {submission.attachment && (
                        <div className='mb-1'>
                          <h3 className='font-semibold'>Attachment:</h3>
                          {isImageAttachment(submission.attachment) ? (
                            <img
                              src={submission.attachment}
                              alt='Submitted Attachment'
                              className='w-full max-w-md border rounded mt-1'
                            />
                          ) : (
                            <a
                              href={submission.attachment}
                              target='_blank'
                              rel='noreferrer'
                              className='text-blue-500 underline break-all'
                            >
                              {submission.attachment}
                            </a>
                          )}
                        </div>
                      )}
                      {submission.reportReason && (
                        <div>
                          <h3 className='font-semibold text-red-600'>
                            Report Reason:
                          </h3>
                          <p>{submission.reportReason}</p>
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className='text-sm text-gray-600'>No submissions yet.</p>
                )}
              </div>
            ) : (
              // For owners, when "Details" tab is active, show nothing on the right column.
              <div></div>
            )
          ) : (
            // For team members: show their own submission panel
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Your Submission</h2>
              {hasSubmitted && submissionResult ? (
                <>
                  <p className='text-sm text-gray-600 mb-2'>
                    Submitted at:{' '}
                    {submissionResult.createdAt
                      ? new Date(submissionResult.createdAt).toLocaleString()
                      : 'N/A'}
                  </p>
                  {getSubmissionLinks(submissionResult).length > 0 && (
                    <div className='mb-1'>
                      <h3 className='font-semibold'>Links:</h3>
                      <ul className='list-disc list-inside'>
                        {getSubmissionLinks(submissionResult).map(
                          (link, idx) => (
                            <li key={idx} className='text-blue-600 break-all'>
                              {link}
                            </li>
                          )
                        )}
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
                      <h3 className='font-semibold text-red-600'>
                        Report Reason:
                      </h3>
                      <p>{submissionResult.reportReason}</p>
                    </div>
                  )}
                </>
              ) : (
                <p className='text-green-700 font-semibold'>
                  You have not submitted for this task.
                </p>
              )}
            </div>
          )}

          {/* For team members who have not submitted, show the submission form */}
          {!isOwner && !hasSubmitted && (
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Submit Your Work</h2>
              <p className='text-sm text-green-600 mb-4'>Assigned</p>
              <form onSubmit={handlePreviewSubmit} className='space-y-4'>
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
            </div>
          )}
        </div>
      </div>

      {/* Preview Submission Modal */}
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
