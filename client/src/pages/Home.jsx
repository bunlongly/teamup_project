// HomePage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import fallbackAvatar from '../assets/logo.png'; // fallback avatar image

// Helper function to format a date string as "time ago"
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now - date) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds} seconds ago`;
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  } else {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
}

function HomePage() {
  const navigate = useNavigate();
  const [statusPosts, setStatusPosts] = useState([]);

  // Fetch STATUS posts from the backend on mount
  useEffect(() => {
    axios
      .get('http://localhost:5200/api/post/all')
      .then(response => {
        // Filter to only STATUS posts
        const posts = response.data.data.filter(
          post => post.postType === 'STATUS'
        );
        setStatusPosts(posts);
      })
      .catch(error => {
        console.error('Error fetching status posts:', error);
      });
  }, []);

  return (
    <div className='container mx-auto px-4 py-6'>
      {/* Sticky Create Post Button */}
      <div className='sticky top-0 z-50 bg-white p-4 shadow mb-4'>
        <button
          onClick={() => navigate('/projects/create')}
          className='w-full p-3 bg-blue-600 text-white rounded-lg text-lg font-semibold hover:bg-blue-700 transition-colors'
        >
          What's on your mind?
        </button>
      </div>

      <div className='grid grid-cols-12 gap-6'>
        {/* Main Feed */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          {statusPosts.length === 0 ? (
            <p className='text-gray-500'>No status posts to display.</p>
        ) : (
            statusPosts.map(post => (
              <StatusPostCard key={post.id} post={post} />
            ))
          )}
        </div>
        {/* Right Sidebar */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          <ConnectionRequestPanel />
          <ConnectionSuggestPanel />
        </div>
      </div>
    </div>
  );
}

function StatusPostCard({ post }) {
  const navigate = useNavigate();
  const user = post.user || {};

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      {/* Header: User info and menu */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex items-center'>
          <img
            src={user.imageUrl || fallbackAvatar}
            alt='User Avatar'
            className='w-10 h-8 rounded-full object-cover mr-3 cursor-pointer'
            onClick={() => {
              if (user.id) {
                navigate(`/profile/${user.id}`);
              }
            }}
          />
          <div>
            <p className='text-sm font-semibold text-gray-700'>
              {user.firstName} {user.lastName}
            </p>
            <p className='text-xs text-gray-500'>
              {user.jobTitle || 'Community Member'} •{' '}
              {post.createdAt ? formatTimeAgo(post.createdAt) : ''}
            </p>
          </div>
        </div>
        {/* Optional: Dots menu */}
        <button className='text-gray-400 hover:text-gray-600'>
          <svg
            className='w-5 h-5'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'
          >
            <circle cx='12' cy='5' r='1' />
            <circle cx='12' cy='12' r='1' />
            <circle cx='12' cy='19' r='1' />
          </svg>
        </button>
      </div>

      {/* Post content */}
      <p className='text-gray-800 text-sm mb-3'>{post.content}</p>
      {post.fileUrl && (
        <div className='mb-3'>
          <img
            src={post.fileUrl}
            alt='Post Media'
            className='w-full h-auto rounded-md'
          />
        </div>
      )}

      {/* Footer: Social actions */}
      <div className='mt-3 flex space-x-4 text-gray-500 text-sm'>
        <button className='flex items-center space-x-1 hover:text-blue-500'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'
          >
            <path
              d='M14 9l-2 2-2-2m2 2l2 2-2 2m4-4h6m-6 4h6'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span>Like</span>
        </button>
        <button className='flex items-center space-x-1 hover:text-blue-500'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'
          >
            <path
              d='M7 8h10M7 12h6m-6 4h4'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span>Comment</span>
        </button>
        <button className='flex items-center space-x-1 hover:text-blue-500'>
          <svg
            className='w-4 h-4'
            fill='none'
            stroke='currentColor'
            strokeWidth='2'
            viewBox='0 0 24 24'
          >
            <path
              d='M15 10l4.553-4.553A2 2 0 0016.553 3H7a2 2 0 00-2 2v14l4-4h3'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </svg>
          <span>Share</span>
        </button>
      </div>
    </div>
  );
}

StatusPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    fileUrl: PropTypes.string,
    createdAt: PropTypes.string,
    user: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      jobTitle: PropTypes.string,
      imageUrl: PropTypes.string
    })
  }).isRequired
};

function ConnectionRequestPanel() {
  const token = localStorage.getItem('token');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5200/api/connection/incoming',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Expecting response.data.data.requests to be an array of user objects.
        setIncomingRequests(response.data.data.requests);
      } catch (error) {
        console.error('Error fetching incoming connection requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingRequests();
  }, [token]);

  const handleConfirm = async followerId => {
    console.log('Confirming connection for followerId:', followerId);
    try {
      const response = await axios.post(
        'http://localhost:5200/api/connection/accept',
        { followerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Confirm response:', response.data);
      setIncomingRequests(prev =>
        prev.filter(request => request.id !== followerId)
      );
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleReject = async followerId => {
    try {
      await axios.delete(`http://localhost:5200/api/connection/${followerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setIncomingRequests(prev =>
        prev.filter(request => request.id !== followerId)
      );
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className='bg-white rounded-lg shadow p-3'>
      <h3 className='text-md font-semibold mb-2'>Connection Requests</h3>
      {loading ? (
        <p className='text-sm text-gray-500'>Loading...</p>
      ) : incomingRequests.length === 0 ? (
        <p className='text-sm text-gray-500'>No pending connection requests.</p>
      ) : (
        <>
          {incomingRequests.slice(0, visibleCount).map(request => (
            <div
              key={request.id}
              className='flex items-center justify-between mb-2 bg-gray-50 p-2 rounded'
            >
              <div className='flex items-center space-x-2'>
                <img
                  src={request.imageUrl || fallbackAvatar}
                  alt='Avatar'
                  className='w-6 h-6 rounded-full object-cover'
                />
                <div>
                  <p className='font-medium text-sm leading-tight'>
                    {request.firstName} {request.lastName}
                  </p>
                  <p className='text-xs text-gray-500 leading-tight'>
                    @{request.username}
                  </p>
                </div>
              </div>
              <div className='flex space-x-1'>
                <button
                  onClick={() => handleConfirm(request.id)}
                  className='bg-green-600 text-white px-2 py-1 text-xs rounded hover:bg-green-700 transition-colors'
                >
                  Confirm
                </button>
                <button
                  onClick={() => handleReject(request.id)}
                  className='bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors'
                >
                  Reject
                </button>
              </div>
            </div>
          ))}
          {incomingRequests.length > visibleCount && (
            <button
              onClick={handleViewMore}
              className='mt-2 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors'
            >
              View More
            </button>
          )}
        </>
      )}
    </div>
  );
}

