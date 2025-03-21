export const getNotifications = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const notifications = await prisma.notification.findMany({
      where: { recipientId: currentUserId },
      orderBy: { createdAt: 'desc' }
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
