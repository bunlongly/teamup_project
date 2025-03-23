import React from "react";

const SubscriptionModal = ({ onClose }) => {
  const plans = [
    { time: 1, price: 15 },
    { time: 5, price: 70 },
    { time: 10, price: 125 },
    { time: 15, price: 200 },
    { time: 20, price: 250 },
    { time: 30, price: 325 },
  ];

  const handleSelectPlan = (plan) => {
    console.log(`Selected plan: ${plan.time} times for $${plan.price}`);
    // Add payment or subscription logic here
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-gradient-to-b from-blue-600 to-blue-300 rounded-lg p-8 w-[500px] text-center relative">
        <button className="absolute top-4 right-4 text-white text-lg" onClick={onClose}>
          &times;
        </button>
        <h2 className="text-white text-xl font-bold mb-2">
          <span className="text-blue-200">SUBSCRIBE</span> PLAN
        </h2>
        <p className="text-white text-sm mb-4">
          INCREASE YOUR POSTING BY SUBSCRIBING TO THE PREMIUM PLAN!!!
        </p>
        <div className="grid grid-cols-3 gap-4">
          {plans.map((plan, index) => (
            <div
              key={index}
              className="bg-blue-700 text-white p-4 rounded-lg cursor-pointer hover:bg-blue-800 transition"
              onClick={() => handleSelectPlan(plan)}
            >
              <h3 className="text-2xl font-bold">{plan.time.toString().padStart(2, "0")}</h3>
              <p className="text-lg">TIME</p>
              <p className="mt-2 bg-white text-blue-700 rounded-lg py-1 font-semibold">
                {plan.price} DOLLARS
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SubscriptionModal;
