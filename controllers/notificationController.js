// notificationController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

export const getNotifications = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: currentUserId },
      orderBy: { createdAt: 'desc' },
      include: {
        sender: true // Include sender details so that your frontend gets sender.firstName, etc.
      }
    });
    return successResponse(res, 'Notifications fetched', { notifications });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching notifications'
    );
  }
};
