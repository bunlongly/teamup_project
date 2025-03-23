import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import fallbackLogo from '../assets/logo.png';

function MyProjectDetailPage() {
  const { id } = useParams(); // project ID from the URL
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');
  const navigate = useNavigate();

  // Tabs: "Task" and "Team"
  const [activeTab, setActiveTab] = useState('Task');

  useEffect(() => {
    const fetchProject = async () => {
      setLoading(true);
      try {
        // Replace "/api/post/:id" with the actual backend route for fetching a single project
        const response = await axios.get(
          `http://localhost:5200/api/post/${id}`,
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        // Assuming response.data.data is the project object
        setProject(response.data.data);
      } catch (error) {
        console.error('Error fetching project details:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [id, token]);

  if (loading) return <p className='p-4'>Loading project details...</p>;
  if (!project) return <p className='p-4'>Project not found.</p>;

  return (
    <div className='container mx-auto p-4'>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className='mb-4 text-blue-500 hover:underline'
      >
        &larr; Back
      </button>

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
        <p className='mb-4 text-gray-700'>
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
        /* --------------------------
           TASK TAB (Hard-Coded Demo)
           -------------------------- */
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Task Info */}
          <div className='lg:col-span-8'>
            <div className='bg-white rounded-md shadow p-4 mb-6'>
              <h2 className='text-xl font-semibold mb-3'>Overview</h2>
              {/* Hard-coded example of a single task item */}
              <div className='flex items-center justify-between mb-3'>
                <p className='font-medium text-gray-700'>Task Name:</p>
                <p className='text-gray-800'>Front-End Setup</p>
              </div>
              <div className='flex items-center justify-between mb-3'>
                <p className='font-medium text-gray-700'>Due Date:</p>
                <p className='text-gray-800'>Nov 6, 2024</p>
              </div>
              <div className='flex items-center justify-between mb-3'>
                <p className='font-medium text-gray-700'>Attachments:</p>
                <a href='#' className='text-blue-500 hover:underline'>
                  design_mockup.png
                </a>
              </div>
              <div className='flex items-center justify-between mb-3'>
                <p className='font-medium text-gray-700'>Status:</p>
                <span className='px-2 py-1 bg-green-600 text-white text-xs rounded-full'>
                  Finished
                </span>
              </div>
            </div>

            {/* Details / Additional Info */}
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Details</h2>
              {/* Example file upload + comment input */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Add Attachment
                </label>
                <input type='file' className='border p-1 rounded w-full' />
                <button className='mt-2 px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'>
                  Submit
                </button>
              </div>
              <div className='mb-4'>
                <label className='block text-sm font-medium text-gray-700 mb-1'>
                  Notes
                </label>
                <textarea
                  rows='3'
                  className='border w-full rounded p-2'
                  placeholder='Enter any additional notes here...'
                />
              </div>
            </div>
          </div>

          {/* Right Column: Project Info / Some Hard-Coded Panel */}
          <div className='lg:col-span-4 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Project Overview</h2>
              <p className='text-sm text-gray-600 mb-1'>Web Development</p>
              <p className='text-sm text-gray-600 mb-1'>UI/UX Design</p>
            </div>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-lg font-semibold mb-2'>Task Status</h2>
              <p className='text-sm text-gray-600'>Active tasks: 3</p>
              <p className='text-sm text-gray-600'>Completed tasks: 5</p>
            </div>
          </div>
        </div>
      ) : (
        /* --------------------------
           TEAM TAB (Hard-Coded Demo)
           -------------------------- */
        <div className='grid grid-cols-1 lg:grid-cols-12 gap-6'>
          {/* Left Column: Team Members */}
          <div className='lg:col-span-8 space-y-4'>
            <div className='bg-white rounded-md shadow p-4'>
              <h2 className='text-xl font-semibold mb-3'>Team Members</h2>
              <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
                {/* Hard-coded example of 3 team members */}
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

            {/* Add New Team Member (Hard-coded form) */}
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

          {/* Right Column: Project Info / Some Hard-Coded Panel */}
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
    </div>
  );
}

export default MyProjectDetailPage;
