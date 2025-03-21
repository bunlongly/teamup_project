// CreatePostPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import 'react-toastify/dist/ReactToastify.css';

// Example dropdown options for projectType
const projectTypeOptions = [
  'E-commerce',
  'Web Development',
  'Mobile Development',
  'Other'
];

// The three post types
const postTypes = ['STATUS', 'RECRUITMENT', 'PROJECT_SEEKING'];

function CreatePostPage() {
  const navigate = useNavigate();

  // Track which post type is currently selected
  const [postType, setPostType] = useState('STATUS');

  // Form data (fields differ by post type)
  const [formData, setFormData] = useState({
    // For STATUS posts
    content: '',

    // For RECRUITMENT / PROJECT_SEEKING posts
    projectName: '',
    projectDescription: '',
    projectType: '', // e.g., E-commerce
    platform: '', // e.g., Web Development
    technicalRole: '', // e.g., Frontend / Backend / Full Stack
    duration: '',
    startDate: '',
    endDate: '',
    requirement: '',

    // Optional file upload
    file: null
  });

  // Switch post type, reset irrelevant fields
  const handlePostTypeChange = type => {
    setPostType(type);
    setFormData({
      content: '',
      projectName: '',
      projectDescription: '',
      projectType: '',
      platform: '',
      technicalRole: '',
      duration: '',
      startDate: '',
      endDate: '',
      requirement: '',
      file: null
    });
  };

  // Handle text/file changes
  const handleChange = e => {
    const { name, value, files } = e.target;
    if (files) {
      // For file inputs
      setFormData(prev => ({ ...prev, [name]: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  // Automatically compute duration if it's RECRUITMENT / PROJECT_SEEKING
  // and both startDate & endDate are set
  useEffect(() => {
    if (
      (postType === 'RECRUITMENT' || postType === 'PROJECT_SEEKING') &&
      formData.startDate &&
      formData.endDate
    ) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const diffInDays = Math.floor((end - start) / (1000 * 60 * 60 * 24));

      let durationStr = '';
      if (diffInDays < 7) {
        durationStr = `${diffInDays} day${diffInDays !== 1 ? 's' : ''}`;
      } else if (diffInDays < 30) {
        const weeks = Math.floor(diffInDays / 7);
        const days = diffInDays % 7;
        durationStr = `${weeks} week${weeks !== 1 ? 's' : ''}${
          days > 0 ? ` ${days} day${days !== 1 ? 's' : ''}` : ''
        }`;
      } else {
        const months = Math.floor(diffInDays / 30);
        const days = diffInDays % 30;
        durationStr = `${months} month${months !== 1 ? 's' : ''}${
          days > 0 ? ` ${days} day${days !== 1 ? 's' : ''}` : ''
        }`;
      }
      setFormData(prev => ({ ...prev, duration: durationStr }));
    }
  }, [formData.startDate, formData.endDate, postType]);

  // Submit form
  const handleSubmit = async e => {
    e.preventDefault();
    const data = new FormData();

    // Always append postType
    data.append('postType', postType);

    // If STATUS, just append content
    if (postType === 'STATUS') {
      data.append('content', formData.content);
    } else {
      // RECRUITMENT or PROJECT_SEEKING
      data.append('projectName', formData.projectName);
      data.append('projectDescription', formData.projectDescription);
      data.append('projectType', formData.projectType);
      data.append('platform', formData.platform);
      data.append('technicalRole', formData.technicalRole);
      data.append('startDate', formData.startDate);
      data.append('endDate', formData.endDate);
      data.append('duration', formData.duration);
      data.append('requirement', formData.requirement);
    }

    // If file is selected, append it
    if (formData.file) {
      data.append('file', formData.file);
    }

    try {
      // Use token if needed
      const token = localStorage.getItem('token');
      const response = await axios.post(
        'http://localhost:5200/api/post/create',
        data,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`
          }
        }
      );
      console.log('Post created:', response.data);

      toast.success('Post created successfully!', {
        position: 'top-right',
        autoClose: 2000
      });

      // Navigate conditionally after a short delay to show toast
      setTimeout(() => {
        if (postType === 'STATUS') {
          // Go to home (adjust route as needed)
          navigate('/');
        } else {
          // Go to projects page
          navigate('/projects');
        }
      }, 2000);
    } catch (error) {
      console.error('Error creating post:', error);
      toast.error('Failed to create post', {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  // For the stepper animation
  const currentIndex = postTypes.indexOf(postType);

  return (
    <div className='container mx-auto p-6'>
      <h1 className='text-2xl font-bold mb-4'>Create Post</h1>

      {/* Post Type Tabs */}
      <div className='mb-6 flex space-x-4'>
        {postTypes.map(type => (
          <button
            key={type}
            type='button'
            onClick={() => handlePostTypeChange(type)}
            className={`px-4 py-2 rounded-md font-semibold transition-colors duration-300 ${
              postType === type
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-800'
            }`}
          >
            {type === 'STATUS'
              ? 'Status'
              : type === 'RECRUITMENT'
              ? 'Recruitment'
              : 'Project Seeking'}
          </button>
        ))}
      </div>

      {/* Stepper */}
      <div className='mb-6 flex items-center justify-center'>
        {postTypes.map((type, index) => (
          <div key={type} className='flex items-center'>
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300 ${
                currentIndex === index
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-300 text-gray-600'
              }`}
            >
              {index + 1}
            </div>
            {index !== postTypes.length - 1 && (
              <div className='w-16 h-1 bg-gray-300 mx-2'></div>
            )}
          </div>
        ))}
      </div>

      {/* Form Card */}
      <div className='bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto'>
        <form
          onSubmit={handleSubmit}
          className='space-y-4 overflow-hidden relative'
        >
          <AnimatePresence mode='wait'>
            {postType === 'STATUS' && (
              <motion.div
                key='STATUS'
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  What is on your mind?
                </label>
                <textarea
                  name='content'
                  value={formData.content}
                  onChange={handleChange}
                  placeholder='Share your thoughts...'
                  rows='4'
                  className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                />
              </motion.div>
            )}

            {(postType === 'RECRUITMENT' || postType === 'PROJECT_SEEKING') && (
              <motion.div
                key='RECRUITMENT_PROJECT'
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: -50, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Start & End Dates (same line) */}
                <div className='flex space-x-4'>
                  <div className='w-1/2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Start Date
                    </label>
                    <input
                      type='date'
                      name='startDate'
                      value={formData.startDate}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    />
                  </div>
                  <div className='w-1/2'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      End Date
                    </label>
                    <input
                      type='date'
                      name='endDate'
                      value={formData.endDate}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    />
                  </div>
                </div>

                {/* Computed Duration */}
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Duration
                  </label>
                  <input
                    type='text'
                    name='duration'
                    value={formData.duration}
                    readOnly
                    placeholder='Computed automatically'
                    className='mt-1 block w-full rounded-lg border border-gray-300 bg-gray-100 shadow-sm sm:text-sm p-3'
                  />
                </div>

                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Project Name
                  </label>
                  <input
                    type='text'
                    name='projectName'
                    value={formData.projectName}
                    onChange={handleChange}
                    placeholder='Enter project name'
                    className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                  />
                </div>
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Project Description
                  </label>
                  <input
                    type='text'
                    name='projectDescription'
                    value={formData.projectDescription}
                    onChange={handleChange}
                    placeholder='Enter project description'
                    className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                  />
                </div>

                {/* Additional fields: projectType, platform, technicalRole */}
                <div className='flex space-x-4 mt-4'>
                  <div className='w-1/3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Project Type
                    </label>
                    <select
                      name='projectType'
                      id='projectType'
                      value={formData.projectType}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    >
                      <option value=''>Select project type</option>
                      {projectTypeOptions.map(option => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className='w-1/3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Platform
                    </label>
                    <select
                      name='platform'
                      id='platform'
                      value={formData.platform}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    >
                      <option value=''>Select platform</option>
                      <option value='Web Development'>Web Development</option>
                      <option value='Mobile Development'>
                        Mobile Development
                      </option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                  <div className='w-1/3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Technical Role
                    </label>
                    <select
                      name='technicalRole'
                      id='technicalRole'
                      value={formData.technicalRole}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    >
                      <option value=''>Select role</option>
                      <option value='Frontend'>Frontend</option>
                      <option value='Backend'>Backend</option>
                      <option value='Full Stack'>Full Stack</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                </div>

                {/* Requirement */}
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Requirement
                  </label>
                  <input
                    type='text'
                    name='requirement'
                    value={formData.requirement}
                    onChange={handleChange}
                    placeholder='Enter requirement'
                    className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* File Upload (hide if PROJECT_SEEKING is not supposed to have it) */}
          {postType !== 'PROJECT_SEEKING' && (
            <div className='mt-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Upload File
              </label>
              <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg'>
                {formData.file ? (
                  <img
                    src={URL.createObjectURL(formData.file)}
                    alt='Preview'
                    className='max-h-64 rounded-lg'
                  />
                ) : (
                  <div className='space-y-1 text-center'>
                    <svg
                      className='mx-auto h-12 w-12 text-gray-400'
                      stroke='currentColor'
                      fill='none'
                      viewBox='0 0 48 48'
                      aria-hidden='true'
                    >
                      <path
                        d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02'
                        strokeWidth='2'
                        strokeLinecap='round'
                        strokeLinejoin='round'
                      />
                    </svg>
                    <div className='flex text-sm text-gray-600'>
                      <label
                        htmlFor='file-upload'
                        className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500'
                      >
                        <span>Upload a file</span>
                        <input
                          id='file-upload'
                          name='file'
                          type='file'
                          onChange={handleChange}
                          className='sr-only'
                        />
                      </label>
                      <p className='pl-1'>or drag and drop</p>
                    </div>
                    <p className='text-xs text-gray-500'>
                      PNG, JPG, GIF up to 10MB
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className='flex justify-center mt-6'>
            <button
              type='submit'
              className='rounded-full px-8 py-3 bg-blue-600 text-white text-lg font-bold shadow-lg hover:bg-blue-700 transition-all duration-300 transform hover:-translate-y-1'
            >
              Create
            </button>
          </div>
        </form>
      </div>

      <ToastContainer />
    </div>
  );
}

export default CreatePostPage;
