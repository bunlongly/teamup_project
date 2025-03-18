// controllers/connectionController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export const getConnectionStatus = async (req, res) => {
  const currentUserId = req.user.userId;
  const { userId } = req.params; // The user whose profile is being viewed
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
      return successResponse(res, 'Connection exists', { status: 'connected' });
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
  const currentUserId = req.user.userId;
  const { userId } = req.body; // The user to connect with
  try {
    // Check if connection already exists
    const existing = await prisma.connection.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId
        }
      }
    });
    if (existing) {
      return errorResponse(
        res,
        StatusCodes.BAD_REQUEST,
        'Connection already exists'
      );
    }
    const connection = await prisma.connection.create({
      data: {
        followerId: currentUserId,
        followingId: userId
      }
    });
    return successResponse(res, 'Connection created successfully', connection);
  } catch (error) {
    console.error('Error creating connection:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error creating connection'
    );
  }
};

export const deleteConnection = async (req, res) => {
  const currentUserId = req.user.userId;
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