function ConnectionSuggestPanel() {
  const token = localStorage.getItem('token');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(5);

  // Fetch all users from the system on mount.
  useEffect(() => {
    const fetchAllUsers = async () => {
      try {
        const response = await axios.get('http://localhost:5200/api/user/all', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Assuming response.data.data contains an array of user objects.
        const data = response.data.data;
        const users = Array.isArray(data) ? data : data.users ? data.users : [];
        setSuggestions(users);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAllUsers();
  }, [token]);

  // Handle sending a connection request.
  const handleConnect = async userId => {
    console.log('Sending connection request to userId:', userId);
    try {
      const response = await axios.post(
        'http://localhost:5200/api/connection/create', // Updated endpoint!
        { userId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Connection request response:', response.data);
      // Remove suggestion from list after connecting.
      setSuggestions(prev => prev.filter(user => user.id !== userId));
    } catch (error) {
      console.error('Error connecting:', error);
    }
  };

  // Handle dismissing a suggestion.
  const handleDismiss = userId => {
    setSuggestions(prev => prev.filter(user => user.id !== userId));
  };

  const handleViewMore = () => {
    setVisibleCount(prev => prev + 5);
  };

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <h3 className='text-md font-semibold mb-3'>Connection Suggestions</h3>
      {loading ? (
        <p className='text-sm text-gray-500'>Loading suggestions...</p>
      ) : suggestions.length === 0 ? (
        <p className='text-sm text-gray-500'>No suggestions available.</p>
      ) : (
        <>
          {suggestions.slice(0, visibleCount).map(user => (
            <div
              key={user.id}
              className='flex items-center justify-between mb-3 p-2 bg-gray-50 rounded'
            >
              <div className='flex items-center space-x-3'>
                <img
                  src={user.imageUrl || fallbackAvatar}
                  alt='User Avatar'
                  className='w-10 h-10 rounded-full object-cover'
                />
                <div>
                  <p className='text-sm font-medium text-gray-700'>
                    {user.firstName} {user.lastName}
                  </p>
                  <p className='text-xs text-gray-500'>@{user.username}</p>
                </div>
              </div>
              <div className='flex space-x-2'>
                <button
                  onClick={() => handleConnect(user.id)}
                  className='bg-blue-600 text-white px-2 py-1 text-xs rounded hover:bg-blue-700 transition-colors'
                >
                  Connect
                </button>
                <button
                  onClick={() => handleDismiss(user.id)}
                  className='bg-red-600 text-white px-2 py-1 text-xs rounded hover:bg-red-700 transition-colors'
                >
                  Dismiss
                </button>
              </div>
            </div>
          ))}
          {suggestions.length > visibleCount && (
            <button
              onClick={handleViewMore}
              className='mt-2 bg-blue-600 text-white px-3 py-1 text-sm rounded hover:bg-blue-700 transition-colors'
            >
              View More
            </button>
          )}
        </>
      )}
    </div>
  );
}

export default HomePage;
