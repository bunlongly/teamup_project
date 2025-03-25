// EditTaskModal.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Helper to format date for display
const formatDateDisplay = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const EditTaskModal = ({
  task,
  onClose,
  onTaskUpdated,
  teamMembers,
  project
}) => {
  // Initialize state from the task prop
  const [taskName, setTaskName] = useState(task.name);
  const [startDate, setStartDate] = useState(
    task.startDate ? task.startDate.slice(0, 10) : ''
  );
  const [endDate, setEndDate] = useState(
    task.endDate ? task.endDate.slice(0, 10) : ''
  );
  const [description, setDescription] = useState(task.description);
  const [assignedToId, setAssignedToId] = useState(
    task.assignedTo ? task.assignedTo.id : ''
  );
  const [status, setStatus] = useState(task.status);
  const [link, setLink] = useState(task.link || '');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Validate start date immediately on change
  useEffect(() => {
    if (project && project.startDate && startDate) {
      const projectStart = new Date(project.startDate);
      const newStart = new Date(startDate);
      if (newStart < projectStart) {
        setError(
          `Task start date cannot be before project start date (${formatDateDisplay(
            project.startDate
          )}).`
        );
      } else if (error.includes('Task start date')) {
        setError('');
      }
    }
  }, [startDate, project, error]);

  // Validate end date immediately on change
  useEffect(() => {
    if (project && project.endDate && endDate) {
      const projectEnd = new Date(project.endDate);
      const newEnd = new Date(endDate);
      if (newEnd > projectEnd) {
        setError(
          `Task end date cannot be after project end date (${formatDateDisplay(
            project.endDate
          )}).`
        );
      } else if (error.includes('Task end date')) {
        setError('');
      }
    }
  }, [endDate, project, error]);

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    // Check required fields
    if (!taskName || !startDate || !endDate || !description) {
      setError('Please fill in all required fields.');
      return;
    }

    // Final date validations
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
      const response = await fetch(
        `http://localhost:5200/api/tasks/update/${task.id}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: taskName,
            startDate,
            endDate,
            description,
            status,
            link,
            assignedToId: assignedToId || null
          })
        }
      );
      if (!response.ok) throw new Error('Failed to update task');
      const updatedTask = await response.json();
      onTaskUpdated(updatedTask.data);
      alert('Task updated successfully!');
      onClose();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task.');
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
        <h2 className='text-xl font-bold mb-4'>Edit Task</h2>
        {error && <p className='text-red-500 mb-4'>{error}</p>}
        <form onSubmit={handleSubmit}>
          {/* Task Name */}
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
          {/* Start Date */}
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
          {/* End Date */}
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
          {/* Task Description */}
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
          {/* Assign To */}
          <div className='mb-4'>
            <label className='block text-sm font-medium text-gray-700'>
              Assign To
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
                    {member.firstName
                      ? `${member.firstName} ${member.lastName}`
                      : member.name}
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
              {loading ? 'Updating Task...' : 'Update Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

EditTaskModal.propTypes = {
  task: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onTaskUpdated: PropTypes.func.isRequired,
  teamMembers: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired
};

export default EditTaskModal;
