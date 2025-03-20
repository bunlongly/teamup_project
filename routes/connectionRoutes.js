// routes/connectionRoutes.js
import { Router } from 'express';
import {
  getConnectionStatus,
  createConnection,
  deleteConnection,
  getIncomingConnections,
  acceptConnection,
  getConnectionCount
} from '../controllers/connectionController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

router.get('/status/:userId', authenticateUser, getConnectionStatus);
router.post('/create', authenticateUser, createConnection);
router.delete('/:userId', authenticateUser, deleteConnection);

router.get('/incoming', authenticateUser, getIncomingConnections);

router.post('/accept', authenticateUser, acceptConnection);

router.get('/count/:userId', authenticateUser, getConnectionCount);

export default router;
