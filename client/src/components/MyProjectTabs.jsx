// MyProjectTabs.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import CreateTaskModal from './CreateTaskModal';

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
  ownerName
}) {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [showModal, setShowModal] = useState(false);

  // Function to fetch tasks for the current project
  const fetchTasks = async () => {
    try {
      const response = await axios.get(
        `http://localhost:5200/api/tasks/post/${project.id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setTasks(response.data.data);
    } catch (err) {
      console.error('Error fetching tasks:', err);
    } finally {
      setLoadingTasks(false);
    }
  };

  useEffect(() => {
    if (project && project.id) {
      fetchTasks();
    }
  }, [project, token]);

  // Callback when a new task is created
  const handleTaskCreated = newTask => {
    setTasks(prev => [...prev, newTask]);
  };

  return (
    <>
      {/* Tabs for Task/Team */}
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
          {/* Left Column: Task List & Button */}
          <div className='lg:col-span-8 space-y-6'>
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-xl font-semibold mb-3'>Current Tasks</h2>
              {loadingTasks ? (
                <p className='text-gray-600'>Loading tasks...</p>
              ) : tasks.length === 0 ? (
                <p className='text-gray-600'>No tasks yet.</p>
              ) : (
                <div className='space-y-2'>
                  {tasks.map(task => (
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
                          Assigned to: {task.assignedTo?.firstName}{' '}
                          {task.assignedTo?.lastName}
                        </p>
                      </div>
                      <div>
                        {task.status === 'FINISHED' && (
                          <span className='px-2 py-1 bg-green-600 text-white text-xs rounded-full'>
                            Finished
                          </span>
                        )}
                        {task.status === 'IN_PROGRESS' && (
                          <span className='px-2 py-1 bg-blue-500 text-white text-xs rounded-full'>
                            In Progress
                          </span>
                        )}
                        {task.status === 'REVIEW' && (
                          <span className='px-2 py-1 bg-yellow-500 text-white text-xs rounded-full'>
                            Review
                          </span>
                        )}
                        {task.status === 'BACKLOG' && (
                          <span className='px-2 py-1 bg-gray-500 text-white text-xs rounded-full'>
                            Backlog
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <button
              onClick={() => setShowModal(true)}
              className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
            >
              + Create New Task
            </button>
          </div>

          {/* Right Column: Additional Info Panels */}
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
              <p className='text-sm text-gray-600'>Active Members: 3</p>
            </div>
          </div>
        </div>
      ) : (
        // TEAM TAB (Hard-coded demo)
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Team Members */}
          <div className='lg:col-span-8 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Team Members</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {teamMembers.map(member => (
                  <div
                    key={member.id}
                    className='flex flex-col items-center p-2 bg-gray-50 rounded'
                  >
                    <img
                      src={fallbackLogo}
                      alt='Member'
                      className='w-16 h-16 object-cover rounded-full mb-2'
                    />
                    <p className='font-medium'>{member.name}</p>
                    <p className='text-xs text-gray-500'>{member.role}</p>
                  </div>
                ))}
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
              <p className='text-sm text-gray-600'>Active Members: 3</p>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <CreateTaskModal
          onClose={() => setShowModal(false)}
          onTaskCreated={newTask => {
            setTasks(prev => [...prev, newTask]);
          }}
          teamMembers={teamMembers}
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
  ownerName: PropTypes.string.isRequired
};

export default MyProjectTabs;
