// routes/connectionRoutes.js
import express from 'express';
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  deleteConnection
} from '../controllers/connection.js';
import { authenticateUser } from '../middleware/authMiddleware.js'; // Ensure you have this

const router = express.Router();

router.post('/request', authenticateUser, sendConnectionRequest);
router.put('/accept', authenticateUser, acceptConnectionRequest);
router.delete('/:connectionId', authenticateUser, deleteConnection);

export default router;
