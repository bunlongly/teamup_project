import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { useParams } from 'react-router-dom';

// Helper to format a date string for display
const formatDateDisplay = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const CreateTaskModal = ({ onClose, onTaskCreated, teamMembers, project }) => {
  const { id } = useParams(); // project ID from URL (should match project.id)
  const token = localStorage.getItem('token');

  // Form fields
  const [taskName, setTaskName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [description, setDescription] = useState('');
  const [assignedToId, setAssignedToId] = useState('');
  const [status, setStatus] = useState('REVIEW');
  const [link, setLink] = useState('');
  const [attachment, setAttachment] = useState(null);

  // UI state
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [daysBetween, setDaysBetween] = useState('');

  // Immediate validation for start date
  const handleStartDateChange = value => {
    setStartDate(value);
    if (project && project.startDate) {
      const projectStart = new Date(project.startDate);
      const userStart = new Date(value);
      if (userStart < projectStart) {
        setError(
          `Task start date cannot be before project start date (${formatDateDisplay(
            project.startDate
          )}).`
        );
      } else {
        // Clear only start-date related error if the date becomes valid
        if (error.includes('Task start date')) {
          setError('');
        }
      }
    }
  };

  // Immediate validation for end date
  const handleEndDateChange = value => {
    setEndDate(value);
    if (project && project.endDate) {
      const projectEnd = new Date(project.endDate);
      const userEnd = new Date(value);
      if (userEnd > projectEnd) {
        setError(
          `Task end date cannot be after project end date (${formatDateDisplay(
            project.endDate
          )}).`
        );
      } else {
        if (error.includes('Task end date')) {
          setError('');
        }
      }
    }
  };

  // Compute task duration if both dates are valid and no date error is present
  useEffect(() => {
    if (startDate && endDate && !error) {
      const s = new Date(startDate);
      const e = new Date(endDate);
      if (e >= s) {
        const diffInMs = e - s;
        const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24)) + 1;
        setDaysBetween(`${diffInDays} day${diffInDays > 1 ? 's' : ''}`);
      } else {
        setDaysBetween('');
      }
    } else {
      setDaysBetween('');
    }
  }, [startDate, endDate, error]);

  // Compute assignable members.
  // If the owner (project.user) isn't already in teamMembers, add them at the beginning.
  let assignableMembers = teamMembers ? [...teamMembers] : [];
  if (project && project.user) {
    const ownerId = project.user.id;
    if (!assignableMembers.some(member => member.id === ownerId)) {
      assignableMembers.unshift(project.user);
    }
  }

  // Form submit handler
  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Check required fields
    if (!taskName || !startDate || !endDate || !description) {
      setError('Please fill in all required fields.');
      return;
    }
    // Final check on date validity
    if (
      project &&
      project.startDate &&
      new Date(startDate) < new Date(project.startDate)
    ) {
      setError(
        `Task start date cannot be before project start date (${formatDateDisplay(
          project.startDate
        )}).`
      );
      return;
    }
    if (
      project &&
      project.endDate &&
      new Date(endDate) > new Date(project.endDate)
    ) {
      setError(
        `Task end date cannot be after project end date (${formatDateDisplay(
          project.endDate
        )}).`
      );
      return;
    }

    setLoading(true);
    try {
      // Prepare payload (using FormData for file support)
      const formData = new FormData();
      formData.append('name', taskName);
      formData.append('startDate', startDate);
      formData.append('endDate', endDate);
      formData.append('description', description);
      formData.append('status', status);
      formData.append('link', link);
      formData.append('postId', id); // project ID from URL
      if (assignedToId) {
        formData.append('assignedToId', assignedToId);
      }
      if (attachment) {
        formData.append('attachment', attachment);
      }

      // Send POST request to create the task
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
      {/* Backdrop */}
      <div
        className='absolute inset-0 bg-black opacity-50'
        onClick={onClose}
      ></div>
      {/* Modal Content */}
      <div className='bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md'>
        <h2 className='text-xl font-bold mb-4'>Create New Task</h2>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Task Name */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Task Name <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              value={taskName}
              onChange={e => setTaskName(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          {/* Start Date */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Start Date <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              value={startDate}
              onChange={e => handleStartDateChange(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          {/* End Date */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              End Date <span className='text-red-500'>*</span>
            </label>
            <input
              type='date'
              value={endDate}
              onChange={e => handleEndDateChange(e.target.value)}
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            />
          </div>
          {/* Display Task Duration */}
          {daysBetween && (
            <p className='text-gray-600 text-sm mb-4'>
              Task Duration: {daysBetween}
            </p>
          )}
          {/* Task Description */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Task Description <span className='text-red-500'>*</span>
            </label>
            <textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              rows='4'
              className='mt-1 block w-full rounded-md border-gray-300 shadow-sm'
              required
            ></textarea>
          </div>
          {/* Assign To */}
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
              {assignableMembers.map(member => (
                <option key={member.id} value={member.id}>
                  {member.firstName} {member.lastName}{' '}
                  {member.jobTitle
                    ? `(${member.jobTitle})`
                    : `(${member.role})`}
                </option>
              ))}
            </select>
          </div>
          {/* Status */}
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
          {/* Link (Optional) */}
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
          {/* Attachment (Optional) */}
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
          {/* Buttons */}
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
  teamMembers: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired
};

export default CreateTaskModal;
