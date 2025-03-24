// import React from 'react';
import PropTypes from 'prop-types';

const DeleteTaskModal = ({ task, onClose, onConfirm }) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black opacity-50"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-lg shadow-lg z-10 p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Confirm Delete Task</h2>
        <p className="mb-2">
          <strong>Task:</strong> {task.name}
        </p>
        <p className="mb-2">
          <strong>Assigned to:</strong>{" "}
          {task.assignedTo
            ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
            : "N/A"}
        </p>
        <p className="mb-4">
          <strong>Status:</strong> {task.status}
        </p>
        <p className="mb-4 text-gray-700">
          Are you sure you want to delete this task?
        </p>
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="mr-2 px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(task.id)}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

DeleteTaskModal.propTypes = {
  task: PropTypes.object.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired
};

export default DeleteTaskModal;
