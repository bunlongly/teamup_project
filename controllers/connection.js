// controllers/connection.js
import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { successResponse, errorResponse } from '../utils/responseUtil.js';

const prisma = new PrismaClient();

// Send a connection request (or follow request)
export const sendConnectionRequest = async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.userId; // set by your auth middleware

  try {
    // Check if a connection already exists
    const existing = await prisma.connection.findUnique({
      where: {
        senderId_receiverId: { senderId, receiverId }
      }
    });
    if (existing) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Connection request already exists'
      );
    }

    const connection = await prisma.connection.create({
      data: {
        senderId,
        receiverId,
        status: 'PENDING'
      }
    });
    return successResponse(res, 'Connection request sent', connection);
  } catch (error) {
    console.error('Error sending connection request:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error sending connection request',
      error.message
    );
  }
};

// Accept a connection request
export const acceptConnectionRequest = async (req, res) => {
  const { connectionId } = req.body;
  try {
    const connection = await prisma.connection.update({
      where: { id: connectionId },
      data: { status: 'CONNECTED' }
    });
    return successResponse(res, 'Connection request accepted', connection);
  } catch (error) {
    console.error('Error accepting connection request:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error accepting connection request',
      error.message
    );
  }
};

// Delete or cancel a connection (unfollow or remove connection)
export const deleteConnection = async (req, res) => {
  const { connectionId } = req.params;
  try {
    await prisma.connection.delete({
      where: { id: connectionId }
    });
    return successResponse(res, 'Connection removed');
  } catch (error) {
    console.error('Error deleting connection:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error deleting connection',
      error.message
    );
  }
};
