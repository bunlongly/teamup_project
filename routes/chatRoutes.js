import { Router } from 'express';
import {
  createChat,
  addChatParticipant,
  sendMessage,
  getChatMessages,
  getUserChats
} from '../controllers/chatController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

// Create a new chat (individual or group)
router.post('/', authenticateUser, createChat);

// Add a participant to a chat (for group chats)
router.post('/:chatId/participants', authenticateUser, addChatParticipant);

// Send a message in a chat
router.post('/:chatId/messages', authenticateUser, sendMessage);

// Get all messages from a chat
router.get('/:chatId/messages', authenticateUser, getChatMessages);

// Get all chats for the current user
router.get('/', authenticateUser, getUserChats);

export default router;
