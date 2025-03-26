// MyProjectTabs.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';
import CreateTaskModal from './CreateTaskModal';
import DeleteTaskModal from './DeleteTaskModal';
import EditTaskModal from './EditTaskModal';
import { FaEdit, FaTrash } from 'react-icons/fa';

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
  onTaskCreated,
  currentUser
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

  // Filter state
  const [taskFilter, setTaskFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [teamMemberFilter, setTeamMemberFilter] = useState('');
  const [displayCount, setDisplayCount] = useState(15);

  // Determine if the current user is the project owner
  const currentUserId = currentUser?.id || currentUser?.userId || '';
  const ownerId = project?.user?.id || '';
  const isOwner =
    currentUserId && ownerId && String(currentUserId) === String(ownerId);

  // Debug logging
  console.log('currentUser:', currentUser);
  console.log('project.user:', project?.user);
  console.log(
    'currentUserId:',
    currentUserId,
    'ownerId:',
    ownerId,
    'isOwner:',
    isOwner
  );

  // Define available tabs (only show "Submitted" for owner)
  const availableTabs = isOwner
    ? ['Task', 'Submitted', 'Team']
    : ['Task', 'Team'];

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

  // Base filter for tasks (by name, status, team member)
  const baseFilteredTasks = tasks.filter(task => {
    const matchesName = task.name
      .toLowerCase()
      .includes(taskFilter.toLowerCase());
    const matchesStatus = statusFilter ? task.status === statusFilter : true;
    let matchesMember = true;
    if (teamMemberFilter) {
      if (teamMemberFilter === 'notAssigned') {
        matchesMember = !task.assignedTo;
      } else {
        matchesMember =
          task.assignedTo && task.assignedTo.id === teamMemberFilter;
      }
    }
    return matchesName && matchesStatus && matchesMember;
  });

  // Further filter tasks based on active tab:
  // - "Task" tab: tasks with no submissions
  // - "Submitted" tab: tasks with one or more submissions
  // - "Team" tab: tasks are not shown (empty list)
  let filteredTasks = [];
  if (activeTab === 'Task') {
    filteredTasks = baseFilteredTasks.filter(
      t => !t.submissions || t.submissions.length === 0
    );
  } else if (activeTab === 'Submitted') {
    filteredTasks = baseFilteredTasks.filter(
      t => t.submissions && t.submissions.length > 0
    );
  } else {
    filteredTasks = [];
  }

  // Limit displayed tasks (for pagination)
  const tasksToDisplay = filteredTasks.slice(0, displayCount);

  // Compute summary counts
  const totalCount = tasks.length;
  const backlogCount = tasks.filter(task => task.status === 'BACKLOG').length;
  const reviewCount = tasks.filter(task => task.status === 'REVIEW').length;
  const inProgressCount = tasks.filter(
    task => task.status === 'IN_PROGRESS'
  ).length;
  const finishedCount = tasks.filter(task => task.status === 'FINISHED').length;

  // Handlers for delete/update
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

  const handleUpdateTask = updatedTask => {
    setTasks(prev =>
      prev.map(task => (task.id === updatedTask.id ? updatedTask : task))
    );
    setShowEditModal(false);
    alert('Task updated successfully!');
  };

  const handleTaskCreated = newTask => {
    setTasks(prev => [...prev, newTask]);
    if (onTaskCreated) onTaskCreated(newTask);
    alert('Task created successfully!');
  };

  // For the TEAM tab: include project owner with team members
  const teamMembersWithOwner =
    project && project.user
      ? [project.user, ...teamMembers.filter(m => m.id !== project.user.id)]
      : teamMembers;

  // For dropdown filters, include the owner as well
  const assignableMembersForFilter =
    project && project.user
      ? [project.user, ...teamMembers.filter(m => m.id !== project.user.id)]
      : teamMembers;

  return (
    <>
      {/* Tabs */}
      <div className='mb-4 border-b'>
        <ul className='flex space-x-6'>
          {availableTabs.map(tab => (
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

      {/* TEAM TAB */}
      {activeTab === 'Team' && (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Team Members */}
          <div className='lg:col-span-8 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Team Members</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {project && project.user && (
                  <>
                    {teamMembersWithOwner.map(member => (
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
                        {member.id === project.user.id && (
                          <p className='text-xs text-blue-600 font-semibold'>
                            Owner
                          </p>
                        )}
                      </div>
                    ))}
                  </>
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
          {/* Right Column: Project Overview & Team Status */}
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

      {/* TASK or SUBMITTED Tabs */}
      {(activeTab === 'Task' || activeTab === 'Submitted') && (
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Task List */}
          <div className='lg:col-span-8 space-y-6'>
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-xl font-semibold mb-3'>
                {activeTab === 'Task' ? 'Current Tasks' : 'Submitted Tasks'}
              </h2>
              {loadingTasks ? (
                <p className='text-gray-600'>Loading tasks...</p>
              ) : filteredTasks.length === 0 ? (
                <p className='text-gray-600'>
                  {activeTab === 'Task'
                    ? 'No tasks match the filter.'
                    : 'No submitted tasks found.'}
                </p>
              ) : (
                <div className='space-y-2'>
                  {tasksToDisplay.map(task => {
                    // Define status colors
                    const statusColors = {
                      BACKLOG: 'bg-yellow-100 text-yellow-800',
                      REVIEW: 'bg-purple-100 text-purple-800',
                      IN_PROGRESS: 'bg-blue-100 text-blue-800',
                      FINISHED: 'bg-green-100 text-green-800'
                    };
                    return (
                      <div
                        key={task.id}
                        className='p-4 bg-white rounded-lg shadow-md flex flex-col sm:flex-row sm:items-center sm:justify-between cursor-pointer transition-transform transform hover:scale-105'
                        onClick={() => navigate(`/task/${task.id}`)}
                      >
                        <div className='mb-2 sm:mb-0'>
                          <p className='font-semibold text-gray-800 text-lg'>
                            {task.name}
                          </p>
                          <div className='text-xs text-gray-500'>
                            <span>Start: {formatDate(task.startDate)}</span> |{' '}
                            <span>End: {formatDate(task.endDate)}</span>
                          </div>
                          <p className='text-sm text-gray-600 mt-1'>
                            Assigned to:{' '}
                            {task.assignedTo
                              ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                              : 'N/A'}
                          </p>
                          <div className='mt-1'>
                            <span
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                statusColors[task.status] ||
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {task.status}
                            </span>
                          </div>
                          {/* In the "Submitted" tab, show submission details if available */}
                          {activeTab === 'Submitted' &&
                            task.submissions &&
                            task.submissions.length > 0 &&
                            task.submissions[0]?.user && (
                              <div className='mt-2 p-2 border-t border-gray-300'>
                                <h3 className='font-semibold text-sm'>
                                  Submission Details:
                                </h3>
                                <p className='text-xs'>
                                  Submitted by:{' '}
                                  {task.submissions[0].user.firstName}{' '}
                                  {task.submissions[0].user.lastName}
                                </p>
                                <p className='text-xs'>
                                  Comment:{' '}
                                  {task.submissions[0].comment || 'No comment'}
                                </p>
                                {task.submissions[0].links && (
                                  <ul className='list-disc list-inside text-xs'>
                                    {(() => {
                                      try {
                                        const linksArr =
                                          typeof task.submissions[0].links ===
                                          'string'
                                            ? JSON.parse(
                                                task.submissions[0].links
                                              )
                                            : task.submissions[0].links;
                                        return linksArr.map((link, idx) => (
                                          <li
                                            key={idx}
                                            className='break-all text-blue-600'
                                          >
                                            {link}
                                          </li>
                                        ));
                                      } catch (error) {
                                        console.error(
                                          'Error parsing submission links:',
                                          error
                                        );
                                        return null;
                                      }
                                    })()}
                                  </ul>
                                )}
                                {task.submissions[0].attachment && (
                                  <div className='text-xs'>
                                    <span>Attachment: </span>
                                    <a
                                      href={task.submissions[0].attachment}
                                      target='_blank'
                                      rel='noreferrer'
                                      className='underline text-blue-600 break-all'
                                    >
                                      {task.submissions[0].attachment}
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}
                        </div>
                        {/* Only show edit & delete buttons in the "Task" tab */}
                        {isOwner &&
                          (activeTab === 'Task' ||
                            activeTab === 'Submitted') && (
                            <div className='flex space-x-2'>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setTaskToEdit(task);
                                  setShowEditModal(true);
                                }}
                                className='px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600 transition-colors'
                                title='Edit Task'
                              >
                                <FaEdit />
                              </button>
                              <button
                                onClick={e => {
                                  e.stopPropagation();
                                  setTaskToDelete(task);
                                  setShowDeleteModal(true);
                                }}
                                className='px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors'
                                title='Delete Task'
                              >
                                <FaTrash />
                              </button>
                            </div>
                          )}
                      </div>
                    );
                  })}
                  {filteredTasks.length > displayCount && (
                    <button
                      onClick={() => setDisplayCount(prev => prev + 5)}
                      className='mt-4 px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800 transition-colors'
                    >
                      View More
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Filter Panel, Summaries, Project Overview */}
          <div className='lg:col-span-4 space-y-4'>
            <div className='bg-gradient-to-r from-blue-500 to-blue-400 text-white rounded-md shadow p-4 mb-6'>
              <div className='flex items-center justify-between mb-3'>
                <h2 className='text-lg font-semibold'>Task Summary</h2>
                {isOwner && activeTab === 'Task' && (
                  <button
                    onClick={() => setShowCreateModal(true)}
                    className='px-3 py-1 bg-white text-blue-500 rounded hover:bg-gray-200 transition-colors'
                  >
                    + New Task
                  </button>
                )}
              </div>
              <div className='space-y-2'>
                <div className='flex justify-between border-b border-blue-300 pb-1'>
                  <span>Total Tasks:</span>
                  <span className='font-bold'>{totalCount}</span>
                </div>
                <div className='flex justify-between border-b border-blue-300 pb-1'>
                  <span>Backlog:</span>
                  <span className='font-bold'>{backlogCount}</span>
                </div>
                <div className='flex justify-between border-b border-blue-300 pb-1'>
                  <span>Review:</span>
                  <span className='font-bold'>{reviewCount}</span>
                </div>
                <div className='flex justify-between border-b border-blue-300 pb-1'>
                  <span>In Progress:</span>
                  <span className='font-bold'>{inProgressCount}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Finished:</span>
                  <span className='font-bold'>{finishedCount}</span>
                </div>
              </div>
              <div className='mt-4 flex flex-col space-y-3'>
                <input
                  type='text'
                  placeholder='Filter by task name'
                  value={taskFilter}
                  onChange={e => setTaskFilter(e.target.value)}
                  className='border rounded p-2 text-white'
                />
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className='border rounded p-2 text-white'
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
                  className='border rounded p-2 text-white'
                >
                  <option value=''>All Team Members</option>
                  <option value='notAssigned'>Not Assigned</option>
                  {assignableMembersForFilter.map(member => (
                    <option key={member.id} value={member.id}>
                      {member.firstName
                        ? `${member.firstName} ${member.lastName}`
                        : member.name || 'No Name'}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Project Overview Panel */}
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

            {/* Team Status Panel */}
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
  onTaskCreated: PropTypes.func,
  currentUser: PropTypes.object.isRequired
};

export default MyProjectTabs;
