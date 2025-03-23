import React from 'react';
import PropTypes from 'prop-types';
import fallbackLogo from '../assets/logo.png';

const formatDate = dateString => {
  if (!dateString) return 'N/A';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

function MyProjectTabs({
  activeTab,
  setActiveTab,
  tasks,
  teamMembers,
  newTaskName,
  setNewTaskName,
  newTaskDueDate,
  setNewTaskDueDate,
  newTaskDescription,
  setNewTaskDescription,
  newTaskAssignedTo,
  setNewTaskAssignedTo,
  newTaskStatus,
  setNewTaskStatus,
  handleAddTask,
  project,
  ownerName
}) {
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

      {/* Tab Content */}
      {activeTab === 'Task' ? (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Task Info */}
          <div className='lg:col-span-8 space-y-6'>
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-xl font-semibold mb-3'>Current Tasks</h2>
              {tasks.length === 0 ? (
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
                          Due: {formatDate(task.dueDate)}
                        </p>
                        <p className='text-xs text-gray-500'>
                          Assigned to: {task.assignedTo}
                        </p>
                      </div>
                      <div>
                        {task.status === 'Finished' && (
                          <span className='px-2 py-1 bg-green-600 text-white text-xs rounded-full'>
                            Finished
                          </span>
                        )}
                        {task.status === 'In Progress' && (
                          <span className='px-2 py-1 bg-blue-500 text-white text-xs rounded-full'>
                            In Progress
                          </span>
                        )}
                        {task.status === 'Pending' && (
                          <span className='px-2 py-1 bg-yellow-500 text-white text-xs rounded-full'>
                            Pending
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Assign a New Task</h2>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Task Name
                </label>
                <input
                  type='text'
                  value={newTaskName}
                  onChange={e => setNewTaskName(e.target.value)}
                  placeholder='Enter task name'
                  className='border rounded w-full p-2 mt-1'
                />
              </div>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Due Date
                </label>
                <input
                  type='date'
                  value={newTaskDueDate}
                  onChange={e => setNewTaskDueDate(e.target.value)}
                  className='border rounded w-full p-2 mt-1'
                />
              </div>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Task Description
                </label>
                <textarea
                  value={newTaskDescription}
                  onChange={e => setNewTaskDescription(e.target.value)}
                  placeholder='Enter task description'
                  className='border rounded w-full p-2 mt-1'
                ></textarea>
              </div>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Assign To
                </label>
                <select
                  value={newTaskAssignedTo}
                  onChange={e => setNewTaskAssignedTo(e.target.value)}
                  className='border rounded w-full p-2 mt-1'
                >
                  <option value=''>-- Select Member --</option>
                  {teamMembers.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.name} ({member.role})
                    </option>
                  ))}
                </select>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Status
                </label>
                <select
                  value={newTaskStatus}
                  onChange={e => setNewTaskStatus(e.target.value)}
                  className='border rounded w-full p-2 mt-1'
                >
                  <option value='Pending'>Pending</option>
                  <option value='In Progress'>In Progress</option>
                  <option value='Finished'>Finished</option>
                </select>
              </div>
              <button
                onClick={handleAddTask}
                className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
              >
                + Add Task
              </button>
            </div>
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
                <div className='flex flex-col items-center p-2 bg-gray-50 rounded'>
                  <img
                    src={fallbackLogo}
                    alt='Member'
                    className='w-16 h-16 object-cover rounded-full mb-2'
                  />
                  <p className='font-medium'>John Doe</p>
                  <p className='text-xs text-gray-500'>Project Manager</p>
                </div>
                <div className='flex flex-col items-center p-2 bg-gray-50 rounded'>
                  <img
                    src={fallbackLogo}
                    alt='Member'
                    className='w-16 h-16 object-cover rounded-full mb-2'
                  />
                  <p className='font-medium'>Jane Smith</p>
                  <p className='text-xs text-gray-500'>Developer</p>
                </div>
                <div className='flex flex-col items-center p-2 bg-gray-50 rounded'>
                  <img
                    src={fallbackLogo}
                    alt='Member'
                    className='w-16 h-16 object-cover rounded-full mb-2'
                  />
                  <p className='font-medium'>Michael Brown</p>
                  <p className='text-xs text-gray-500'>Designer</p>
                </div>
              </div>
            </div>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>
                Add New Team Member
              </h2>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Member Name
                </label>
                <input
                  type='text'
                  placeholder='Enter member name'
                  className='border rounded w-full p-2 mt-1'
                />
              </div>
              <div className='mb-2'>
                <label className='block text-sm font-medium text-gray-700'>
                  Member Role
                </label>
                <input
                  type='text'
                  placeholder='Enter member role'
                  className='border rounded w-full p-2 mt-1'
                />
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700'>
                  Profile Picture URL
                </label>
                <input
                  type='text'
                  placeholder='Enter image URL'
                  className='border rounded w-full p-2 mt-1'
                />
              </div>
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
    </>
  );
}

MyProjectTabs.propTypes = {
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  tasks: PropTypes.array.isRequired,
  teamMembers: PropTypes.array.isRequired,
  newTaskName: PropTypes.string.isRequired,
  setNewTaskName: PropTypes.func.isRequired,
  newTaskDueDate: PropTypes.string.isRequired,
  setNewTaskDueDate: PropTypes.func.isRequired,
  newTaskDescription: PropTypes.string.isRequired,
  setNewTaskDescription: PropTypes.func.isRequired,
  newTaskAssignedTo: PropTypes.string.isRequired,
  setNewTaskAssignedTo: PropTypes.func.isRequired,
  newTaskStatus: PropTypes.string.isRequired,
  setNewTaskStatus: PropTypes.func.isRequired,
  handleAddTask: PropTypes.func.isRequired,
  project: PropTypes.object.isRequired,
  ownerName: PropTypes.string.isRequired
};

export default MyProjectTabs;
