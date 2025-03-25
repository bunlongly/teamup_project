import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { successResponse, errorResponse } from '../utils/responseUtil.js';

const prisma = new PrismaClient();

// Create a new submission
export const createSubmission = async (req, res) => {
  const { taskId, comment, links, reportReason, status } = req.body;
  const currentUserId = req.user?.id || req.user?.userId;

  if (!taskId) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'Task ID is required');
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userId: currentUserId,
        taskId,
        comment,
        // Expecting links to be sent as a JSON array or stringified JSON
        links,
        reportReason,
        status: status || 'SUBMITTED'
      },
      include: { user: true, task: true }
    });
    return successResponse(res, 'Submission created successfully', submission);
  } catch (error) {
    console.error('Error creating submission:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error creating submission'
    );
  }
};

// Get a submission by its ID
export const getSubmissionById = async (req, res) => {
  const { id } = req.params;
  try {
    const submission = await prisma.submission.findUnique({
      where: { id },
      include: { user: true, task: true }
    });
    if (!submission) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Submission not found');
    }
    return successResponse(
      res,
      'Submission retrieved successfully',
      submission
    );
  } catch (error) {
    console.error('Error fetching submission:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching submission'
    );
  }
};

// Update a submission
export const updateSubmission = async (req, res) => {
  const { id } = req.params;
  const { comment, links, reportReason, status } = req.body;
  try {
    const submission = await prisma.submission.update({
      where: { id },
      data: { comment, links, reportReason, status },
      include: { user: true, task: true }
    });
    return successResponse(res, 'Submission updated successfully', submission);
  } catch (error) {
    console.error('Error updating submission:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error updating submission'
    );
  }
};

// Delete a submission
export const deleteSubmission = async (req, res) => {
  const { id } = req.params;
  try {
    const submission = await prisma.submission.delete({
      where: { id }
    });
    return successResponse(res, 'Submission deleted successfully', submission);
  } catch (error) {
    console.error('Error deleting submission:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error deleting submission'
    );
  }
};
