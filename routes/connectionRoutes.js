// routes/connectionRoutes.js
import { Router } from 'express';
import {
  getConnectionStatus,
  createConnection,
  deleteConnection
} from '../controllers/connectionController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

router.get('/status/:userId', authenticateUser, getConnectionStatus);
router.post('/create', authenticateUser, createConnection);
router.delete('/:userId', authenticateUser, deleteConnection);

export default router;
