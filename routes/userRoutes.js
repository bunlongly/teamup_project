import express from "express";
import { getAllUsers } from "../controllers/userController.js";
import { authenticateUser } from "../middleware/errorHandlerMiddleware.js";

const router = express.Router();

// Middleware to authenticate the token
router.use(authenticateUser);

// Route to get all users
router.get("/all", getAllUsers);

export default router;
