// ChatWindow.jsx
import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';
import { ReactMic } from 'react-mic';
import { FaPaperclip, FaMicrophone, FaPaperPlane } from 'react-icons/fa';

const ChatWindow = ({ chat, socket, currentUser, backgroundUrl }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const token = localStorage.getItem('token');

  // Voice recorder state
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  // Fetch messages when chat is selected or refreshed
  const fetchMessages = async () => {
    if (!chat) return;
    setLoadingMessages(true);
    try {
      const res = await axios.get(
        `http://localhost:5200/api/chats/${chat.id}/messages`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Fetched messages:', res.data.data);
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

  // Send text message via backend endpoint
  const sendMessage = async () => {
    if (!newMessage.trim()) return;
    try {
      const msgData = {
        content: newMessage,
        attachment: null
      };
      const res = await axios.post(
        `http://localhost:5200/api/chats/${chat.id}/messages`,
        msgData,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      console.log('Text message sent:', res.data.data);
      setMessages(prev => [...prev, res.data.data]);
      setNewMessage('');
      socket?.emit('send_message', res.data.data);
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  // Voice recorder functions
  const openRecorder = () => {
    console.log('Opening voice recorder popover.');
    setShowRecorder(true);
    setIsRecording(false);
  };

  const recordAudio = () => {
    console.log('Starting audio recording...');
    setIsRecording(true);
  };

  const stopRecording = () => {
    console.log('Stopping audio recording...');
    setIsRecording(false);
  };

  const onStopRecording = async recordedData => {
    console.log('onStopRecording fired:', recordedData);
    if (recordedData.blob && recordedData.blob.size > 0) {
      const audioUrl = URL.createObjectURL(recordedData.blob);
      console.log('Generated Audio URL:', audioUrl);
      try {
        const msgData = {
          content: null,
          attachment: audioUrl
        };
        const res = await axios.post(
          `http://localhost:5200/api/chats/${chat.id}/messages`,
          msgData,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log('Audio message sent:', res.data.data);
        setMessages(prev => [...prev, res.data.data]);
        socket?.emit('send_message', res.data.data);
      } catch (error) {
        console.error('Error sending audio message:', error);
      }
    } else {
      console.error('No valid recording data received.');
    }
    // Hide the recorder popover after processing.
    setShowRecorder(false);
  };

  if (!chat) {
    return (
      <div className='p-4 text-gray-500'>Select a chat to start messaging.</div>
    );
  }

  const userId = currentUser?.id || currentUser?.userId;
  const canSend = newMessage.trim().length > 0;

  return (
    <div className='flex flex-col h-full relative'>
      {/* Header */}
      <div className='flex-none border-b p-4 bg-gradient-to-r from-blue-500 to-indigo-500 shadow-md'>
        <h2 className='text-xl font-bold text-white'>
          {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
        </h2>
      </div>

      {/* Messages area */}
      <div
        className='flex-1 overflow-y-auto p-4'
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {loadingMessages ? (
          <p>Loading messages...</p>
        ) : (
          messages.map((msg, idx) => {
            const isOurs = msg.senderId === userId;
            const isAudio = !msg.content && msg.attachment;
            return (
              <div key={idx} className='mb-3'>
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
                    text={msg.content}
                    date={new Date(msg.createdAt)}
                    title={
                      isOurs
                        ? currentUser?.name || 'Me'
                        : msg.sender?.firstName || 'Unknown'
                    }
                    avatar={
                      isOurs
                        ? currentUser?.avatar || 'https://i.pravatar.cc/50?u=me'
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

      {/* Input row */}
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

      {/* Voice Recorder Popover (improved styling) */}
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
                className='px-6 py-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition duration-200'
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
  backgroundUrl: PropTypes.string
};

export default ChatWindow;
