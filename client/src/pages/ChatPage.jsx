// ChatPage.jsx
import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBackground, setChatBackground] = useState('');

  // Inline RightColumn: displays chat details & lets user change the background.
  const RightColumn = ({ chat }) => {
    if (!chat) {
      return (
        <div className='p-4 text-gray-500'>Select a chat to see details.</div>
      );
    }
    const participants = chat.participants || [];

    return (
      <div className='p-4 h-full flex flex-col'>
        {/* Chat Info */}
        <div className='border-b pb-4 mb-4'>
          <h2 className='text-xl font-bold mb-1'>
            {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
          </h2>
          <p className='text-sm text-gray-500'>Created by ???, May 2020</p>
        </div>

        {/* Participants */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Participants</h3>
          <div className='space-y-2 mt-2'>
            {participants.map((p, idx) => (
              <div key={idx} className='flex items-center space-x-2'>
                <img
                  src={`https://i.pravatar.cc/32?u=${p.user.firstName}`}
                  alt={p.user.firstName}
                  className='w-8 h-8 rounded-full'
                />
                <span className='text-sm'>{p.user.firstName}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Change Background */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Change Background</h3>
          <div className='flex space-x-2'>
            <button
              onClick={() => setChatBackground('')}
              className={`px-3 py-1 rounded ${
                chatBackground === ''
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setChatBackground('/images/mountains.jpg')}
              className={`px-3 py-1 rounded ${
                chatBackground === '/images/mountains.jpg'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Mountains
            </button>
            <button
              onClick={() => setChatBackground('/images/beach.jpg')}
              className={`px-3 py-1 rounded ${
                chatBackground === '/images/beach.jpg'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Beach
            </button>
          </div>
        </div>

        <div className='flex-1 overflow-y-auto'>
          <h3 className='text-md font-semibold mb-1'>Other Chat Details</h3>
          <p className='text-sm text-gray-500'>
            Additional info or controls can go here.
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className='flex h-screen'>
      {/* Left Column */}
      <div className='w-1/4 bg-white border-r overflow-y-auto'>
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      {/* Middle Column */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <ChatWindow chat={selectedChat} backgroundUrl={chatBackground} />
      </div>

      {/* Right Column */}
      <div className='w-1/4 bg-white border-l overflow-y-auto'>
        <RightColumn chat={selectedChat} />
      </div>
    </div>
  );
};

export default ChatPage;
