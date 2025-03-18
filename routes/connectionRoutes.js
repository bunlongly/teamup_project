// routes/connectionRoutes.js
import express from 'express';
import {
  getConnectionStatus,
  createConnection,
  deleteConnection
} from '../controllers/connectionController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = express.Router();

router.get('/status/:userId', authenticateUser, getConnectionStatus);
router.post('/create', authenticateUser, createConnection);
router.delete('/:userId', authenticateUser, deleteConnection);

export default router;
