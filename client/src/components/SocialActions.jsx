// src/components/SocialActions.jsx
import React, { useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const SocialActions = ({ post, initialLikes, initialComments }) => {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');

  // Ensure likes and comments are arrays.
  const [likes, setLikes] = useState(
    Array.isArray(initialLikes) ? initialLikes : []
  );
  const [comments, setComments] = useState(
    Array.isArray(initialComments) ? initialComments : []
  );
  const [commentText, setCommentText] = useState('');
  const [showCommentInput, setShowCommentInput] = useState(false);
  // Controls how many comments are visible (pagination).
  const [visibleCommentsCount, setVisibleCommentsCount] = useState(2);
  // Controls whether the comments listing is displayed at all.
  const [showCommentsListing, setShowCommentsListing] = useState(true);

  // Compute if the current user has liked this post.
  const isLiked = likes.some(like => like.userId === userId);
  // For the comment icon: if at least one comment exists, fill it.
  const hasComments = comments.length > 0;

  // Framer Motion variants for the heart icon.
  const heartVariants = {
    liked: { fill: '#21ADEA', scale: 1.2 },
    unliked: { fill: 'none', scale: 1 }
  };

  // Framer Motion variants for the comment icon.
  const commentVariants = {
    filled: { fill: '#21ADEA', scale: 1.1 },
    unfilled: { fill: 'none', scale: 1 }
  };

  const handleLike = async () => {
    try {
      if (!isLiked) {
        const response = await axios.post(
          'http://localhost:5200/api/post/like',
          { postId: post.id },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('handleLike - like added:', response.data);
        setLikes(prevLikes => [...prevLikes, response.data]);
      } else {
        await axios.delete('http://localhost:5200/api/post/like', {
          data: { postId: post.id },
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('handleLike - like removed for user', userId);
        setLikes(prevLikes => prevLikes.filter(like => like.userId !== userId));
      }
    } catch (error) {
      console.error('Error toggling like:', error);
      toast.error('Error updating like.');
    }
  };

  const handleCommentSubmit = async e => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const response = await axios.post(
        'http://localhost:5200/api/post/comment',
        { postId: post.id, content: commentText },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('handleCommentSubmit - comment added:', response.data);
      setComments(prevComments => [...prevComments, response.data]);
      setCommentText('');
      toast.success('Comment added!');
    } catch (error) {
      console.error('Error adding comment:', error);
      toast.error('Error adding comment.');
    }
  };

  const handleDeleteComment = async commentId => {
    try {
      await axios.delete(
        `http://localhost:5200/api/post/comment/${commentId}`,
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      console.log('handleDeleteComment - comment deleted:', commentId);
      setComments(prevComments =>
        prevComments.filter(comment => comment.id !== commentId)
      );
      toast.success('Comment deleted!');
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('Error deleting comment.');
    }
  };

  // Determine the list of comments to display based on visibleCommentsCount.
  const displayedComments = comments.slice(0, visibleCommentsCount);

  return (
    <div className='mt-3'>
      {/* Social Action Buttons Row */}
      <div className='flex space-x-6 text-gray-600 text-sm items-center'>
        {/* Like Button */}
        <motion.button
          onClick={handleLike}
          whileTap={{ scale: 1.2 }}
          className='flex items-center space-x-1'
        >
          <motion.svg
            key={isLiked ? 'liked' : 'unliked'}
            className='w-6 h-6'
            viewBox='0 0 24 24'
            variants={heartVariants}
            animate={isLiked ? 'liked' : 'unliked'}
            transition={{ duration: 0.3 }}
            style={{ cursor: 'pointer', stroke: '#21ADEA' }}
          >
            <path
              d='M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5
                 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09
                 C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5
                 c0 3.78-3.4 6.86-8.55 11.54L12 21.35z'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </motion.svg>
          <span className='font-medium'>
            {likes.length} Like{likes.length !== 1 ? 's' : ''}
          </span>
        </motion.button>

        {/* Comment Button */}
        <motion.button
          onClick={() => setShowCommentInput(!showCommentInput)}
          whileTap={{ scale: 1.2 }}
          className='flex items-center space-x-1'
        >
          <motion.svg
            key={hasComments ? 'filled' : 'unfilled'}
            className='w-6 h-6'
            viewBox='0 0 24 24'
            variants={commentVariants}
            animate={hasComments ? 'filled' : 'unfilled'}
            transition={{ duration: 0.2 }}
            style={{ cursor: 'pointer', stroke: '#21ADEA' }}
          >
            <path
              d='M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h12a2 2 0 012 2z'
              strokeLinecap='round'
              strokeLinejoin='round'
            />
          </motion.svg>
          <span className='font-medium'>
            {comments.length} Comment{comments.length !== 1 ? 's' : ''}
          </span>
        </motion.button>
      </div>

      {/* Pagination Controls for Comments */}
      {comments.length > displayedComments.length && showCommentsListing && (
        <div className='mt-2'>
          <button
            onClick={() => setVisibleCommentsCount(visibleCommentsCount + 2)}
            className='text-blue-600 hover:text-blue-800 text-sm font-semibold'
          >
            View more comments
          </button>
        </div>
      )}
      {visibleCommentsCount > 2 && showCommentsListing && (
        <div className='mt-2'>
          <button
            onClick={() => setVisibleCommentsCount(2)}
            className='text-blue-600 hover:text-blue-800 text-sm font-semibold'
          >
            Show less
          </button>
        </div>
      )}

      {/* Toggle Comments Listing */}
      {comments.length > 0 && (
        <div className='mt-2'>
          <button
            onClick={() => setShowCommentsListing(prev => !prev)}
            className='text-blue-600 hover:text-blue-800 text-sm font-semibold'
          >
            {showCommentsListing ? 'Hide Comments' : 'Show Comments'}
          </button>
        </div>
      )}

      {/* Animated Comment Input */}
      <AnimatePresence>
        {showCommentInput && (
          <motion.form
            onSubmit={handleCommentSubmit}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className='mt-3 flex flex-col space-y-2'
          >
            <input
              type='text'
              value={commentText}
              onChange={e => setCommentText(e.target.value)}
              placeholder='Write a comment...'
              className='w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 text-sm'
            />
            <div className='flex justify-end'>
              <button
                type='submit'
                className='bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition-colors text-sm'
              >
                Post Comment
              </button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>

      {/* Comments Listing */}
      {showCommentsListing && displayedComments.length > 0 && (
        <div className='mt-4 space-y-3'>
          {displayedComments.map(comment => (
            <div
              key={comment.id}
              className='bg-white border border-gray-200 rounded-lg p-3 flex justify-between items-center'
            >
              <div className='space-y-1 text-sm'>
                <p className='font-medium text-gray-800'>{comment.content}</p>
                <p className='text-xs text-gray-500'>
                  {new Date(comment.createdAt).toLocaleString()}
                </p>
              </div>
              {comment.userId === userId && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className='ml-3 hover:text-red-700'
                  title='Delete'
                >
                  <svg
                    className='w-5 h-5'
                    fill='none'
                    stroke='#21ADEA'
                    strokeWidth='2'
                    viewBox='0 0 24 24'
                    style={{ cursor: 'pointer' }}
                  >
                    <path
                      d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a1 1 0 011 1v1H9V4a1 1 0 011-1z'
                      strokeLinecap='round'
                      strokeLinejoin='round'
                    />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

SocialActions.propTypes = {
  post: PropTypes.object.isRequired,
  initialLikes: PropTypes.array,
  initialComments: PropTypes.array
};

export default SocialActions;
