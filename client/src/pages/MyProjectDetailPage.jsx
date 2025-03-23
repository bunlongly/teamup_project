import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from the URL
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // All hooks are declared at the top.
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Task');
  const [tasks, setTasks] = useState([
    {
      id: 1,
      name: 'Front-End Setup',
      dueDate: '2024-11-06',
      attachment: 'design_mockup.png',
      status: 'Finished',
      assignedTo: 'Jane Smith'
    },
    {
      id: 2,
      name: 'API Integration',
      dueDate: '2024-12-01',
      attachment: null,
      status: 'In Progress',
      assignedTo: 'Michael Brown'
    }
  ]);
  const [teamMembers, setTeamMembers] = useState([
    { id: 'u1', name: 'John Doe', role: 'Project Manager' },
    { id: 'u2', name: 'Jane Smith', role: 'Developer' },
    { id: 'u3', name: 'Michael Brown', role: 'Designer' }
  ]);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [newTaskAssignedTo, setNewTaskAssignedTo] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('Pending');

  // Helper function to format dates
  const formatDate = dateString => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  // Fetch project details from the backend
  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  // Handler for adding a new task (demo function)
  const handleAddTask = () => {
    if (!newTaskName || !newTaskDueDate || !newTaskAssignedTo) {
      alert('Please fill in all fields');
      return;
    }
    const newTask = {
      id: Date.now(), // For demo purposes; in a real app use backend-generated ID.
      name: newTaskName,
      dueDate: newTaskDueDate,
      attachment: null,
      status: newTaskStatus,
      assignedTo: newTaskAssignedTo
    };
    setTasks(prev => [...prev, newTask]);
    // Clear form fields
    setNewTaskName('');
    setNewTaskDueDate('');
    setNewTaskAssignedTo('');
    setNewTaskStatus('Pending');
  };

  if (loading) return <p className='p-4'>Loading project details...</p>;
  if (!project) return <p className='p-4'>Project not found.</p>;

  const ownerName = project.user
    ? `${project.user.firstName} ${project.user.lastName}`
    : 'Unknown Owner';

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

      {/* Render project details inside a fragment */}
      <>
        {/* Project Info (Header) */}
        <div className='bg-white rounded-md shadow p-6 mb-6'>
          <div className='flex items-center mb-4'>
            <img
              src={project.fileUrl || fallbackLogo}
              alt='Project'
              className='w-16 h-16 object-contain rounded mr-4'
            />
            <div>
              <h1 className='text-2xl font-bold'>
                {project.projectName || 'Untitled Project'}
              </h1>
              <p className='text-sm text-gray-600'>
                {project.postType || 'STATUS'}
              </p>
            </div>
          </div>
          <div className='grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm text-gray-700 mb-4'>
            <div>
              <span className='font-semibold'>Owner:</span> {ownerName}
            </div>
            <div>
              <span className='font-semibold'>Platform:</span>{' '}
              {project.platform || 'N/A'}
            </div>
            <div>
              <span className='font-semibold'>Technical Role:</span>{' '}
              {project.technicalRole || 'N/A'}
            </div>
            <div>
              <span className='font-semibold'>Duration:</span>{' '}
              {project.duration || 'N/A'}
            </div>
            <div>
              <span className='font-semibold'>Start Date:</span>{' '}
              {formatDate(project.startDate)}
            </div>
            <div>
              <span className='font-semibold'>End Date:</span>{' '}
              {formatDate(project.endDate)}
            </div>
          </div>
          <p className='text-gray-700'>
            {project.projectDescription || 'No description provided.'}
          </p>
        </div>

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
                          <p className='font-medium text-gray-700'>
                            {task.name}
                          </p>
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
                <h2 className='text-xl font-semibold mb-3'>
                  Assign a New Task
                </h2>
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
                    Assign To
                  </label>
                  <select
                    value={newTaskAssignedTo}
                    onChange={e => setNewTaskAssignedTo(e.target.value)}
                    className='border rounded w-full p-2 mt-1'
                  >
                    <option value=''>-- Select Member --</option>
                    {teamMembers.map(member => (
                      <option key={member.id} value={member.name}>
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
                <p className='text-sm text-gray-600 mb-1'>Web Development</p>
                <p className='text-sm text-gray-600 mb-1'>UI/UX Design</p>
              </div>
              <div className='bg-white rounded-md shadow p-4'>
                <h2 className='text-lg font-semibold mb-2'>Team Status</h2>
                <p className='text-sm text-gray-600'>Active Members: 3</p>
              </div>
            </div>
          </div>
        ) : (
          <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
            {/* TEAM TAB */}
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
                <p className='text-sm text-gray-600 mb-1'>Web Development</p>
                <p className='text-sm text-gray-600 mb-1'>UI/UX Design</p>
              </div>
              <div className='bg-white rounded-md shadow p-4'>
                <h2 className='text-lg font-semibold mb-2'>Team Status</h2>
                <p className='text-sm text-gray-600'>Active Members: 3</p>
              </div>
            </div>
          </div>
        )}
      </>
    </div>
  );
}

export default MyProjectDetailPage;
