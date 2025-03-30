import React, { useState } from 'react';
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

const SubscriptionModal = ({ onClose, onSelectPlan }) => {
  // Define your subscription plans.
  const plans = [
    { time: 1, price: 15 },
    { time: 5, price: 70 },
    { time: 10, price: 125 },
    { time: 15, price: 200 },
    { time: 20, price: 250 },
    { time: 30, price: 325 }
  ];

  const [selectedPlan, setSelectedPlan] = useState(null);

  const handleSelectPlan = plan => {
    setSelectedPlan(plan);
  };

  const handleProceed = () => {
    if (selectedPlan) {
      onSelectPlan(selectedPlan);
    } else {
      alert('Please select a subscription plan.');
    }
  };

  return (
    <div
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
      className='fixed inset-0 z-50 flex items-center justify-center'
    >
      {/* Animated gradient border container */}
      <div
        className='p-1 rounded-xl shadow-2xl max-w-md w-full'
        style={{
          background:
            'linear-gradient(270deg, #7e22ce, #3b82f6, #06b6d4, #10b981)',
          backgroundSize: '400% 400%',
          animation: 'gradientShift 10s ease infinite'
        }}
      >
        {/* Framer Motion wrapper for flip animation */}
        <motion.div
          className='bg-white rounded-xl p-8'
          variants={modalVariants}
          initial='hidden'
          animate='visible'
          exit='exit'
        >
          <div className='bg-gradient-to-r from-blue-600 to-teal-500 px-8 py-4'>
            <h2 className='text-3xl font-extrabold text-center text-white'>
              SUBSCRIBE PLAN
            </h2>
          </div>
          <p className='text-center text-gray-700 mb-6 mt-5'>
            INCREASE YOUR POSTING BY SUBSCRIBING THE PREMIUM PLAN!!!
          </p>
          <div className='grid grid-cols-2 gap-4'>
            {plans.map((plan, index) => (
              <div
                key={index}
                onClick={() => handleSelectPlan(plan)}
                className='bg-blue-700 text-white p-4 rounded-lg cursor-pointer hover:bg-blue-800 transition transform hover:scale-105'
                style={{ textAlign: 'center' }}
              >
                <h3 className='text-2xl font-bold'>
                  {plan.time.toString().padStart(2, '0')}
                </h3>
                <p className='text-lg'>TIME</p>
                <p className='mt-2 bg-white text-blue-700 rounded-lg py-1 font-semibold'>
                  {plan.price} DOLLARS
                </p>
              </div>
            ))}
          </div>
          {selectedPlan && (
            <div className='mt-4 p-3 border rounded-lg bg-gray-100 text-gray-800 text-center'>
              <p>
                <strong>Total Price:</strong> ${selectedPlan.price}
              </p>
            </div>
          )}
          <div className='mt-6 flex justify-end space-x-4'>
            <button
              onClick={onClose}
              className='px-4 py-2 rounded bg-gray-300 hover:bg-gray-400 transition-colors font-medium'
            >
              Close
            </button>
            <button
              onClick={handleProceed}
              className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition-colors font-medium'
            >
              Proceed to Payment
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

SubscriptionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelectPlan: PropTypes.func.isRequired
};

export default SubscriptionModal;
