// ChatList.jsx
import React, { useState } from 'react';

const ChatList = ({ onSelectChat }) => {
  const [chats] = useState([
    {
      id: '1',
      isGroup: false,
      chatName: null,
      participants: [
        { user: { firstName: 'Alice' } },
        { user: { firstName: 'Bob' } }
      ],
      messages: [
        { content: 'Hello from Alice' },
        { content: 'How are you, Bob?' }
      ]
    },
    {
      id: '2',
      isGroup: true,
      chatName: 'Team Chat',
      participants: [
        { user: { firstName: 'Alice' } },
        { user: { firstName: 'Bob' } },
        { user: { firstName: 'Carol' } }
      ],
      messages: [
        { content: 'Welcome to the team!' },
        { content: 'First group message' }
      ]
    }
  ]);

  return (
    <div className='h-full flex flex-col'>
      {/* Pinned header */}
      <div className='p-4 border-b'>
        <h2 className='text-xl font-bold'>Your Chats</h2>
      </div>

      {/* Scrollable list */}
      <div className='flex-1 p-2 space-y-3 overflow-y-auto'>
        {chats.map(chat => {
          const lastMessage = chat.messages[chat.messages.length - 1];
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
        })}
      </div>

      {/* New Chat button pinned at bottom */}
      <div className='p-4 border-t'>
        <button className='w-full py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'>
          + New Chat
        </button>
      </div>
    </div>
  );
};

export default ChatList;
