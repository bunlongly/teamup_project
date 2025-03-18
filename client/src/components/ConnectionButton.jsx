// ConnectionButton.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';
import PropTypes from 'prop-types';

function ConnectionButton({ profileUserId }) {
  const token = localStorage.getItem('token');
  const currentUserId = localStorage.getItem('userId');
  const [status, setStatus] = useState('not-connected'); // 'not-connected' | 'connected'

  useEffect(() => {
    if (profileUserId && profileUserId !== currentUserId) {
      axios
        .get(`http://localhost:5200/api/connection/status/${profileUserId}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(res => {
          setStatus(res.data.data.status); // expect 'connected' or 'not-connected'
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
        setStatus('connected');
      })
      .catch(error => {
        console.error('Error creating connection:', error);
      });
  };

  const handleDisconnect = () => {
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

  // Do not show the button if the current user is viewing their own profile
  if (profileUserId === currentUserId) {
    return null;
  }

  return (
    <div>
      {status === 'connected' ? (
        <button
          onClick={handleDisconnect}
          className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
        >
          Connected
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
        >
          Connect
        </button>
      )}
    </div>
  );
}

ConnectionButton.propTypes = {
  profileUserId: PropTypes.string.isRequired
};

export default ConnectionButton;
