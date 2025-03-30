import React, { useState, useEffect } from 'react';
import axios from 'axios';
import fallbackAvatar from '../assets/logo.png';
import PropTypes from 'prop-types';

// Helper function to format a date as "time ago"
function formatTimeAgo(dateString) {
  const date = new Date(dateString);
  const now = new Date();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return `${diff} seconds ago`;
  if (diff < 3600) {
    const minutes = Math.floor(diff / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
  }
  if (diff < 86400) {
    const hours = Math.floor(diff / 3600);
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  const days = Math.floor(diff / 86400);
  return `${days} day${days > 1 ? 's' : ''} ago`;
}

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(10); // how many to show initially
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5200/api/notifications',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Assuming your backend returns { data: { notifications: [...] } }
        setNotifications(response.data.data.notifications || []);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [token]);

  // Handler to dismiss a notification from UI (and optionally call backend)
  const handleDismiss = notifId => {
    setNotifications(prev => prev.filter(n => n.id !== notifId));
  };

  // Load next 10 notifications
  const handleViewMore = () => {
    setVisibleCount(prev => prev + 10);
  };

  if (loading) {
    return <p className='p-4'>Loading notifications...</p>;
  }

  if (!notifications.length) {
    return <p className='p-4'>No notifications available.</p>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Notifications</h1>
      <ul className='space-y-4'>
        {notifications.slice(0, visibleCount).map(notif => (
          <NotificationCard
            key={notif.id}
            notif={notif}
            onDismiss={() => handleDismiss(notif.id)}
          />
        ))}
      </ul>
      {notifications.length > visibleCount && (
        <div className='mt-4 text-center'>
          <button
            onClick={handleViewMore}
            className='px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors'
          >
            View More
          </button>
        </div>
      )}
    </div>
  );
}

NotificationPage.propTypes = {};

function NotificationCard({ notif, onDismiss }) {
  const { sender, message, createdAt, type } = notif;
  const senderImage = sender?.imageUrl || fallbackAvatar;
  const senderName = sender
    ? `${sender.firstName} ${sender.lastName}`
    : 'Unknown User';

  // Determine a friendly label for the notification type.
  let label = type;
  if (type === 'application_request') label = 'Application Request';
  if (type === 'application_approved') label = 'Application Approved';
  if (type === 'application_rejected') label = 'Application Rejected';
  // You can add other types as needed.

  // If notification is older than 24 hours, apply a different background color.
  const isOld = new Date() - new Date(createdAt) > 8 * 60 * 60 * 1000;
  const cardBgClass = isOld ? 'bg-blue-100' : 'bg-white';

  return (
    <li className={`${cardBgClass} rounded shadow p-4 flex items-center`}>
      <img
        src={senderImage}
        alt='Sender Avatar'
        className='w-10 h-10 rounded-full mr-4 object-cover'
      />
      <div className='flex-1'>
        <p className='font-semibold text-gray-800'>{label}</p>
        <p className='text-sm text-gray-600'>{message}</p>
        <p className='text-xs text-gray-400 mt-1'>
          From: {senderName} • {formatTimeAgo(createdAt)}
        </p>
      </div>
      <div className='flex flex-col items-end'>
        <button
          onClick={onDismiss}
          className='p-2 bg-gray-200 rounded-full hover:bg-gray-300 transition-colors'
          title='Dismiss notification'
        >
          <svg
            xmlns='http://www.w3.org/2000/svg'
            className='h-5 w-5 text-gray-600'
            fill='none'
            viewBox='0 0 24 24'
            stroke='currentColor'
          >
            <path
              strokeLinecap='round'
              strokeLinejoin='round'
              strokeWidth={2}
              d='M6 18L18 6M6 6l12 12'
            />
          </svg>
        </button>
      </div>
    </li>
  );
}

NotificationCard.propTypes = {
  notif: PropTypes.shape({
    id: PropTypes.string.isRequired,
    message: PropTypes.string,
    createdAt: PropTypes.string,
    type: PropTypes.string,
    sender: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
      imageUrl: PropTypes.string
    })
  }).isRequired,
  onDismiss: PropTypes.func.isRequired
};

export default NotificationPage;
