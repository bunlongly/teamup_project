// NotificationPage.jsx
import { useState, useEffect } from 'react';
import axios from 'axios';

function NotificationPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem('token');

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5200/api/notifications',
          {
            headers: { Authorization: `Bearer ${token}` }
          }
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

  if (loading) {
    return <p>Loading notifications...</p>;
  }

  if (notifications.length === 0) {
    return <p>No notifications available.</p>;
  }

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Notifications</h1>
      <ul className='space-y-4'>
        {notifications.map(notif => (
          <li key={notif.id} className='bg-white rounded shadow p-4'>
            <div className='flex items-center justify-between'>
              <p className='font-semibold'>
                {notif.type === 'connection_request'
                  ? 'Connection Request'
                  : notif.type === 'connection_accepted'
                  ? 'Request Accepted'
                  : notif.type}
              </p>
              <p className='text-xs text-gray-500'>
                {new Date(notif.createdAt).toLocaleString()}
              </p>
            </div>
            <p className='mt-2 text-gray-700'>{notif.message}</p>
            {notif.sender && (
              <p className='text-sm text-gray-500'>
                From: {notif.sender.firstName} {notif.sender.lastName}
              </p>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default NotificationPage;
