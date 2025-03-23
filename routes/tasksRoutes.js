// routes/tasksRoutes.js
import { Router } from 'express';
import {
  createTask,
  updateTask,
  getTasksForPost
} from '../controllers/tasksController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

// Create a new task
router.post('/create', authenticateUser, createTask);

// Update a task (you can also use PUT if you prefer)
router.patch('/:id', authenticateUser, updateTask);

// Get tasks for a specific project/post
router.get('/post/:postId', authenticateUser, getTasksForPost);

export default router;
