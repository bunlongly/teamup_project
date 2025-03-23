// controllers/tasksController.js
import { PrismaClient } from '@prisma/client';
import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';

const prisma = new PrismaClient();

// Create a new task for a project
export const createTask = async (req, res) => {
  const { name, dueDate, attachment, status, assignedToId, postId } = req.body;

  try {
    const task = await prisma.task.create({
      data: {
        name,
        description,
        dueDate: dueDate ? new Date(dueDate) : null,
        attachment,
        status, // If not provided, defaults to REVIEW in the schema
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
