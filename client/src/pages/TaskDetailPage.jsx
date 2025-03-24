// TaskDetailPage.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

const TaskDetailPage = () => {
  const { id } = useParams(); // task ID from URL
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState({
    comments: ''
  });
  const [submitMessage, setSubmitMessage] = useState('');

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

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      const response = await axios.post(
        `http://localhost:5200/api/tasks/${id}/submit`,
        submission,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSubmitMessage('Task submitted successfully!');
    } catch (error) {
      console.error('Error submitting task:', error);
      setSubmitMessage('Failed to submit task.');
    }
  };

  if (loading) return <p>Loading task details...</p>;
  if (!task) return <p>Task not found.</p>;

  return (
    <div className='container mx-auto p-4'>
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      <div className='bg-white rounded-md shadow p-6'>
        <h1 className='text-2xl font-bold mb-4'>Task Detail</h1>
        <div className='mb-4'>
          <p>
            <strong>Name:</strong> {task.name}
          </p>
          <p>
            <strong>Description:</strong> {task.description}
          </p>
          <p>
            <strong>Status:</strong> {task.status}
          </p>
          <p>
            <strong>Start Date:</strong>{' '}
            {new Date(task.startDate).toLocaleDateString()}
          </p>
          <p>
            <strong>End Date:</strong>{' '}
            {new Date(task.endDate).toLocaleDateString()}
          </p>
          <p>
            <strong>Assigned To:</strong>{' '}
            {task.assignedTo
              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
              : 'Unassigned'}
          </p>
          {task.link && (
            <p>
              <strong>Link:</strong>{' '}
              <a href={task.link} target='_blank' rel='noreferrer'>
                {task.link}
              </a>
            </p>
          )}
          {task.attachment && (
            <p>
              <strong>Attachment:</strong>{' '}
              <a href={task.attachment} target='_blank' rel='noreferrer'>
                View Attachment
              </a>
            </p>
          )}
        </div>

        {/* Submission Form (for members) */}
        <div className='mt-8'>
          <h2 className='text-xl font-semibold mb-2'>Submit Your Work</h2>
          <form onSubmit={handleSubmit}>
            <div className='mb-4'>
              <label className='block text-sm font-medium'>Comments</label>
              <textarea
                value={submission.comments}
                onChange={e =>
                  setSubmission({ ...submission, comments: e.target.value })
                }
                rows='4'
                className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
                placeholder='Enter your submission comments here...'
              ></textarea>
            </div>
            <button
              type='submit'
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              Submit Task
            </button>
          </form>
          {submitMessage && (
            <p className='mt-2 text-green-600 font-semibold'>{submitMessage}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default TaskDetailPage;
