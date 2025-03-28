// CreateChatModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';

const CreateChatModal = ({ onClose, onChatCreated }) => {
  const [isGroup, setIsGroup] = useState(false);
  const [chatName, setChatName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');

  // Get the current user's ID from localStorage
  const currentUserId = localStorage.getItem('userId');

  console.log('Token:', token);
  console.log('Current User ID:', currentUserId);

  // Debounced search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (searchQuery.trim()) {
        console.log('Searching for:', searchQuery);
        axios
          // Adjust URL if your user routes are mounted on /api/users
          .get(
            `http://localhost:5200/api/user/search?search=${encodeURIComponent(
              searchQuery
            )}`,
            {
              headers: { Authorization: `Bearer ${token}` }
            }
          )
          .then(res => {
            console.log('Search results:', res.data.data);
            setSearchResults(res.data.data);
          })
          .catch(error => {
            console.error('Error searching users:', error);
          });
      } else {
        setSearchResults([]);
      }
    }, 300); // delay 300ms

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  // Add user if not already selected
  const addParticipant = user => {
    console.log('Adding participant:', user);
    if (!selectedParticipants.find(p => p.id === user.id)) {
      setSelectedParticipants([...selectedParticipants, user]);
    }
  };

  // Remove a participant by id
  const removeParticipant = userId => {
    console.log('Removing participant with ID:', userId);
    setSelectedParticipants(selectedParticipants.filter(p => p.id !== userId));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      // Build the array of participant IDs from selected participants
      let participantIds = selectedParticipants.map(p => p.id);
      console.log(
        'Selected participant IDs before adding current user:',
        participantIds
      );

      // Ensure the current user is included
      if (!participantIds.includes(currentUserId)) {
        participantIds.push(currentUserId);
      }
      console.log('Final participant IDs:', participantIds);

      // For individual chats, enforce exactly 2 participants
      if (!isGroup && participantIds.length !== 2) {
        alert('Individual chats must have exactly 2 participants.');
        setLoading(false);
        return;
      }

      const response = await axios.post(
        'http://localhost:5200/api/chats',
        {
          isGroup,
          chatName: isGroup ? chatName : null,
          participantIds
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Chat created successfully:', response.data.data);
      onChatCreated(response.data.data);
      onClose();
    } catch (error) {
      console.error('Error creating chat:', error);
      // Optionally display an error message here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
      <div className='bg-white rounded p-6 w-96'>
        <h2 className='text-xl font-bold mb-4'>Create New Chat</h2>
        <form onSubmit={handleSubmit}>
          <div className='mb-4'>
            <label className='inline-flex items-center'>
              <input
                type='checkbox'
                checked={isGroup}
                onChange={e => setIsGroup(e.target.checked)}
                className='form-checkbox'
              />
              <span className='ml-2'>Group Chat</span>
            </label>
          </div>
          {isGroup && (
            <div className='mb-4'>
              <label className='block text-sm font-medium mb-1'>
                Chat Name
              </label>
              <input
                type='text'
                value={chatName}
                onChange={e => setChatName(e.target.value)}
                className='w-full border rounded px-3 py-2'
                required
              />
            </div>
          )}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>
              Search Users
            </label>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Type to search users...'
              className='w-full border rounded px-3 py-2'
            />
            {searchResults.length > 0 && (
              <ul className='mt-2 border rounded max-h-40 overflow-y-auto'>
                {searchResults.map(user => (
                  <li
                    key={user.id}
                    className='p-2 hover:bg-gray-100 cursor-pointer'
                    onClick={() => addParticipant(user)}
                  >
                    {user.firstName} {user.lastName} ({user.username})
                  </li>
                ))}
              </ul>
            )}
          </div>
          {selectedParticipants.length > 0 && (
            <div className='mb-4'>
              <h3 className='text-sm font-medium'>Selected Participants:</h3>
              <ul className='mt-1 space-y-1'>
                {selectedParticipants.map(user => (
                  <li
                    key={user.id}
                    className='flex justify-between items-center'
                  >
                    <span>
                      {user.firstName} {user.lastName}
                    </span>
                    <button
                      type='button'
                      onClick={() => removeParticipant(user.id)}
                      className='text-red-500 text-xs'
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className='flex justify-end space-x-2'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 border rounded'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={loading}
              className='px-4 py-2 bg-blue-600 text-white rounded'
            >
              {loading ? 'Creating...' : 'Create Chat'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateChatModal;
