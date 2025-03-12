import express from "express";
import {
  getAllUsers,
  getUserById,
  updateUserProfile,
} from "../controllers/userController.js";
import { authenticateUser } from "../middleware/errorHandlerMiddleware.js";

const router = express.Router();

// Middleware to authenticate the token
router.use(authenticateUser);

// Route to get all users
router.get("/all", authenticateUser, getAllUsers);
// Route to get single user
router.get("/:id", authenticateUser, getUserById);

router.put("/:id/edit", authenticateUser, updateUserProfile);

export default router;
