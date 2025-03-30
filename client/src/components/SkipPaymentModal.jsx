import React from 'react';
import PropTypes from 'prop-types';
import { motion } from 'framer-motion';

const modalVariants = {
  hidden: {
    opacity: 0,
    y: -50,
    rotateX: -90
  },
  visible: {
    opacity: 1,
    y: 0,
    rotateX: 0,
    transition: {
      duration: 0.8,
      ease: 'easeOut'
    }
  },
  exit: {
    opacity: 0,
    y: 50,
    rotateX: 90,
    transition: {
      duration: 0.8,
      ease: 'easeIn'
    }
  }
};

const SkipPaymentModal = ({ remainingPosts, onConfirm, onCancel }) => {
  return (
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)' }}
    >
      <motion.div
        className='animated-gradient p-1 rounded-xl shadow-2xl max-w-md w-full'
        variants={modalVariants}
        initial='hidden'
        animate='visible'
        exit='exit'
      >
        <div className='bg-white rounded-xl p-8'>
          <h2 className='text-3xl font-extrabold text-center text-gray-900 mb-4'>
            Use Your Remaining Post?
          </h2>
          <p className='text-center text-gray-700 text-lg mb-6'>
            You currently have{' '}
            <span className='font-bold text-blue-600'>{remainingPosts}</span>{' '}
            recruitment post{remainingPosts > 1 ? 's' : ''} remaining.
            <br />
            Would you like to use one to skip payment?
          </p>
          <div className='flex justify-center space-x-6'>
            <button
              onClick={onCancel}
              className='px-6 py-3 rounded-lg bg-gray-200 text-gray-800 font-semibold shadow-md hover:bg-gray-300 transition duration-200'
            >
              No, Continue to Payment
            </button>
            <button
              onClick={onConfirm}
              className='px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold shadow-md hover:bg-blue-700 transition duration-200'
            >
              Yes, Skip Payment
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

SkipPaymentModal.propTypes = {
  remainingPosts: PropTypes.number.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default SkipPaymentModal;
