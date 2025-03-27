import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

// Create a new chat (individual or group)
export const createChat = async (req, res) => {
  const { isGroup, chatName, participantIds } = req.body;
  const currentUser = req.user; // Should be set by your auth middleware

  if (!currentUser) {
    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }

  try {
    // Ensure the current user is included
    let participants = Array.isArray(participantIds) ? participantIds : [];
    if (!participants.includes(currentUser.id)) {
      participants.push(currentUser.id);
    }

    // For one-on-one chats, you may want to enforce exactly two participants
    if (!isGroup && participants.length !== 2) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Individual chats must have exactly 2 participants'
      );
    }

    const newChat = await prisma.chat.create({
      data: {
        isGroup,
        chatName: isGroup ? chatName : null,
        participants: {
          create: participants.map(userId => ({
            userId,
            role: userId === currentUser.id ? 'ADMIN' : 'PARTICIPANT'
          }))
        }
      },
      include: { participants: { include: { user: true } } }
    });

    return successResponse(res, 'Chat created successfully', newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Error creating chat');
  }
};

// Add a participant to an existing group chat
export const addChatParticipant = async (req, res) => {
  const { chatId } = req.params;
  const { userId, role } = req.body; // role can be ADMIN or PARTICIPANT
  try {
    const newParticipant = await prisma.chatParticipant.create({
      data: {
        chatId,
        userId,
        role: role || 'PARTICIPANT'
      },
      include: { user: true }
    });
    return successResponse(res, 'Participant added successfully', newParticipant);
  } catch (error) {
    console.error('Error adding participant:', error);
    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Error adding participant');
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content, attachment } = req.body;
  const currentUser = req.user;
  if (!currentUser) {
    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }
  try {
    const newMessage = await prisma.message.create({
      data: {
        chatId,
        senderId: currentUser.id,
        content,
        attachment
      },
      include: { sender: true }
    });
    return successResponse(res, 'Message sent successfully', newMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Error sending message');
  }
};

// Get messages from a chat
export const getChatMessages = async (req, res) => {
  const { chatId } = req.params;
  try {
    const messages = await prisma.message.findMany({
      where: { chatId },
      orderBy: { createdAt: 'asc' },
      include: { sender: true }
    });
    return successResponse(res, 'Messages fetched successfully', messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching messages');
  }
};

// Get chats for the current user
export const getUserChats = async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    return errorResponse(res, StatusCodes.UNAUTHORIZED, 'User not authenticated');
  }
  try {
    const chats = await prisma.chat.findMany({
      where: {
        participants: {
          some: { userId: currentUser.id }
        }
      },
      include: {
        participants: { include: { user: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1 // only fetch latest message per chat
        }
      }
    });
    return successResponse(res, 'Chats fetched successfully', chats);
  } catch (error) {
    console.error('Error fetching chats:', error);
    return errorResponse(res, StatusCodes.INTERNAL_SERVER_ERROR, 'Error fetching chats');
  }
};
