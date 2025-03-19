// controllers/connectionController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export const getConnectionStatus = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { userId } = req.params;
  try {
    const connection = await prisma.connection.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId
        }
      }
    });
    if (connection) {
      return successResponse(res, 'Connection exists', {
        status: connection.status
      });
    } else {
      return successResponse(res, 'No connection found', {
        status: 'not-connected'
      });
    }
  } catch (error) {
    console.error('Error fetching connection status:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching connection status'
    );
  }
};

export const createConnection = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { userId: targetUserId } = req.body;

  try {
    // Use upsert: if a connection already exists, update it; otherwise, create it.
    const connection = await prisma.connection.upsert({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: targetUserId
        }
      },
      update: {
        status: 'PENDING'
      },
      create: {
        status: 'PENDING',
        follower: { connect: { id: currentUserId } },
        following: { connect: { id: targetUserId } }
      }
    });
    return res
      .status(201)
      .json({ data: { connection, status: connection.status } });
  } catch (error) {
    console.error('Error creating connection:', error);
    return res.status(500).json({ error: 'Error creating connection' });
  }
};

export const acceptConnection = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { followerId } = req.body; // The user who sent the request
  try {
    const connection = await prisma.connection.update({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: currentUserId
        }
      },
      data: { status: 'ACCEPTED' }
    });
    return res.status(200).json({ data: { status: 'accepted', connection } });
  } catch (error) {
    console.error('Error accepting connection:', error);
    return res.status(500).json({ error: 'Error accepting connection' });
  }
};

export const deleteConnection = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { userId } = req.params;
  try {
    const connection = await prisma.connection.delete({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId
        }
      }
    });
    return successResponse(res, 'Connection removed successfully', connection);
  } catch (error) {
    console.error('Error deleting connection:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error deleting connection'
    );
  }
};
