import express from "express";
import { getAllUsers, getUserById } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/errorHandlerMiddleware.js";

const router = express.Router();

// Middleware to authenticate the token
router.use(authenticateUser);

// Route to get all users
router.get("/all", getAllUsers);
// Route to get single user
router.get("/:id", getUserById);

export default router;
