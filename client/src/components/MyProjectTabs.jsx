// MyProjectTabs.jsx
import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import CreateTaskModal from './CreateTaskModal';
import DeleteTaskModal from './DeleteTaskModal';
import EditTaskModal from './EditTaskModal';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function MyProjectTabs({
  activeTab,
  setActiveTab,
  teamMembers,
  project,
  ownerName,
  onTaskCreated
}) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // Modal state variables
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [taskToEdit, setTaskToEdit] = useState(null);

  // Filter state for tasks
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamMemberFilter, setTeamMemberFilter] = useState('');

  // Fetch tasks for the current project
  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5200/api/tasks/post/${project.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Fetched tasks:', response.data.data);
        setTasks(response.data.data);
      } catch (err) {
        console.error('Error fetching tasks:', err);
      } finally {
        setLoadingTasks(false);
      }
    };
    if (project?.id) {
      fetchTasks();
    }
  }, [project, token]);

  // Filter tasks based on name, status, and assigned team member
  const filteredTasks = tasks.filter(task => {
    const matchesName = task.name
      .toLowerCase()
      .includes(taskFilter.toLowerCase());
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    const matchesMember = teamMemberFilter
      ? task.assignedTo && task.assignedTo.id === teamMemberFilter
      : true;
    return matchesName && matchesStatus && matchesMember;
  });

  // Handler for deleting a task with confirmation
  const handleDeleteTask = async taskId => {
    try {
      await axios.delete(`http://localhost:5200/api/tasks/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setShowDeleteModal(false);
      alert('Task deleted successfully!');
    } catch (error) {
      console.error('Error deleting task:', error);
      alert('Failed to delete task.');
    }
  };

  // Handler for updating a task (called from EditTaskModal)
  const handleUpdateTask = updatedTask => {
    setTasks(prev =>
      prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
    setShowEditModal(false);
    alert('Task updated successfully!');
  };

  // Callback when a new task is created from the CreateTaskModal
  const handleTaskCreated = newTask => {
    setTasks(prev => [...prev, newTask]);
    if (onTaskCreated) onTaskCreated(newTask);
    alert('Task created successfully!');
  };

  return (
    <>
      {/* Tabs */}
      <div className='mb-4 border-b'>
        <ul className='flex space-x-6'>
          {['Task', 'Team'].map(tab => (
            <li
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`cursor-pointer pb-2 transition-all duration-300 ${
                activeTab === tab
                  ? 'border-b-2 border-blue-500 font-semibold text-gray-800'
                  : 'text-gray-500 hover:border-b-2 hover:border-blue-300'
              }`}
            >
              {tab}
            </li>
          ))}
        </ul>
      </div>

      {activeTab === 'Task' ? (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Task List */}
          <div className='lg:col-span-8 space-y-6'>
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-xl font-semibold mb-3'>Current Tasks</h2>
              {loadingTasks ? (
                <p className='text-gray-600'>Loading tasks...</p>
              ) : filteredTasks.length === 0 ? (
                <p className='text-gray-600'>No tasks match the filter.</p>
              ) : (
                <div className='space-y-2'>
                  {filteredTasks.map(task => (
                    <div
                      key={task.id}
                      className='p-3 bg-gray-50 rounded flex flex-col sm:flex-row sm:items-center sm:justify-between'
                    >
                      <div className='mb-2 sm:mb-0'>
                        <p className='font-medium text-gray-700'>{task.name}</p>
                        <p className='text-xs text-gray-500'>
                          Start: {formatDate(task.startDate)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          End: {formatDate(task.endDate)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Assigned to:{' '}
                          {task.assignedTo
                            ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                            : 'N/A'}
                        </p>
                      </div>
                      <div className='flex space-x-2'>
                        <button
                          onClick={() => {
                            setTaskToEdit(task);
                            setShowEditModal(true);
                          }}
                          className='px-2 py-1 bg-yellow-500 text-white text-xs rounded cursor-pointer'
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => {
                            setTaskToDelete(task);
                            setShowDeleteModal(true);
                          }}
                          className='px-2 py-1 bg-red-600 text-white text-xs rounded cursor-pointer'
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Filter Panel, Create Button, and Additional Info */}
          <div className='lg:col-span-4 space-y-4'>
            {/* Filter Panel & Create New Task Button */}
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-lg font-semibold mb-2'>Filter & Actions</h2>
              <div className='flex flex-col space-y-3'>
                <input
                  type='text'
                  placeholder='Filter by task name'
                  value={taskFilter}
                  onChange={e => setTaskFilter(e.target.value)}
                  className='border rounded p-2'
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='border rounded p-2'
                >
                  <option value=''>All Statuses</option>
                  <option value='BACKLOG'>Backlog</option>
                  <option value='REVIEW'>Review</option>
                  <option value='IN_PROGRESS'>In Progress</option>
                  <option value='FINISHED'>Finished</option>
                </select>
                <select
                  value={teamMemberFilter}
                  onChange={e => setTeamMemberFilter(e.target.value)}
                  className='border rounded p-2'
                >
                  <option value=''>All Team Members</option>
                  {teamMembers &&
                    teamMembers.map(member => (
                      <option key={member.id} value={member.id}>
                        {member.firstName
                          ? `${member.firstName} ${member.lastName}`
                          : member.name || 'No Name'}
                      </option>
                    ))}
                </select>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
                >
                  + Create New Task
                </button>
              </div>
            </div>

            {/* Additional Info Panels */}
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Project Overview</h2>
              <div className='flex items-center mb-2'>
                <img
                  src={project.fileUrl || fallbackLogo}
                  alt='Project'
                  className='w-16 h-16 object-cover rounded mr-4'
                />
                <div>
                  <h3 className='font-bold text-xl'>
                    {project.projectName || 'Untitled Project'}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {project.projectDescription
                      ? project.projectDescription.substring(0, 100) + '...'
                      : 'No description provided.'}
                  </p>
                </div>
              </div>
              <div className='mt-4'>
                <h3 className='font-semibold'>Owner Information</h3>
                <div className='flex items-center mt-2'>
                  <img
                    src={project.user?.imageUrl || fallbackLogo}
                    alt='Owner'
                    className='w-12 h-12 object-cover rounded-full mr-3'
                  />
                  <div>
                    <p className='font-bold'>{ownerName}</p>
                    <p className='text-xs text-gray-500'>
                      {project.user?.jobTitle || 'No job title'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      @{project.user?.username || 'username'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Team Status</h2>
              <p className='text-sm text-gray-600'>
                Active Members: {teamMembers?.length || 0}
              </p>
            </div>
          </div>
        </div>
      ) : (
        // TEAM TAB
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Team Members */}
          <div className='lg:col-span-8 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Team Members</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {teamMembers && teamMembers.length > 0 ? (
                  teamMembers
                    .filter(member => member && member.id)
                    .map(member => (
                      <div
                        key={member.id}
                        className='flex flex-col items-center p-2 bg-gray-50 rounded'
                      >
                        <img
                          src={member.imageUrl || fallbackLogo}
                          alt='Member'
                          className='w-16 h-16 object-cover rounded-full mb-2'
                        />
                        <p className='font-medium'>
                          {member.firstName
                            ? `${member.firstName} ${member.lastName}`
                            : member.name || 'No Name'}
                        </p>
                        <p className='text-xs text-gray-500'>
                          {member.jobTitle || member.role || 'No job title'}
                        </p>
                      </div>
                    ))
                ) : (
                  <p className='text-gray-600'>No team members found.</p>
                )}
              </div>
            </div>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>
                Add New Team Member
              </h2>
              <button className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
                + Add Member
              </button>
            </div>
          </div>
          <div className='lg:col-span-4 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Project Overview</h2>
              <div className='flex items-center mb-2'>
                <img
                  src={project.fileUrl || fallbackLogo}
                  alt='Project'
                  className='w-16 h-16 object-cover rounded mr-4'
                />
                <div>
                  <h3 className='font-bold text-xl'>
                    {project.projectName || 'Untitled Project'}
                  </h3>
                  <p className='text-sm text-gray-600'>
                    {project.projectDescription
                      ? project.projectDescription.substring(0, 100) + '...'
                      : 'No description provided.'}
                  </p>
                </div>
              </div>
              <div className='mt-4'>
                <h3 className='font-semibold'>Owner Information</h3>
                <div className='flex items-center mt-2'>
                  <img
                    src={project.user?.imageUrl || fallbackLogo}
                    alt='Owner'
                    className='w-12 h-12 object-cover rounded-full mr-3'
                  />
                  <div>
                    <p className='font-bold'>{ownerName}</p>
                    <p className='text-xs text-gray-500'>
                      {project.user?.jobTitle || 'No job title'}
                    </p>
                    <p className='text-xs text-gray-500'>
                      @{project.user?.username || 'username'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Team Status</h2>
              <p className='text-sm text-gray-600'>
                Active Members: {teamMembers?.length || 0}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <CreateTaskModal
          onClose={() => setShowCreateModal(false)}
          onTaskCreated={handleTaskCreated}
          teamMembers={teamMembers}
          project={project}
        />
      )}

      {showDeleteModal && taskToDelete && (
        <DeleteTaskModal
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDeleteTask(taskToDelete.id)}
          task={taskToDelete}
        />
      )}

      {showEditModal && taskToEdit && (
        <EditTaskModal
          onClose={() => setShowEditModal(false)}
          onTaskUpdated={handleUpdateTask}
          task={taskToEdit}
          teamMembers={teamMembers}
          project={project}
        />
      )}
    </>
  );
}

MyProjectTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  teamMembers: PropTypes.array.isRequired,
  project: PropTypes.object.isRequired,
  ownerName: PropTypes.string.isRequired,
  onTaskCreated: PropTypes.func
};

export default MyProjectTabs;
