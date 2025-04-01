// pages/CreatePostPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import { AnimatePresence, motion } from 'framer-motion';
import SubscriptionModal from '../components/SubscriptionModal'; // for purchasing a plan
import SkipPaymentModal from '../components/SkipPaymentModal'; // for skipping payment
import 'react-toastify/dist/ReactToastify.css';

const projectTypeOptions = [
  'AI/Machine Learning',
  'Web Application',
  'Mobile Development',
  'Mobile Application Project',
  'Hybrid App Development',
  'AI/ML Research & Development',
  'Data Analytics & Visualization',
  'Cloud-Native Applications'
];

const postTypes = ['STATUS', 'RECRUITMENT', 'PROJECT_SEEKING'];

function CreatePostPage() {
  const navigate = useNavigate();
  const formDataRef = useRef(null);
  const [postType, setPostType] = useState('STATUS');
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showSkipModal, setShowSkipModal] = useState(false);
  const [subscriptionDetails, setSubscriptionDetails] = useState(null);

  const [formData, setFormData] = useState({
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
    fileUrl: ''
  });

  // Fetch subscription details when the component mounts.
  useEffect(() => {
    const fetchSubscriptionDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(
          'http://localhost:5200/api/subscription',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
        );
        setSubscriptionDetails(response.data);
      } catch (error) {
        console.error('Error fetching subscription details:', error);
      }
    };
    fetchSubscriptionDetails();
  }, []);

  // When the post type is changed, clear the form.
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
      fileUrl: ''
    });
  };

  // Handle input changes.
  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle file upload.
  const handleFileChange = async e => {
    const { files } = e.target;
    if (files && files[0]) {
      try {
        const formDataForFile = new FormData();
        formDataForFile.append('file', files[0]);

        const response = await axios.post(
          'http://localhost:5200/api/upload',
          formDataForFile,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );

        setFormData(prev => ({
          ...prev,
          fileUrl: response.data.fileUrl
        }));
        toast.success('Image uploaded successfully!');
      } catch (error) {
        console.error('Error uploading file:', error);
        toast.error('Failed to upload image');
      }
    }
  };

  // Automatically compute duration based on start and end dates.
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

  // handleSubmit: Called when the form is submitted.
  const handleSubmit = async e => {
    e.preventDefault();
    formDataRef.current = { ...formData, postType };

    if (postType === 'RECRUITMENT') {
      if (subscriptionDetails && subscriptionDetails.remainingPosts > 0) {
        setShowSkipModal(true);
        return;
      }
      setShowSubscriptionModal(true);
      return;
    }

    // For non-recruitment posts, create the post directly.
    await createPost(formData, postType);
  };

  // handlePlanSelect: Called when a plan is chosen in the subscription modal.
  const handlePlanSelect = async selectedPlan => {
    try {
      const token = localStorage.getItem('token');
      localStorage.setItem(
        'recruitmentFormData',
        JSON.stringify({
          ...formData,
          postType,
          subscriptionPlan: selectedPlan
        })
      );
      const response = await axios.post(
        'http://localhost:5200/api/stripe/create-checkout-session',
        { postType, subscriptionPlan: selectedPlan },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowSubscriptionModal(false);
      window.location.href = response.data.url;
    } catch (error) {
      console.error('Error creating checkout session:', error);
      toast.error('Failed to create checkout session', {
        position: 'top-right',
        autoClose: 5000
      });
    }
  };

  // handleSkipConfirm: Called when the user confirms using a remaining post.
  const handleSkipConfirm = async () => {
    try {
      const token = localStorage.getItem('token');
      await createPost(formData, postType);
      await axios.put(
        'http://localhost:5200/api/subscription',
        { decrementBy: 1 },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      toast.success('Post created successfully using your subscription.');
      // Refresh subscription details.
      const response = await axios.get(
        'http://localhost:5200/api/subscription',
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      const updatedSubs =
        response.data.remainingPosts < 0 ? 0 : response.data.remainingPosts;
      setSubscriptionDetails({ ...response.data, remainingPosts: updatedSubs });
    } catch (error) {
      console.error('Error creating post or updating subscription:', error);
      toast.error('Error creating post or updating subscription.', {
        position: 'top-right',
        autoClose: 5000
      });
    }
    setShowSkipModal(false);
  };

  // handleSkipCancel: Called when the user cancels the skip.
  const handleSkipCancel = () => {
    setShowSkipModal(false);
    setShowSubscriptionModal(true);
  };

  // createPost: Called to create the post.
  const createPost = async (dataObj, type) => {
    try {
      const data = new FormData();
      data.append('postType', type);

      if (type === 'STATUS') {
        data.append('content', dataObj.content);
        if (dataObj.fileUrl) {
          data.append('fileUrl', dataObj.fileUrl);
        }
      } else {
        data.append('projectName', dataObj.projectName);
        data.append('projectDescription', dataObj.projectDescription);
        data.append('projectType', dataObj.projectType);
        data.append('platform', dataObj.platform);
        data.append('technicalRole', dataObj.technicalRole);
        data.append('startDate', dataObj.startDate);
        data.append('endDate', dataObj.endDate);
        data.append('duration', dataObj.duration);
        data.append('requirement', dataObj.requirement);
        if (dataObj.fileUrl) {
          data.append('fileUrl', dataObj.fileUrl);
        }
      }

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

      setTimeout(() => {
        if (type === 'STATUS') {
          navigate('/');
        } else {
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

      {/* Show subscription details if post type is RECRUITMENT */}
      {postType === 'RECRUITMENT' && subscriptionDetails && (
        <div className='mb-4 p-4 border rounded bg-green-100 text-green-800'>
          You currently have {Math.max(subscriptionDetails.remainingPosts, 0)}{' '}
          recruitment post(s) remaining.
        </div>
      )}

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

      <div className='bg-white p-6 rounded-lg shadow-md max-w-2xl mx-auto'>
        <form onSubmit={handleSubmit} className='space-y-4'>
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
                {/* File upload input for STATUS posts */}
                <div className='mt-4'>
                  <label className='block text-sm font-medium text-gray-700 mb-2'>
                    Upload Image
                  </label>
                  <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg'>
                    {formData.fileUrl ? (
                      <img
                        src={formData.fileUrl}
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
                            d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28'
                            strokeWidth='2'
                            strokeLinecap='round'
                            strokeLinejoin='round'
                          />
                        </svg>
                        <div className='flex text-sm text-gray-600'>
                          <label
                            htmlFor='file-upload-status'
                            className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500'
                          >
                            <span>Upload an image</span>
                            <input
                              id='file-upload-status'
                              name='file'
                              type='file'
                              onChange={handleFileChange}
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
                {/* Start & End Dates */}
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

                {/* Duration */}
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

                <div className='flex space-x-4 mt-4'>
                  <div className='w-1/3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Project Type
                    </label>
                    <select
                      name='projectType'
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
                      value={formData.platform}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    >
                      <option value=''>Select platform</option>
                      <option value='Web Development'>Web Dev</option>
                      <option value='Mobile Development'>Mobile Dev</option>
                      <option value='Mobile Development'>Cloud Dev</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                  <div className='w-1/3'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Technical Role
                    </label>
                    <select
                      name='technicalRole'
                      value={formData.technicalRole}
                      onChange={handleChange}
                      className='mt-1 block w-full rounded-lg border border-gray-300 shadow-sm focus:border-blue-600 focus:ring-blue-600 sm:text-sm p-3'
                    >
                      <option value=''>Select role</option>
                      <option value='Frontend'>Frontend</option>
                      <option value='Backend'>Backend</option>
                      <option value='Full Stack'>Full Stack Developer</option>
                      <option value='Full Stack'>Swift Developer</option>
                      <option value='Full Stack'>UX/UI Design</option>
                      <option value='Other'>Other</option>
                    </select>
                  </div>
                </div>

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

                {/* For RECRUITMENT posts, include the file upload input */}
                {postType === 'RECRUITMENT' && (
                  <div className='mt-4'>
                    <label className='block text-sm font-medium text-gray-700 mb-2'>
                      Upload File
                    </label>
                    <div className='mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg'>
                      {formData.fileUrl ? (
                        <img
                          src={formData.fileUrl}
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
                              d='M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28'
                              strokeWidth='2'
                              strokeLinecap='round'
                              strokeLinejoin='round'
                            />
                          </svg>
                          <div className='flex text-sm text-gray-600'>
                            <label
                              htmlFor='file-upload-recruitment'
                              className='relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500'
                            >
                              <span>Upload a file</span>
                              <input
                                id='file-upload-recruitment'
                                name='file'
                                type='file'
                                onChange={handleFileChange}
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
              </motion.div>
            )}
          </AnimatePresence>

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

      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          onSelectPlan={handlePlanSelect}
        />
      )}

      {showSkipModal && subscriptionDetails && (
        <SkipPaymentModal
          remainingPosts={subscriptionDetails.remainingPosts}
          onConfirm={handleSkipConfirm}
          onCancel={handleSkipCancel}
        />
      )}
    </div>
  );
}

export default CreatePostPage;
