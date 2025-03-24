// CreateTaskModal.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useParams } from 'react-router-dom';

const CreateTaskModal = ({ onClose, onTaskCreated, teamMembers }) => {
  const { id } = useParams(); // project ID
  const token = localStorage.getItem('token');

  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [status, setStatus] = useState('REVIEW');
  const [link, setLink] = useState('');
  const [attachment, setAttachment] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async e => {
    e.preventDefault();
    if (!taskName || !startDate || !endDate || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', taskName);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('link', link);
      formData.append('postId', id);
      if (assignedToId) {
        formData.append('assignedToId', assignedToId);
      }
      if (attachment) {
        formData.append('attachment', attachment);
      }
      const response = await axios.post(
        'http://localhost:5200/api/tasks/create',
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        }
      );
      onTaskCreated(response.data.data);
      onClose();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center z-50'>
      {/* Semi-transparent backdrop */}
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      {/* Modal content */}
      <div className='bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4'>Create New Task</h2>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Task Name
            </label>
            <input
              type='text'
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Start Date
            </label>
            <input
              type='date'
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              End Date
            </label>
            <input
              type='date'
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Task Description
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows='4'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            ></textarea>
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Assign To (Select Member)
            </label>
            <select
              value={assignedToId}
              onChange={e => setAssignedToId(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
            >
              <option value=''>-- None --</option>
              {teamMembers &&
                teamMembers.map(member => (
                  <option key={member.id} value={member.id}>
                    {member.firstName} {member.lastName}{' '}
                    {member.jobTitle
                      ? `(${member.jobTitle})`
                      : `(${member.role})`}
                  </option>
                ))}
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Status
            </label>
            <select
              value={status}
              onChange={e => setStatus(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
            >
              <option value='REVIEW'>Review</option>
              <option value='IN_PROGRESS'>In Progress</option>
              <option value='FINISHED'>Finished</option>
              <option value='BACKLOG'>Backlog</option>
            </select>
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Link (Optional)
            </label>
            <input
              type='text'
              value={link}
              onChange={e => setLink(e.target.value)}
              placeholder='Enter a link (e.g., URL to design specs)'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
            />
          </div>
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Attachment (Optional)
            </label>
            <input
              type='file'
              onChange={e => setAttachment(e.target.files[0])}
              className='mt-1 block w-full'
            />
          </div>
          <div className='flex justify-end'>
            <button
              type='button'
              onClick={onClose}
              className='mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              {loading ? 'Creating Task...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

CreateTaskModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onTaskCreated: PropTypes.func.isRequired,
  teamMembers: PropTypes.array.isRequired
};

export default CreateTaskModal;
