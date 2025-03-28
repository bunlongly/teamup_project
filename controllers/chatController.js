import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

// Create a new chat (individual or group)
export const createChat = async (req, res) => {
  const { isGroup, chatName, participantIds } = req.body;

  // Use req.user if available; fallback to userId from body
  const currentUser = req.user || { userId: req.body.userId };

  // Use a helper variable that looks for either id or userId in the token payload
  const currentUserId = currentUser.id || currentUser.userId;

  console.log('Current User:', currentUser);
  console.log('Current User ID:', currentUserId);

  if (!currentUserId) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'User not authenticated or missing user id'
    );
  }

  try {
    // Ensure the current user is included in the participantIds
    let participants = Array.isArray(participantIds) ? participantIds : [];
    console.log('Participant IDs from request:', participants);

    if (!participants.includes(currentUserId)) {
      participants.push(currentUserId);
    }

    console.log('Final participant IDs:', participants);

    // Check for undefined values
    const undefinedParticipants = participants.filter(id => id === undefined);
    if (undefinedParticipants.length > 0) {
      console.error('Found undefined participant IDs:', undefinedParticipants);
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'One or more participant IDs are undefined'
      );
    }

    // For individual chats, enforce exactly two participants
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
            role: userId === currentUserId ? 'ADMIN' : 'PARTICIPANT'
          }))
        }
      },
      include: { participants: { include: { user: true } } }
    });

    console.log('New Chat created:', newChat);
    return successResponse(res, 'Chat created successfully', newChat);
  } catch (error) {
    console.error('Error creating chat:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error creating chat'
    );
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
    return successResponse(
      res,
      'Participant added successfully',
      newParticipant
    );
  } catch (error) {
    console.error('Error adding participant:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error adding participant'
    );
  }
};

// Send a message in a chat
export const sendMessage = async (req, res) => {
  const { chatId } = req.params;
  const { content, attachment } = req.body;
  const currentUser = req.user;
  if (!currentUser) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'User not authenticated'
    );
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
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error sending message'
    );
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
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching messages'
    );
  }
};

// Get chats for the current user
export const getUserChats = async (req, res) => {
  const currentUser = req.user;
  if (!currentUser) {
    return errorResponse(
      res,
      StatusCodes.UNAUTHORIZED,
      'User not authenticated'
    );
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
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching chats'
    );
  }
};
