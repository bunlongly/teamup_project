import { Router } from 'express';
import {
  createPost,
  getAllPosts,
  getPostById,
  getMyProjects
} from '../controllers/postController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = Router();

// Route to create a project
router.post('/create', authenticateUser, upload.single('file'), createPost);

router.get('/all', getAllPosts);

// router.get('/:id', getPostById);

router.get('/my', authenticateUser, getMyProjects);


export default router;
