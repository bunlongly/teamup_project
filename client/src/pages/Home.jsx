import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';
import fallbackLogo from '../assets/logo.png';

/**
 * Example avatar fallback if user has no avatarUrl.
 * You can replace with your own fallback image or logic.
 */
const fallbackAvatar = fallbackLogo;

function HomePage() {
  const [statusPosts, setStatusPosts] = useState([]);

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
      <div className='grid grid-cols-12 gap-6'>
        {/* LEFT / MAIN FEED */}
        <div className='col-span-12 md:col-span-8 space-y-4'>
          {statusPosts.length === 0 ? (
            <p className='text-gray-500'>No status posts to display.</p>
          ) : (
            statusPosts.map(post => (
              <StatusPostCard key={post.id} post={post} />
            ))
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className='col-span-12 md:col-span-4 space-y-4'>
          <ConnectionRequestPanel />
          <ConnectionSuggestPanel />
        </div>
      </div>
    </div>
  );
}

/**
 * A card component that displays a STATUS post.
 */
function StatusPostCard({ post }) {
  const user = post.user || {};

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      {/* Header: User info + maybe "..." menu */}
      <div className='flex justify-between items-start mb-3'>
        {/* User avatar + name/role */}
        <div className='flex items-center'>
          <img
            src={user.imageUrl || fallbackAvatar}
            alt='User Avatar'
            className='w-10 h-10 rounded-full object-cover mr-3'
          />
          <div>
            <p className='text-sm font-semibold text-gray-700 leading-tight'>
              {user.firstName} {user.lastName}
            </p>
            <p className='text-xs text-gray-500'>
              {user.jobTitle || 'Community Member'}
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

      {/* Post text content */}
      <p className='text-gray-800 text-sm mb-3'>{post.content}</p>

      {/* If there's an image in the post (e.g., post.fileUrl), display it */}
      {post.fileUrl && (
        <div className='mb-3'>
          <img
            src={post.fileUrl}
            alt='Post Media'
            className='w-full h-auto rounded-md'
          />
        </div>
      )}

      {/* Footer: e.g., like/comment/share buttons */}
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
    user: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      role: PropTypes.string,
      avatarUrl: PropTypes.string
    })
  }).isRequired
};

/**
 * Example Connection Request panel on the right side.
 * Hard-coded sample users for demonstration.
 */
function ConnectionRequestPanel() {
  const requests = [
    {
      id: '1',
      avatarUrl: fallbackAvatar,
      name: 'Peter',
      role: 'Business'
    },
    {
      id: '2',
      avatarUrl: fallbackAvatar,
      name: 'Jane',
      role: 'Developer'
    }
  ];

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <h3 className='text-md font-semibold mb-3'>Connection Requests</h3>
      {requests.map(user => (
        <div key={user.id} className='flex items-center justify-between mb-3'>
          <div className='flex items-center space-x-2'>
            <img
              src={user.avatarUrl}
              alt='User Avatar'
              className='w-8 h-8 rounded-full object-cover'
            />
            <div>
              <p className='text-sm font-medium text-gray-700'>{user.name}</p>
              <p className='text-xs text-gray-500'>{user.role}</p>
            </div>
          </div>
          <div className='space-x-1'>
            <button className='px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white'>
              Confirm
            </button>
            <button className='px-2 py-1 text-xs text-gray-600 border border-gray-300 rounded hover:bg-gray-100'>
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Example Connection Suggest panel on the right side.
 * Hard-coded sample suggestions for demonstration.
 */
function ConnectionSuggestPanel() {
  const suggestions = [
    {
      id: '3',
      avatarUrl: fallbackAvatar,
      name: 'Alex',
      role: 'Business'
    },
    {
      id: '4',
      avatarUrl: fallbackAvatar,
      name: 'Maria',
      role: 'Designer'
    }
  ];

  return (
    <div className='bg-white rounded-lg shadow p-4'>
      <h3 className='text-md font-semibold mb-3'>Connection Suggests</h3>
      {suggestions.map(user => (
        <div key={user.id} className='flex items-center justify-between mb-3'>
          <div className='flex items-center space-x-2'>
            <img
              src={user.avatarUrl}
              alt='User Avatar'
              className='w-8 h-8 rounded-full object-cover'
            />
            <div>
              <p className='text-sm font-medium text-gray-700'>{user.name}</p>
              <p className='text-xs text-gray-500'>{user.role}</p>
            </div>
          </div>
          <button className='px-2 py-1 text-xs text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white'>
            Follow
          </button>
        </div>
      ))}
    </div>
  );
}

export default HomePage;
