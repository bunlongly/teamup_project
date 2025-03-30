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
// postRoutes.js
router.post('/create', authenticateUser, async (req, res, next) => {
  // Check if the user is a project manager and postType is RECRUITMENT
  const { role } = req.user;
  const { postType } = req.body;

  if (role === 'PROJECT_MANAGER' && postType === 'RECRUITMENT') {
    // 1) Confirm the user has an active subscription or a completed payment
    //    If not paid, return an error or redirect to payment
    return res
      .status(403)
      .json({ error: 'Payment required for RECRUITMENT post' });
  }

  // Otherwise, proceed to the createPost controller
  next();
}, upload.single('file'), createPost);


router.get('/all', getAllPosts);

router.get('/my', authenticateUser, getMyProjects);

router.get('/:id', getPostById);

export default router;
