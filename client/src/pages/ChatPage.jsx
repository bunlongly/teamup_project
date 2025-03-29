// ChatPage.jsx
import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import ChatList from '../components/ChatList';
import ChatWindow from '../components/ChatWindow';
import space from '../assets/css/space.jpeg';
import program from '../assets/css/program.jpeg';
import bear from '../assets/css/bear.jpeg';

const ChatPage = () => {
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatBackground, setChatBackground] = useState(''); // default background
  // Default chatColor is blue (#0046b0) but you can choose other colors, including black.
  const [chatColor, setChatColor] = useState('#0046b0');

  // Load stored background and color for the selected chat
  useEffect(() => {
    if (selectedChat && selectedChat.id) {
      const storedBg = localStorage.getItem(
        `chatBackground_${selectedChat.id}`
      );
      setChatBackground(storedBg || '');
      const storedColor = localStorage.getItem(`chatColor_${selectedChat.id}`);
      setChatColor(storedColor || '#0046b0');
    }
  }, [selectedChat]);

  // Set and persist background image for the selected chat
  const handleSetBackground = bg => {
    setChatBackground(bg);
    if (selectedChat && selectedChat.id) {
      localStorage.setItem(`chatBackground_${selectedChat.id}`, bg);
    }
  };

  // Set and persist text color for the selected chat
  const handleSetChatColor = color => {
    setChatColor(color);
    if (selectedChat && selectedChat.id) {
      localStorage.setItem(`chatColor_${selectedChat.id}`, color);
    }
  };

  // Inline RightColumn component displaying real data
  const RightColumn = ({
    chat,
    chatBackground,
    setChatBackground,
    chatColor,
    setChatColor
  }) => {
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
          <p className='text-sm text-gray-500'>
            Created by: {chat.createdBy ? chat.createdBy.name : 'Admin'}
          </p>
        </div>

        {/* Participants */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Participants</h3>
          <div className='space-y-2 mt-2'>
            {participants.map((p, idx) => (
              <div key={idx} className='flex items-center space-x-2'>
                <img
                  src={
                    p.user.imageUrl ||
                    `https://i.pravatar.cc/32?u=${p.user.firstName}`
                  }
                  alt={p.user.firstName}
                  className='w-8 h-8 rounded-full'
                />
                <div className='flex flex-col'>
                  <span className='text-sm'>
                    {p.user.firstName} {p.user.lastName || ''}
                  </span>
                  {p.role && (
                    <span className='text-xs text-gray-500'>{p.role}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Change Background */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Change Background</h3>
          <div className='flex space-x-2'>
            <button
              onClick={() => setChatBackground('/images/default.jpg')}
              className={`px-3 py-1 rounded ${
                chatBackground === '/images/default.jpg'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Default
            </button>
            <button
              onClick={() => setChatBackground(program)}
              className={`px-3 py-1 rounded ${
                chatBackground === program
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Program
            </button>
            <button
              onClick={() => setChatBackground(bear)}
              className={`px-3 py-1 rounded ${
                chatBackground === bear
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Kitty
            </button>
            <button
              onClick={() => setChatBackground(space)}
              className={`px-3 py-1 rounded ${
                chatBackground === space
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Space
            </button>
          </div>
        </div>

        {/* Change Color */}
        <div className='border-b pb-4 mb-4'>
          <h3 className='text-md font-semibold mb-1'>Change Text Color</h3>
          <div className='flex space-x-2'>
            <button
              onClick={() => setChatColor('#0046b0')}
              className={`px-3 py-1 rounded ${
                chatColor === '#0046b0'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Blue
            </button>
            <button
              onClick={() => setChatColor('#ffffff')}
              className={`px-3 py-1 rounded ${
                chatColor === '#ffffff'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              White
            </button>
            <button
              onClick={() => setChatColor('#ff0000')}
              className={`px-3 py-1 rounded ${
                chatColor === '#ff0000'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Red
            </button>
            <button
              onClick={() => setChatColor('#000000')}
              className={`px-3 py-1 rounded ${
                chatColor === '#000000'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              Black
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

  // Add prop types for RightColumn to validate chat.participants and others
  RightColumn.propTypes = {
    chat: PropTypes.shape({
      isGroup: PropTypes.bool,
      chatName: PropTypes.string,
      createdBy: PropTypes.shape({
        name: PropTypes.string
      }),
      participants: PropTypes.arrayOf(
        PropTypes.shape({
          user: PropTypes.shape({
            firstName: PropTypes.string.isRequired,
            lastName: PropTypes.string,
            imageUrl: PropTypes.string
          }).isRequired,
          role: PropTypes.string
        })
      )
    }),
    chatBackground: PropTypes.string.isRequired,
    setChatBackground: PropTypes.func.isRequired,
    chatColor: PropTypes.string.isRequired,
    setChatColor: PropTypes.func.isRequired
  };

  return (
    <div className='flex h-screen'>
      {/* Left Column */}
      <div className='w-1/4 bg-white border-r overflow-y-auto'>
        <ChatList onSelectChat={setSelectedChat} />
      </div>
      {/* Middle Column */}
      <div className='flex-1 flex flex-col overflow-hidden'>
        <ChatWindow
          chat={selectedChat}
          backgroundUrl={chatBackground}
          headerColor={chatColor}
        />
      </div>
      {/* Right Column */}
      <div className='w-1/4 bg-white border-l overflow-y-auto'>
        <RightColumn
          chat={selectedChat}
          chatBackground={chatBackground}
          setChatBackground={handleSetBackground}
          chatColor={chatColor}
          setChatColor={handleSetChatColor}
        />
      </div>
    </div>
  );
};

export default ChatPage;
