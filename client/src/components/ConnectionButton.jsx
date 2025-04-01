// ConnectionButton.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function ConnectionButton({ profileUserId }) {
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  /**
   * statusObj holds two fields:
   * type: 'none' | 'sent' | 'received'
   * value: 'not-connected' | 'pending' | 'accepted'
   */
  const [statusObj, setStatusObj] = useState({
    type: 'none',
    value: 'not-connected'
  });

  useEffect(() => {
    if (profileUserId && profileUserId !== currentUserId) {
      axios
        .get(`http://localhost:5200/api/connection/status/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
        
          const connection = res.data.data.connection;
          if (connection) {
            // If the current user is the sender
            if (connection.followerId === currentUserId) {
              setStatusObj({
                type: 'sent',
                value: connection.status.toLowerCase()
              });
            }
            // If the current user is the receiver
            else if (connection.followingId === currentUserId) {
              setStatusObj({
                type: 'received',
                value: connection.status.toLowerCase()
              });
            }
          } else {
            setStatusObj({ type: 'none', value: 'not-connected' });
          }
        })
        .catch(error => {
          console.error('Error fetching connection status:', error);
        });
    }
  }, [profileUserId, currentUserId, token]);

  // For sender: when no connection exists, clicking Connect sends a request.
  const handleConnect = () => {
    axios
      .post(
        'http://localhost:5200/api/connection/create',
        { userId: profileUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        // Set status as pending (for sent requests)
        setStatusObj({ type: 'sent', value: 'pending' });
      })
      .catch(error => {
        console.error('Error creating connection:', error);
      });
  };

  // For either sender (cancel) or receiver (reject) action.
  const handleCancelRequest = () => {
    axios
      .delete(`http://localhost:5200/api/connection/${profileUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setStatusObj({ type: 'none', value: 'not-connected' });
      })
      .catch(error => {
        console.error('Error deleting connection:', error);
      });
  };

  // For receiver: confirm the request.
  const handleConfirmRequest = () => {
    axios
      .post(
        'http://localhost:5200/api/connection/accept',
        { followerId: profileUserId }, // the sender's id is passed as followerId
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        setStatusObj({ type: 'received', value: 'accepted' });
      })
      .catch(error => {
        console.error('Error accepting connection:', error);
      });
  };

  // Do not render the button if the current user is viewing their own profile.
  if (profileUserId === currentUserId) {
    return null;
  }

  // Render based on the type and status:
  // If no connection exists, show "Connect"
  if (statusObj.type === 'none') {
    return (
      <button
        onClick={handleConnect}
        className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
      >
        Connect
      </button>
    );
  }

  // If the current user sent the request
  if (statusObj.type === 'sent') {
    if (statusObj.value === 'pending') {
      return (
        <button
          onClick={handleCancelRequest}
          className='bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors'
        >
          Cancel Request
        </button>
      );
    }
    if (statusObj.value === 'accepted') {
      return (
        <button
          onClick={handleCancelRequest}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
        >
          Connected
        </button>
      );
    }
  }

  // If the current user is receiving the request
  if (statusObj.type === 'received') {
    if (statusObj.value === 'pending') {
      return (
        <div className='flex space-x-2'>
          <button
            onClick={handleConfirmRequest}
            className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
          >
            Confirm
          </button>
          <button
            onClick={handleCancelRequest}
            className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors'
          >
            Reject
          </button>
        </div>
      );
    }
    if (statusObj.value === 'accepted') {
      return (
        <button
          onClick={handleCancelRequest}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
        >
          Connected
        </button>
      );
    }
  }

  // Fallback rendering
  return (
    <button
      onClick={handleConnect}
      className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
    >
      Connect
    </button>
  );
}

ConnectionButton.propTypes = {
  profileUserId: PropTypes.string.isRequired
};

export default ConnectionButton;
