// NetworkPage.jsx
import  { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import fallbackAvatar from '../assets/logo.png';

function NetworkPage() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch incoming (pending) connection requests on mount
  useEffect(() => {
    const fetchIncomingRequests = async () => {
      try {
        const response = await axios.get(
          'http://localhost:5200/api/connection/incoming',
          { headers: { Authorization: `Bearer ${token}` } }
        );
        // Expect the response to return an array of users who sent the requests
        setIncomingRequests(response.data.data.requests);
      } catch (error) {
        console.error('Error fetching incoming connection requests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchIncomingRequests();
  }, [token]);

  const handleConfirm = async followerId => {
    try {
      // Accept the connection request by posting the followerId.
      await axios.post(
        'http://localhost:5200/api/connection/accept',
        { followerId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      // Remove the accepted request from the list.
      setIncomingRequests(prev =>
        prev.filter(request => request.id !== followerId)
      );
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const handleReject = async followerId => {
    try {
      // Delete the connection (reject the request).
      await axios.delete(`http://localhost:5200/api/connection/${followerId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Remove the rejected request from the list.
      setIncomingRequests(prev =>
        prev.filter(request => request.id !== followerId)
      );
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  return (
    <div className='container mx-auto p-4'>
      <h1 className='text-2xl font-bold mb-4'>Incoming Connection Requests</h1>
      {loading ? (
        <p>Loading...</p>
      ) : incomingRequests.length === 0 ? (
        <p className='text-gray-500'>No incoming connection requests.</p>
      ) : (
        incomingRequests.map(request => (
          <div
            key={request.id}
            className='bg-white rounded-lg shadow p-4 flex items-center justify-between mb-4'
          >
            <div className='flex items-center'>
              <img
                src={request.imageUrl || fallbackAvatar}
                alt='Avatar'
                className='w-10 h-10 rounded-full mr-4 object-cover'
              />
              <div>
                <p className='font-semibold'>
                  {request.firstName} {request.lastName}
                </p>
                <p className='text-xs text-gray-500'>@{request.username}</p>
              </div>
            </div>
            <div className='flex space-x-2'>
              <button
                onClick={() => handleConfirm(request.id)}
                className='bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors'
              >
                Confirm
              </button>
              <button
                onClick={() => handleReject(request.id)}
                className='bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors'
              >
                Reject
              </button>
            </div>
          </div>
        ))
      )}
      <div className='mt-6'>
        <button
          onClick={() => navigate('/network')}
          className='bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors'
        >
          Refresh Requests
        </button>
      </div>
    </div>
  );
}

export default NetworkPage;
