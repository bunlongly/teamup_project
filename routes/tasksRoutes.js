// routes/tasksRoutes.js
import { Router } from 'express';
import {
  createTask,
  updateTask,
  getTasksForPost,
  deleteTask
} from '../controllers/tasksController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = Router();

// Create a new task
router.post(
  '/create',
  authenticateUser,
  upload.single('attachment'),
  createTask
);

// Update a task (you can also use PUT if you prefer)
router.put(
  '/update/:id',
  authenticateUser,
  upload.single('attachment'),
  updateTask
);
router.delete('/:id', authenticateUser, deleteTask);

// Get tasks for a specific project/post
router.get('/post/:postId', authenticateUser, getTasksForPost);

export default router;
