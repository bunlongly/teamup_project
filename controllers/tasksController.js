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
// controllers/tasksController.js
export const createTask = async (req, res) => {
  const {
    name,
    startDate,
    endDate,
    description,
    status,
    link,
    assignedToId,
    postId
  } = req.body;

  // Validate required fields
  if (!name || !startDate || !endDate || !description || !postId) {
    return errorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Missing required fields: name, startDate, endDate, description, and postId are required.'
    );
  }

  // Process file upload if provided
  let attachment = null;
  if (req.file) {
    try {
      const base64Image = formatImage(req.file);
      const { secure_url } = await uploadImageToCloudinary(base64Image);
      attachment = secure_url;
    } catch (err) {
      console.error('Error uploading file:', err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error uploading file'
      );
    }
  }

  try {
    const task = await prisma.task.create({
      
      data: {
        name,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        attachment,
        status,
        link,
        postId,
        ...(assignedToId && { assignedToId })
      },
      // Include the assignedTo relation so the response contains the full user info
      include: { assignedTo: true }
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
  const { name, dueDate, attachment, status, assignedToId, description, link } =
    req.body;

  try {
    const task = await prisma.task.update({
      where: { id },
      data: {
        name,
        dueDate: dueDate ? new Date(dueDate) : undefined,
        attachment,
        status,
        assignedToId,
        description,
        link
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

// Delete an existing task
export const deleteTask = async (req, res) => {
  const { id } = req.params;
  try {
    const deletedTask = await prisma.task.delete({
      where: { id }
    });
    return successResponse(res, 'Task deleted successfully', deletedTask);
  } catch (error) {
    console.error('Error deleting task:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error deleting task'
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
