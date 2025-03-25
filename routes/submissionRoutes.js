import express from 'express';
import {
  createSubmission,
  getSubmissionById,
  updateSubmission,
  deleteSubmission
} from '../controllers/submissionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Create a new submission
router.post('/', protect, createSubmission);

// Get submission details by ID
router.get('/:id', protect, getSubmissionById);

// Update a submission by ID
router.put('/:id', protect, updateSubmission);

// Delete a submission by ID
router.delete('/:id', protect, deleteSubmission);

export default router;
