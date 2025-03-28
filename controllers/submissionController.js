import { PrismaClient } from '@prisma/client';
import { StatusCodes } from 'http-status-codes';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import cloudinary from '../config/cloudinary.js';
import { formatImage } from '../middleware/multerMiddleware.js';

const prisma = new PrismaClient();

const uploadImageToCloudinary = async base64Image => {
  console.log('Uploading image to Cloudinary');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(base64Image, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return reject(error);
      }
      console.log('Cloudinary upload result:', result);
      resolve({ secure_url: result.secure_url });
    });
  });
};

// Create a new submission
export const createSubmission = async (req, res) => {
  const { comment, links, reportReason, status } = req.body;
  let attachmentUrl = null;
  if (req.file) {
    try {
      const base64Image = formatImage(req.file);
      const { secure_url } = await uploadImageToCloudinary(base64Image);
      attachmentUrl = secure_url;
    } catch (err) {
      console.error('Error uploading file:', err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error uploading file'
      );
    }
  }
  const currentUserId = req.user?.id || req.user?.userId;
  const taskId = req.params.id; // Get task ID from URL

  if (!taskId) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'Task ID is required');
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userId: currentUserId,
        taskId,
        comment,
        links,
        reportReason,
        status: status || 'SUBMITTED',
        attachment: attachmentUrl
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

export const getSubmissionForTask = async (req, res) => {
  const taskId = req.params.id;
  const currentUserId = req.user?.id || req.user?.userId;

  if (!taskId) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'Task ID is required');
  }

  try {
    // Find the submission for this task by the current user
    const submission = await prisma.submission.findFirst({
      where: {
        taskId,
        userId: currentUserId
      },
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

// Get all submissions for a task (for project owner)
export const getAllSubmissionsForTask = async (req, res) => {
  const taskId = req.params.id;

  if (!taskId) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'Task ID is required');
  }

  try {
    const submissions = await prisma.submission.findMany({
      where: { taskId },
      include: { user: true, task: true }
    });

    if (!submissions.length) {
      return errorResponse(
        res,
        StatusCodes.NOT_FOUND,
        'No submissions found for this task'
      );
    }

    return successResponse(
      res,
      'Submissions retrieved successfully',
      submissions
    );
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching submissions'
    );
  }
};
