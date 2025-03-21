// applicationRoutes.js
import { Router } from 'express';
import {
  applyToProject,
  updateApplicationStatus,
  getApplicationsByPost,
  getApplicationsForMyProjects,
  getMyApplications
} from '../controllers/applicationController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

// Endpoint for applying to a project
router.post('/apply', authenticateUser, applyToProject);

// Optional: Endpoint for updating an application's status
router.post(
  '/update/:applicationId',
  authenticateUser,
  updateApplicationStatus
);

router.get('/post/:postId', authenticateUser, getApplicationsByPost);

// Endpoint to get applications for projects that the owner posted
router.get('/all', authenticateUser, getApplicationsForMyProjects);

// Get my (the candidate's) applications
router.get('/my', authenticateUser, getMyApplications);

export default router;
