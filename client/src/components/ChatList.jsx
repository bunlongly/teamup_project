// ChatList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateChatModal from './CreateChatModal';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredChats, setFilteredChats] = useState([]);
  const token = localStorage.getItem('token');

  const fetchChats = async () => {
    try {
      const res = await axios.get('http://localhost:5200/api/chats', {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('Fetched chats:', res.data.data);
      setChats(res.data.data);
    } catch (error) {
      console.error('Error fetching chats:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [token]);

  // Filter chats based on search term.
  useEffect(() => {
    const lowerSearch = searchTerm.toLowerCase();
    const filtered = chats.filter(chat => {
      if (chat.isGroup) {
        return chat.chatName?.toLowerCase().includes(lowerSearch);
      } else {
        // For individual chats, search by participants' first names.
        const names = chat.participants.map(p =>
          p.user.firstName.toLowerCase()
        );
        return names.some(name => name.includes(lowerSearch));
      }
    });
    setFilteredChats(filtered);
  }, [searchTerm, chats]);

  // When a new chat is created, add it to the top of the list
  const handleChatCreated = newChat => {
    setChats(prev => [newChat, ...prev]);
  };

  return (
    <div className='h-full flex flex-col bg-gray-100'>
      {/* Top Controls: Header, New Chat Button, and Search */}
      <div className='p-4 border-b bg-white shadow-md'>
        <div className='flex justify-between items-center mb-4'>
          <h2 className='text-2xl font-bold text-gray-800'>Your Chats</h2>
          <button
            onClick={() => setShowModal(true)}
            className='px-4 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors'
          >
            + New Chat
          </button>
        </div>
        <input
          type='text'
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          placeholder='Search chats or participants...'
          className='w-full border rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500'
        />
      </div>

      {/* Chat List */}
      <div className='flex-1 p-4 overflow-y-auto'>
        {loading ? (
          <p className='text-center text-gray-500'>Loading chats...</p>
        ) : (searchTerm ? filteredChats : chats).length > 0 ? (
          (searchTerm ? filteredChats : chats).map(chat => {
            // Safely get last message from messages array
            const lastMessage =
              (chat.messages || []).length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;
            return (
              <div
                key={chat.id}
                className='p-4 bg-white rounded-lg shadow-sm cursor-pointer hover:bg-blue-50 transition-colors mb-3'
                onClick={() => onSelectChat(chat)}
              >
                <p className='text-lg font-semibold text-gray-800'>
                  {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
                </p>
                <p className='text-sm text-gray-600 mt-1'>
                  Participants:{' '}
                  {chat.participants.map(p => p.user.firstName).join(', ')}
                </p>
                {lastMessage && (
                  <p className='text-sm text-gray-500 mt-2'>
                    Last message: {lastMessage.content}
                  </p>
                )}
              </div>
            );
          })
        ) : (
          <p className='text-center text-gray-500'>No chats found.</p>
        )}
      </div>

      {/* Modal for Creating New Chat */}
      {showModal && (
        <CreateChatModal
          onClose={() => setShowModal(false)}
          onChatCreated={handleChatCreated}
        />
      )}
    </div>
  );
};

export default ChatList;
