// applicationRoutes.js
import { Router } from 'express';
import {
  applyToProject,
  updateApplicationStatus
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

export default router;
