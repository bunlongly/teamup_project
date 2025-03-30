import React, { useState } from 'react';
import PropTypes from 'prop-types';

const SubscriptionModal = ({ onClose, onSelectPlan }) => {
  // Define your subscription plans
  const plans = [
    { time: 1, price: 15 },
    { time: 5, price: 70 },
    { time: 10, price: 125 },
    { time: 15, price: 200 },
    { time: 20, price: 250 },
    { time: 30, price: 325 }
  ];

  // Use the index to track the selected plan
  const [selectedPlanIndex, setSelectedPlanIndex] = useState(null);
  const selectedPlan =
    selectedPlanIndex !== null ? plans[selectedPlanIndex] : null;

  const handleSelect = index => {
    setSelectedPlanIndex(index);
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
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      className='fixed inset-0 z-50 flex items-center justify-center'
    >
      <div className='bg-white p-6 rounded-lg shadow-lg max-w-md w-full'>
        <h2 className='text-xl font-bold mb-4'>Select a Subscription Plan</h2>
        <ul className='space-y-2'>
          {plans.map((plan, index) => (
            <li
              key={index}
              onClick={() => handleSelect(index)}
              className={`cursor-pointer p-3 border rounded-md flex justify-between transition-colors ${
                selectedPlanIndex === index
                  ? 'bg-blue-600 text-white border-blue-600'
                  : 'bg-white text-gray-800 border-gray-300'
              }`}
            >
              <span>
                {plan.time} post{plan.time > 1 ? 's' : ''}
              </span>
              <span>${plan.price}</span>
            </li>
          ))}
        </ul>
        {selectedPlan && (
          <div className='mt-4 p-3 border rounded-md bg-gray-100 text-gray-800'>
            <p>
              <strong>Total Price:</strong> ${selectedPlan.price}
            </p>
          </div>
        )}
        <div className='mt-6 flex justify-end space-x-4'>
          <button
            onClick={onClose}
            className='px-4 py-2 rounded bg-gray-300 hover:bg-gray-400'
          >
            Close
          </button>
          <button
            onClick={handleProceed}
            className='px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700'
          >
            Proceed to Payment
          </button>
        </div>
      </div>
    </div>
  );
};

SubscriptionModal.propTypes = {
  onClose: PropTypes.func.isRequired,
  onSelectPlan: PropTypes.func.isRequired
};

export default SubscriptionModal;
