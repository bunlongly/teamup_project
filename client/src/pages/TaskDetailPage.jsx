// TaskDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function TaskDetailPage() {
  const { id } = useParams(); // Task ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  // Task data and loading state
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);

  // Submissions (multiple links)
  const [submissionLinks, setSubmissionLinks] = useState([{ url: '' }]);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Private comments
  const [privateComment, setPrivateComment] = useState('');
  const [privateComments, setPrivateComments] = useState([]);

  // Fetch task details on mount
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
      } finally {
        setLoading(false);
      }
    };
    fetchTask();
  }, [id, token]);

  // Handlers for submission link fields
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

  // Submit the entire set of links
  const handleSubmitTask = async e => {
    e.preventDefault();
    setErrorMessage('');
    setSubmitMessage('');

    // Check for at least one non-empty link
    if (submissionLinks.every(link => !link.url.trim())) {
      setErrorMessage(
        'Please provide at least one link or remove empty fields.'
      );
      return;
    }

    try {
      // Example POST to /tasks/:id/submit
      await axios.post(
        `http://localhost:5200/api/tasks/${id}/submit`,
        {
          links: submissionLinks.map(link => link.url)
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitMessage('Task submitted successfully!');
    } catch (error) {
      console.error('Error submitting task:', error);
      setErrorMessage('Failed to submit task.');
    }
  };

  // Handle posting a private comment (demo only)
  const handlePostComment = e => {
    e.preventDefault();
    if (!privateComment.trim()) return;

    // For demonstration, we push locally
    const newComment = {
      id: Date.now(),
      text: privateComment,
      date: new Date().toISOString()
    };
    setPrivateComments([...privateComments, newComment]);
    setPrivateComment('');
  };

  if (loading) {
    return <p className='p-4'>Loading task details...</p>;
  }
  if (!task) {
    return <p className='p-4'>Task not found.</p>;
  }

  // If the task has an assigned post, we might want the owner's info:
  const assignedBy = task.post?.user
    ? `${task.post.user.firstName} ${task.post.user.lastName}`
    : 'Owner';

  // Format the updated date if it exists
  let editedInfo = '';
  if (task.updatedAt) {
    const dateStr = new Date(task.updatedAt).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    editedInfo = ` (Edited ${dateStr})`;
  }

  // Helper to render an image if link ends in .png, .jpg, .jpeg, .gif, or .webp
  const isImageLink = link =>
    link && /\.(png|jpe?g|gif|webp)$/i.test(link.trim());

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      {/* Main Layout: Two-column on large screens */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left (Task Info) - spans 2 columns on large */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Task Card */}
          <div className='bg-white rounded-md shadow p-6'>
            <h1 className='text-2xl font-bold mb-1'>
              {task.name || 'Untitled Task'}
            </h1>
            <div className='text-sm text-gray-500 mb-4'>
              Assigned by {assignedBy}
              {editedInfo && <span> &middot; {editedInfo}</span>}
            </div>

            {/* Description */}
            <p className='mb-4 text-gray-700'>
              {task.description || 'No description provided.'}
            </p>

            {/* Attachments or references */}
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
                      className='text-blue-500 underline'
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
                      className='text-blue-500 underline'
                    >
                      {task.link}
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Dates & Status */}
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

          {/* Private comments section */}
          <div className='bg-white rounded-md shadow p-4'>
            <h2 className='text-lg font-semibold mb-2'>Private comments</h2>
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
            {/* Display existing private comments */}
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

        {/* Right Column: "Your work" panel */}
        <div className='space-y-6'>
          <div className='bg-white rounded-md shadow p-4'>
            <h2 className='text-lg font-semibold mb-2'>Your work</h2>
            {/* Example status - "Assigned", "Submitted", etc. */}
            <p className='text-sm text-green-600 mb-4'>Assigned</p>

            {/* Submission form */}
            <form onSubmit={handleSubmitTask} className='space-y-3'>
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

              {errorMessage && (
                <p className='text-red-600 text-sm'>{errorMessage}</p>
              )}
              {submitMessage && (
                <p className='text-green-600 text-sm'>{submitMessage}</p>
              )}

              <button
                type='submit'
                className='mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                Mark as done
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TaskDetailPage;
