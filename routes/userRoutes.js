import express from 'express';
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
  searchUsers
} from '../controllers/userController.js';
import { authenticateUser } from '../middleware/errorHandlerMiddleware.js';
import upload from '../middleware/multerMiddleware.js';

const router = express.Router();

// Middleware to authenticate the token
router.use(authenticateUser);

router.get('/search', authenticateUser, searchUsers);

// Route to get all users
router.get('/all', authenticateUser, getAllUsers);
// Route to get single user
router.get('/:id', authenticateUser, getUserById);

// router.put("/:id/edit", authenticateUser, updateUserProfile);
router.put(
  '/:id/edit',
  authenticateUser,
  upload.fields([
    { name: 'imageUrl', maxCount: 1 },
    { name: 'coverImage', maxCount: 1 }
  ]),
  updateUserProfile
);

export default router;
