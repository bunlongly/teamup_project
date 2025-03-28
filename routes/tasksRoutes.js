// routes/tasksRoutes.js
import { Router } from 'express';
import {
  createTask,
  updateTask,
  getTasksForPost,
  deleteTask,
  getTaskById
} from '../controllers/tasksController.js';
import {
  createSubmission,
  getSubmissionForTask,
  getAllSubmissionsForTask
} from '../controllers/submissionController.js';
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

router.get('/:id', authenticateUser, getTaskById);

router.post(
  '/:id/submit',
  authenticateUser,
  upload.single('attachment'),
  createSubmission
);

router.get('/:id/submission', authenticateUser, getSubmissionForTask);

// For owners: get all submissions for the task
router.get('/:id/submissions', authenticateUser, getAllSubmissionsForTask);
export default router;
