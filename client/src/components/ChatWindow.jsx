// ChatWindow.jsx
import React, { useEffect, useState } from 'react';
import { MessageBox } from 'react-chat-elements';
import 'react-chat-elements/dist/main.css';

import { ReactMic } from 'react-mic';
import { FaPaperclip, FaMicrophone, FaPaperPlane } from 'react-icons/fa';

const ChatWindow = ({ chat, socket, currentUser, backgroundUrl }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');

  // Voice recorder state
  const [showRecorder, setShowRecorder] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (!chat) return;
    setMessages([
      {
        position: 'left',
        type: 'text',
        text: 'Welcome to the advanced chat!',
        date: new Date(),
        title: 'Alice',
        avatar: 'https://i.pravatar.cc/50?u=alice'
      }
    ]);
  }, [chat]);

  // Example Socket logic
  useEffect(() => {
    if (!socket) return;
    socket.on('new_message', msg => {
      if (msg.chatId === chat?.id) {
        setMessages(prev => [...prev, msg]);
      }
    });
    return () => {
      socket.off('new_message');
    };
  }, [socket, chat]);

  // Send text message
  const sendMessage = () => {
    if (!newMessage.trim()) return;
    const msgObj = {
      chatId: chat.id,
      position: 'right',
      type: 'text',
      text: newMessage,
      date: new Date(),
      title: currentUser?.name || 'Me',
      avatar: currentUser?.avatar || 'https://i.pravatar.cc/50?u=me'
    };
    setMessages(prev => [...prev, msgObj]);
    setNewMessage('');
    socket?.emit('send_message', msgObj);
  };

  // Start/Stop recording
  const startRecording = () => {
    setIsRecording(true);
    setShowRecorder(true);
  };
  const stopRecording = () => {
    setIsRecording(false);
    setShowRecorder(false);
  };

  // Called when react-mic stops
  const onStopRecording = recordedData => {
    if (recordedData.blob && recordedData.blob.size > 0) {
      const audioUrl = URL.createObjectURL(recordedData.blob);
      const msgObj = {
        chatId: chat.id,
        position: 'right',
        type: 'audio',
        text: audioUrl,
        date: new Date(),
        title: currentUser?.name || 'Me',
        avatar: currentUser?.avatar || 'https://i.pravatar.cc/50?u=me'
      };
      setMessages(prev => [...prev, msgObj]);
      socket?.emit('send_message', msgObj);
    }
  };

  if (!chat) {
    return (
      <div className='p-4 text-gray-500'>Select a chat to start messaging.</div>
    );
  }

  const canSend = newMessage.trim().length > 0;

  return (
    <div className='flex flex-col h-full'>
      {/* Header (pinned top) */}
      <div className='flex-none border-b p-4 bg-white shadow-sm'>
        <h2 className='text-xl font-bold'>
          {chat.isGroup ? chat.chatName || 'Group Chat' : 'Direct Chat'}
        </h2>
      </div>

      {/* Messages area (scrollable, with background) */}
      <div
        className='flex-1 overflow-y-auto p-4'
        style={{
          backgroundImage: backgroundUrl ? `url(${backgroundUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center'
        }}
      >
        {messages.map((msg, idx) => {
          const isOurs = msg.position === 'right';
          return (
            <div key={idx} className='mb-3'>
              <MessageBox
                position={msg.position}
                type={msg.type}
                text={msg.text}
                date={msg.date}
                title={msg.title}
                avatar={msg.avatar}
                style={{
                  backgroundColor: isOurs ? '#DCF8C6' : '#FFFFFF' // Our messages tinted
                }}
              />
            </div>
          );
        })}
      </div>

      {/* Input row (pinned bottom) */}
      <div className='flex-none p-2 bg-white border-t flex items-center'>
        {/* Attachment Icon */}
        <button className='text-gray-500 hover:text-gray-700 p-2'>
          <FaPaperclip size={18} />
        </button>

        {/* Text Input */}
        <input
          type='text'
          className='flex-1 border rounded px-3 py-2 mx-2 focus:outline-none'
          placeholder='Type a message...'
          value={newMessage}
          onChange={e => setNewMessage(e.target.value)}
        />

        {/* Send or Mic Icon */}
        {canSend ? (
          <button
            className='text-blue-600 hover:text-blue-800 p-2'
            onClick={sendMessage}
          >
            <FaPaperPlane size={20} />
          </button>
        ) : (
          <button
            className='text-blue-600 hover:text-blue-800 p-2'
            onClick={isRecording ? stopRecording : startRecording}
          >
            <FaMicrophone size={20} />
          </button>
        )}
      </div>

      {/* Voice Recorder (inline popover) */}
      {showRecorder && (
        <div className='absolute bottom-20 right-4 bg-white border shadow-md rounded p-3 z-50 w-64'>
          <div className='flex justify-between items-center mb-2'>
            <h3 className='font-semibold text-gray-700 text-sm'>
              Voice Recorder
            </h3>
            <button
              onClick={stopRecording}
              className='text-gray-500 hover:text-gray-700 text-sm'
            >
              ✕
            </button>
          </div>
          <ReactMic
            record={isRecording}
            className='w-full h-16 bg-gray-50 rounded'
            onStop={onStopRecording}
            strokeColor='#4F46E5'
            backgroundColor='#E5E7EB'
          />
          <div className='mt-3 flex justify-center'>
            {isRecording ? (
              <button
                onClick={stopRecording}
                className='px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700'
              >
                Stop
              </button>
            ) : (
              <button
                onClick={startRecording}
                className='px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700'
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

export default ChatWindow;
