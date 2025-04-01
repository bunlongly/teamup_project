// import React from 'react';
import PropTypes from 'prop-types';

const PreviewSubmissionModal = ({ submissionData, onConfirm, onCancel }) => {
  // Check if the file is an image (assuming a File object with type like "image/png")
  const isImageFile =
    submissionData.attachment &&
    submissionData.attachment.type &&
    submissionData.attachment.type.startsWith('image/');

  return (
    // Use a transparent black background via Tailwind classes
    <div
      className='fixed inset-0 z-50 flex items-center justify-center'
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.6)' }}
    >
      {/* Modal Box */}
      <div className='bg-white rounded-lg p-6 w-full max-w-lg transform transition-all duration-300'>
        <h2 className='text-2xl font-bold mb-4'>Preview Your Submission</h2>

        {/* Timestamp */}
        {submissionData.timestamp && (
          <p className='text-sm text-gray-500 mb-4'>
            Submitting at: {submissionData.timestamp}
          </p>
        )}

        <div className='space-y-3'>
          {/* Links */}
          <div>
            <h3 className='font-semibold'>Links:</h3>
            <ul className='list-disc list-inside'>
              {submissionData.links && submissionData.links.length > 0 ? (
                submissionData.links.map((link, index) => (
                  <li key={index} className='text-blue-600 break-all'>
                    {link}
                  </li>
                ))
              ) : (
                <li>No links provided</li>
              )}
            </ul>
          </div>

          {/* Comment */}
          <div>
            <h3 className='font-semibold'>Comment:</h3>
            <p>{submissionData.comment || 'No comment provided.'}</p>
          </div>

          {/* Attachment Preview */}
          {submissionData.attachment && (
            <div>
              <h3 className='font-semibold'>Attachment:</h3>
              {isImageFile ? (
                // Show an image preview
                <div className='mt-2'>
                  <img
                    src={URL.createObjectURL(submissionData.attachment)}
                    alt='Attachment Preview'
                    className='w-48 h-auto border rounded'
                  />
                  <p className='text-sm text-gray-500 mt-1 break-all'>
                    {submissionData.attachment.name}
                  </p>
                </div>
              ) : (
                // If it's not an image, just show the file name
                <p className='break-all'>{submissionData.attachment.name}</p>
              )}
            </div>
          )}

          {/* Report Reason */}
          {submissionData.reportReason && (
            <div>
              <h3 className='font-semibold text-red-600'>Report Reason:</h3>
              <p>{submissionData.reportReason}</p>
            </div>
          )}
        </div>

        <div className='mt-6 flex justify-end space-x-4'>
          <button
            onClick={onCancel}
            className='px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors'
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
          >
            Confirm Submission
          </button>
        </div>
      </div>
    </div>
  );
};

PreviewSubmissionModal.propTypes = {
  submissionData: PropTypes.shape({
    links: PropTypes.arrayOf(PropTypes.string),
    comment: PropTypes.string,
    attachment: PropTypes.object, 
    reportReason: PropTypes.string,
    timestamp: PropTypes.string
  }).isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};

export default PreviewSubmissionModal;
