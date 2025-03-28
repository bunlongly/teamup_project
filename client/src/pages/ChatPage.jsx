// ChatPage.jsx
import React, { useState } from 'react';
import ChatList from '../components/ChatList';
import ChatWindow from '../components//ChatWindow';

// Predefined background images (stored in /public or on your server)
const BACKGROUNDS = [
  { label: 'Default', url: '' },
  { label: 'Mountains', url: '/images/mountains.jpg' },
  { label: 'Beach', url: '/images/beach.jpg' },
  { label: 'City', url: '/images/city.jpg' }
];

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBackground, setChatBackground] = useState('');

  // Right column (inline) with participants + background image picker
  const RightColumn = ({ chat }) => {
    const participants = chat?.participants || [];

    if (!chat) {
      return (
        <div className='p-4 text-gray-500'>Select a chat to see details</div>
      );
    }

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

        {/* Change Background Image */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Change Background</h3>
          <p className='text-xs text-gray-500 mb-2'>
            Choose a background for the middle column:
          </p>
          <div className='flex flex-col space-y-2'>
            {BACKGROUNDS.map(bg => (
              <button
                key={bg.label}
                onClick={() => setChatBackground(bg.url)}
                className={`px-3 py-1 text-sm rounded ${
                  chatBackground === bg.url
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {bg.label}
              </button>
            ))}
          </div>
        </div>

        {/* Additional placeholders */}
        <div className='flex-1 overflow-y-auto'>
          <h3 className='text-md font-semibold mb-1 mt-2'>
            Other Chat Details
          </h3>
          <p className='text-sm text-gray-500'>
            Add more info or controls here...
          </p>
        </div>
      </div>
    );
  };

  return (
    <div className='flex h-screen'>
      {/* Left Column (Chat List) */}
      <div className='w-1/4 bg-white border-r overflow-y-auto'>
        <ChatList onSelectChat={setSelectedChat} />
      </div>

      {/* Middle Column (Chat Window) */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <ChatWindow chat={selectedChat} backgroundUrl={chatBackground} />
      </div>

      {/* Right Column (Chat Details + BG) */}
      <div className='w-1/4 bg-white border-l overflow-y-auto'>
        <RightColumn chat={selectedChat} />
      </div>
    </div>
  );
};

export default ChatPage;
