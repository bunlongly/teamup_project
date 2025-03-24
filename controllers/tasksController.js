// controllers/tasksController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';
import cloudinary from '../config/cloudinary.js';
import { formatImage } from '../middleware/multerMiddleware.js';

const prisma = new PrismaClient();

// Helper function to upload image/file to Cloudinary
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

// Create a new task for a project
export const createTask = async (req, res) => {
  // Handle file upload if present, and store the URL in attachmentUrl.
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

  // Destructure fields from the request body.
  const { name, dueDate, status, assignedToId, postId, description } = req.body;

  // Ensure that required fields are provided.
  if (!name) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'Task name is required');
  }

  try {
    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        attachment: attachmentUrl,
        status, // Defaults in schema if not provided
        assignedToId,
        postId
      }
    });

    return successResponse(res, 'Task created successfully', task);
  } catch (error) {
    console.error('Error creating task:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error creating task'
    );
  }
};

// Update an existing task
export const updateTask = async (req, res) => {
  const { id } = req.params;
  const { name, dueDate, attachment, status, assignedToId } = req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        name,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        attachment,
        status,
        assignedToId
      }
    });

    return successResponse(res, 'Task updated successfully', task);
  } catch (error) {
    console.error('Error updating task:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error updating task'
    );
  }
};

// Get all tasks for a given project (post)
export const getTasksForPost = async (req, res) => {
  const { postId } = req.params;
  try {
    const tasks = await prisma.task.findMany({
      where: { postId },
      include: {
        assignedTo: true
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return successResponse(res, 'Tasks retrieved successfully', tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching tasks'
    );
  }
};
