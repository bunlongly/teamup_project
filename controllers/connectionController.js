// controllers/connectionController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

// In controllers/connectionController.js
export const getConnectionStatus = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { userId } = req.params;
  try {
    const connection = await prisma.connection.findFirst({
      where: {
        OR: [
          { followerId: currentUserId, followingId: userId },
          { followerId: userId, followingId: currentUserId }
        ]
      }
    });
    return successResponse(res, 'Connection status fetched', { connection });
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

    // Create a notification for the target user.
    await prisma.notification.create({
      data: {
        recipientId: targetUserId,
        senderId: currentUserId,
        type: 'connection_request',
        message: 'You have received a connection request.'
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

    // Create a notification for the sender (who sent the request)
    await prisma.notification.create({
      data: {
        recipientId: followerId,
        senderId: currentUserId,
        type: 'connection_accepted',
        message: 'Your connection request has been accepted.'
      }
    });

    // Also create a notification for the acceptor (the current user)
    await prisma.notification.create({
      data: {
        recipientId: currentUserId,
        senderId: followerId,
        type: 'connection_confirmed',
        message: 'You have accepted a connection request.'
      }
    });
    return res.status(200).json({ data: { status: 'accepted', connection } });
  } catch (error) {
    console.error('Error accepting connection:', error);
    return res.status(500).json({ error: 'Error accepting connection' });
  }
};

export const deleteConnection = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  const { userId } = req.params; // This should be the other party's ID

  // Try finding the connection where current user is the sender (outgoing request)
  let connection = await prisma.connection.findUnique({
    where: {
      followerId_followingId: {
        followerId: currentUserId,
        followingId: userId
      }
    }
  });

  // If not found, try finding the connection where current user is the receiver (incoming request)
  if (!connection) {
    connection = await prisma.connection.findUnique({
      where: {
        followerId_followingId: {
          followerId: userId,
          followingId: currentUserId
        }
      }
    });
  }

  if (!connection) {
    return errorResponse(
      res,
      StatusCodes.NOT_FOUND,
      'Connection not found or already removed.'
    );
  }

  try {
    const deletedConnection = await prisma.connection.delete({
      where: {
        followerId_followingId: {
          followerId: connection.followerId,
          followingId: connection.followingId
        }
      }
    });
    return successResponse(
      res,
      'Connection removed successfully',
      deletedConnection
    );
  } catch (error) {
    console.error('Error deleting connection:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error deleting connection'
    );
  }
};

export const getIncomingConnections = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const connections = await prisma.connection.findMany({
      where: {
        followingId: currentUserId,
        status: 'PENDING'
      },
      include: {
        follower: true // include follower details
      }
    });
    // Return the follower information for each connection
    const requests = connections.map(connection => connection.follower);
    return successResponse(res, 'Incoming requests fetched', { requests });
  } catch (error) {
    console.error('Error fetching incoming connections:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching incoming connections'
    );
  }
};

export const getConnectionCount = async (req, res) => {
  const { userId } = req.params; // The user whose connection count you want
  try {
    const count = await prisma.connection.count({
      where: {
        status: 'ACCEPTED',
        OR: [{ followerId: userId }, { followingId: userId }]
      }
    });
    return successResponse(res, 'Connection count fetched', { count });
  } catch (error) {
    console.error('Error fetching connection count:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching connection count'
    );
  }
};
