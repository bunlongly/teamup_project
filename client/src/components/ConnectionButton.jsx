// ConnectionButton.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function ConnectionButton({ profileUserId }) {
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  // Status can be 'not-connected', 'pending', or 'accepted'
  const [status, setStatus] = useState('not-connected');

  useEffect(() => {
    if (profileUserId && profileUserId !== currentUserId) {
      axios
        .get(`http://localhost:5200/api/connection/status/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          // Convert the status to lowercase so that our UI conditions match
          const dbStatus = res.data.data.status;
          setStatus(dbStatus ? dbStatus.toLowerCase() : 'not-connected');
        })
        .catch(error => {
          console.error('Error fetching connection status:', error);
        });
    }
  }, [profileUserId, currentUserId, token]);

  const handleConnect = () => {
    axios
      .post(
        'http://localhost:5200/api/connection/create',
        { userId: profileUserId },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      .then(() => {
        // Set status to pending upon successful creation
        setStatus('pending');
      })
      .catch(error => {
        console.error('Error creating connection:', error);
      });
  };

  const handleCancelRequest = () => {
    axios
      .delete(`http://localhost:5200/api/connection/${profileUserId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(() => {
        setStatus('not-connected');
      })
      .catch(error => {
        console.error('Error deleting connection:', error);
      });
  };

  // Do not render the button if the current user is viewing their own profile.
  if (profileUserId === currentUserId) {
    return null;
  }

  if (status === 'pending') {
    return (
      <button
        onClick={handleCancelRequest}
        className='bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors'
      >
        Cancel Request
      </button>
    );
  }

  if (status === 'accepted') {
    return (
      <button
        onClick={handleCancelRequest}
        className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
      >
        Connected
      </button>
    );
  }

  // Default: no connection exists yet, so show "Connect" button.
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
