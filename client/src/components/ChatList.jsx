// ChatList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateChatModal from './CreateChatModal';

const ChatList = ({ onSelectChat }) => {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
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

  // When a new chat is created, add it to the top of the list
  const handleChatCreated = newChat => {
    setChats(prev => [newChat, ...prev]);
  };

  return (
    <div className='h-full flex flex-col'>
      {/* Pinned header */}
      <div className='p-4 border-b'>
        <h2 className='text-xl font-bold'>Your Chats</h2>
      </div>

      {/* Chat list */}
      <div className='flex-1 p-2 space-y-3 overflow-y-auto'>
        {loading ? (
          <p>Loading chats...</p>
        ) : (
          chats.map(chat => {
            // Safely get last message from messages array
            const lastMessage =
              (chat.messages || []).length > 0
                ? chat.messages[chat.messages.length - 1]
                : null;
            return (
              <div
                key={chat.id}
                className='p-3 bg-gray-50 border rounded cursor-pointer hover:bg-gray-100'
                onClick={() => onSelectChat(chat)}
              >
                <p className='font-semibold'>
                  {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
                </p>
                <p className='text-sm text-gray-600'>
                  Participants:{' '}
                  {chat.participants.map(p => p.user.firstName).join(', ')}
                </p>
                {lastMessage && (
                  <p className='text-sm text-gray-500'>
                    Last message: {lastMessage.content}
                  </p>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* New Chat button pinned at bottom */}
      <div className='p-4 border-t'>
        <button
          onClick={() => setShowModal(true)}
          className='w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
        >
          + New Chat
        </button>
      </div>

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
