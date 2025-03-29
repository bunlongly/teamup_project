// ChatWindow.jsx
import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { ReactMic } from 'react-mic';
import {
  FaPaperclip,
  FaMicrophone,
  FaPaperPlane,
  FaArrowUp,
  FaArrowDown
} from 'react-icons/fa';

// Helper function to lighten (or darken) a hex color by a percentage.
// percent should be a number between -1 (darken) and 1 (lighten)
const shadeColor = (color, percent) => {
  const f = parseInt(color.slice(1), 16);
  const t = percent < 0 ? 0 : 255;
  const p = percent < 0 ? -percent : percent;
  const R = f >> 16;
  const G = (f >> 8) & 0x00ff;
  const B = f & 0x0000ff;
  const newColor =
    '#' +
    (
      0x1000000 +
      (Math.round((t - R) * p) + R) * 0x10000 +
      (Math.round((t - G) * p) + G) * 0x100 +
      (Math.round((t - B) * p) + B)
    )
      .toString(16)
      .slice(1);
  return newColor;
};

// Helper function to get contrast color (black or white) based on brightness
const getContrastColor = hex => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  return luminance > 0.6 ? '#000000' : '#ffffff';
};

const ChatWindow = ({
  chat,
  socket,
  currentUser,
  backgroundUrl,
  headerColor
}) => {
  // ---------------------------
  // Messages and input states
  // ---------------------------
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const token = localStorage.getItem('token');

  // ---------------------------
  // Voice recorder states
  // ---------------------------
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // ---------------------------
  // Background fade animation states
  // ---------------------------
  const [displayedBg, setDisplayedBg] = useState(backgroundUrl);
  const [fadeClass, setFadeClass] = useState('opacity-100');

  // Animate the background whenever backgroundUrl changes
  useEffect(() => {
    if (backgroundUrl !== displayedBg) {
      setFadeClass('opacity-0 transition-opacity duration-500');
      const timeout = setTimeout(() => {
        setDisplayedBg(backgroundUrl);
        setFadeClass('opacity-0');
        setTimeout(() => {
          setFadeClass('opacity-100 transition-opacity duration-500');
        }, 50);
      }, 500);
      return () => clearTimeout(timeout);
    }
  }, [backgroundUrl, displayedBg]);

  // Helper to check if backgroundUrl is a hex color
  const isColor = bg => /^#([0-9A-F]{3}){1,2}$/i.test(bg);

  // Set background style based on whether it is an image or a color
  const backgroundStyle = isColor(displayedBg)
    ? { backgroundColor: displayedBg }
    : {
        backgroundImage: displayedBg ? `url(${displayedBg})` : 'none',
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center'
      };

  // ---------------------------
  // Fetch messages when chat is selected
  // ---------------------------
  const fetchMessages = async () => {
    if (!chat) return;
    setLoadingMessages(true);
    try {
      const res = await axios.get(
        `http://localhost:5200/api/chats/${chat.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(res.data.data);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (chat) {
      fetchMessages();
    }
  }, [chat, token]);

  // ---------------------------
  // Send text message
  // ---------------------------
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const msgData = { content: newMessage, attachment: null };
      const res = await axios.post(
        `http://localhost:5200/api/chats/${chat.id}/messages`,
        msgData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      socket?.emit('send_message', res.data.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // ---------------------------
  // Voice recorder functions
  // ---------------------------
  const recordAudio = () => setIsRecording(true);
  const stopRecording = () => setIsRecording(false);
  const onStopRecording = async recordedData => {
    if (recordedData.blob && recordedData.blob.size > 0) {
      const audioUrl = URL.createObjectURL(recordedData.blob);
      try {
        const msgData = { content: null, attachment: audioUrl };
        const res = await axios.post(
          `http://localhost:5200/api/chats/${chat.id}/messages`,
          msgData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessages(prev => [...prev, res.data.data]);
        socket?.emit('send_message', res.data.data);
      } catch (error) {
        console.error('Error sending audio message:', error);
      }
    }
    setShowRecorder(false);
  };

  // ---------------------------
  // Search Conversations Feature
  // ---------------------------
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]); // stores message indexes that match
  const [currentSearchIndex, setCurrentSearchIndex] = useState(0);
  const messageRefs = useRef({});

  // Escape special regex characters from search query
  const escapeRegExp = string => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  // Highlight matching text portions in a message
  const highlightText = (text, query) => {
    if (!query) return text;
    const escapedQuery = escapeRegExp(query);
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) =>
      regex.test(part) ? (
        <span
          key={i}
          style={{
            backgroundColor: '#0046b0',
            color: '#fff',
            padding: '0 2px'
          }}
        >
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  // Update search results whenever searchQuery or messages change
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setCurrentSearchIndex(0);
      return;
    }
    const results = messages
      .map((msg, idx) => {
        if (
          msg.content &&
          msg.content.toLowerCase().includes(searchQuery.toLowerCase())
        ) {
          return idx;
        }
        return null;
      })
      .filter(idx => idx !== null);
    setSearchResults(results);
    setCurrentSearchIndex(results.length > 0 ? 0 : -1);
  }, [searchQuery, messages]);

  // Scroll to the currently selected search result
  useEffect(() => {
    if (searchResults.length > 0 && currentSearchIndex >= 0) {
      const idx = searchResults[currentSearchIndex];
      const element = messageRefs.current[idx];
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [currentSearchIndex, searchResults]);

  const handleNextSearch = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex(prev => (prev + 1) % searchResults.length);
  };

  const handlePrevSearch = () => {
    if (searchResults.length === 0) return;
    setCurrentSearchIndex(prev =>
      prev === 0 ? searchResults.length - 1 : prev - 1
    );
  };

  if (!chat) {
    return (
      <div className='p-4 text-gray-500'>Select a chat to start messaging.</div>
    );
  }

  const userId = currentUser?.id || currentUser?.userId;
  const canSend = newMessage.trim().length > 0;

  // ---------------------------
  // Compute Header Gradient with 4 stops (all blue shades)
  // If headerColor is provided, use it; otherwise, fallback to #0046b0 with derived stops.
  const headerGradient = headerColor
    ? `linear-gradient(90deg, ${headerColor}, ${shadeColor(
        headerColor,
        0.2
      )}, ${shadeColor(headerColor, 0.4)}, ${shadeColor(headerColor, 0.6)})`
    : `linear-gradient(90deg, #0046b0, ${shadeColor(
        '#0046b0',
        0.2
      )}, ${shadeColor('#0046b0', 0.4)}, ${shadeColor('#0046b0', 0.6)})`;

  // Compute contrast text color based on the selected headerColor
  const textColor = headerColor ? getContrastColor(headerColor) : '#ffffff';

  // ---------------------------
  // Render
  // ---------------------------
  return (
    <div className='relative flex flex-col h-full'>
      {/* Background Layer */}
      <div
        className={`absolute inset-0 ${fadeClass}`}
        style={backgroundStyle}
      />

      {/* Chat Content */}
      <div className='relative z-10 flex flex-col h-full'>
        {/* Header with dynamic gradient background and contrast text color */}
        <div
          className='flex-none border-b p-4 shadow-md'
          style={{ background: headerGradient }}
        >
          <h2 className='text-xl font-bold' style={{ color: textColor }}>
            {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
          </h2>
        </div>

        {/* Search Conversations */}
        <div className='p-3' style={{ borderBottom: '2px solid #0046b0' }}>
          <input
            type='text'
            placeholder='Search conversation'
            className='w-full rounded px-3 py-2 focus:outline-none'
            style={{
              border: '1px solid #0046b0',
              color: '#0046b0'
            }}
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchResults.length > 0 && (
            <div className='flex justify-end mt-2 items-center'>
              <button
                onClick={handlePrevSearch}
                className='mr-2 text-[#0046b0]'
              >
                <FaArrowUp />
              </button>
              <span className='text-sm text-[#0046b0]'>
                {currentSearchIndex + 1} / {searchResults.length}
              </span>
              <button
                onClick={handleNextSearch}
                className='ml-2 text-[#0046b0]'
              >
                <FaArrowDown />
              </button>
            </div>
          )}
        </div>

        {/* Messages Area */}
        <div className='flex-1 overflow-y-auto p-4'>
          {loadingMessages ? (
            <p>Loading messages...</p>
          ) : (
            messages.map((msg, idx) => {
              const isOurs = msg.senderId === userId;
              const isAudio = !msg.content && msg.attachment;
              return (
                <div
                  key={idx}
                  className='mb-3'
                  ref={el => (messageRefs.current[idx] = el)}
                >
                  {isAudio ? (
                    <div
                      className={`p-3 rounded-lg shadow-md max-w-xs ${
                        isOurs ? 'bg-green-100 self-end' : 'bg-gray-100'
                      }`}
                    >
                      <p className='text-sm text-gray-500'>
                        {new Date(msg.createdAt).toLocaleTimeString()}
                      </p>
                      <audio controls src={msg.attachment} className='w-full' />
                      <p className='text-xs text-gray-700 mt-1'>
                        {isOurs
                          ? currentUser?.name || 'Me'
                          : msg.sender?.firstName || 'Unknown'}
                      </p>
                    </div>
                  ) : (
                    <MessageBox
                      position={isOurs ? 'right' : 'left'}
                      type='text'
                      text={
                        searchQuery && msg.content
                          ? highlightText(msg.content, searchQuery)
                          : msg.content
                      }
                      date={new Date(msg.createdAt)}
                      title={
                        isOurs
                          ? currentUser?.name || 'Me'
                          : msg.sender?.firstName || 'Unknown'
                      }
                      avatar={
                        isOurs
                          ? currentUser?.avatar ||
                            'https://i.pravatar.cc/50?u=me'
                          : msg.sender?.imageUrl || 'https://i.pravatar.cc/50'
                      }
                      style={{
                        backgroundColor: isOurs ? '#DCF8C6' : '#FFFFFF'
                      }}
                    />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Input Row */}
        <div className='flex-none p-4 bg-white border-t flex items-center'>
          <button className='text-gray-500 hover:text-gray-700 mr-3'>
            <FaPaperclip size={18} />
          </button>
          <input
            type='text'
            className='flex-1 border rounded-full px-4 py-2 shadow focus:outline-none focus:ring-2 focus:ring-blue-500'
            placeholder='Type a message...'
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
          />
          {canSend ? (
            <button
              className='ml-3 text-white bg-blue-600 hover:bg-blue-700 rounded-full p-2'
              onClick={sendMessage}
            >
              <FaPaperPlane size={20} />
            </button>
          ) : (
            <button
              className='ml-3 text-blue-600 hover:text-blue-800 p-2'
              onClick={() => setShowRecorder(true)}
            >
              <FaMicrophone size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Voice Recorder Popover */}
      {showRecorder && (
        <div className='absolute bottom-20 right-4 bg-white rounded-lg shadow-lg p-4 z-50 w-72'>
          <div className='flex justify-between items-center mb-3 border-b pb-2'>
            <h3 className='font-bold text-lg text-gray-800'>Voice Recorder</h3>
            <button
              onClick={stopRecording}
              className='text-gray-400 hover:text-gray-600 text-xl'
            >
              &times;
            </button>
          </div>
          <div className='mb-4'>
            <ReactMic
              record={isRecording}
              onStop={onStopRecording}
              strokeColor='#4F46E5'
              backgroundColor='#E5E7EB'
            />
          </div>
          <div className='flex justify-center'>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className='px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition duration-200'
              >
                Stop
              </button>
            ) : (
              <button
                onClick={recordAudio}
                className='px-6 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition duration-200'
              >
                Start
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

ChatWindow.propTypes = {
  chat: PropTypes.object,
  socket: PropTypes.object,
  currentUser: PropTypes.object,
  backgroundUrl: PropTypes.string,
  headerColor: PropTypes.string // New prop for header color
};

export default ChatWindow;
