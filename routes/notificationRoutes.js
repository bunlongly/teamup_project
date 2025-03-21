import { Router } from 'express';
import { getNotifications } from '../controllers/notificationController.js'; 
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';

const router = Router();

router.get('/', authenticateUser, getNotifications);

export default router;
