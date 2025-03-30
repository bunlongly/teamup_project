import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import fallbackAvatar from '../assets/logo.png';
import SocialActions from './SocialActions';

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

function StatusPostCard({ post }) {
  const navigate = useNavigate();
  const user = post.user || {};

  return (
    <div className='bg-white rounded-lg shadow p-4 mb-4'>
      {/* Header: User info and menu */}
      <div className='flex justify-between items-start mb-3'>
        <div className='flex items-center'>
          <img
            src={user.imageUrl || fallbackAvatar}
            alt='User Avatar'
            className='w-10 h-10 rounded-full object-cover mr-3 cursor-pointer'
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

      {/* Social Actions: Like, Comment, Share */}
      <SocialActions
        post={post}
        initialLikes={post.likes || []}
        initialComments={post.comments || []}
      />
    </div>
  );
}

StatusPostCard.propTypes = {
  post: PropTypes.shape({
    id: PropTypes.string,
    content: PropTypes.string,
    fileUrl: PropTypes.string,
    createdAt: PropTypes.string,
    postType: PropTypes.string,
    likes: PropTypes.array,
    comments: PropTypes.array,
    user: PropTypes.shape({
      id: PropTypes.string,
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      jobTitle: PropTypes.string,
      imageUrl: PropTypes.string
    })
  }).isRequired
};

export default StatusPostCard;
