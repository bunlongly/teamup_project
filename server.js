import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { PrismaClient } from '@prisma/client';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import postRoutes from './routes/postRoutes.js';
import connectionRoutes from './routes/connectionRoutes.js';
import errorHandlerMiddleware from './middleware/errorHandlerMiddleware.js';
import notificationRoutes from './routes/notificationRoutes.js';
import applicationRoutes from './routes/applicationRoutes.js';

dotenv.config();

const app = express();
const prisma = new PrismaClient();

// Middleware to log every incoming request
app.use((req, res, next) => {
  console.log(`Incoming Request: ${req.method} ${req.originalUrl}`);
  next();
});

// Middleware for CORS
app.use(
  cors({
    credentials: true,
    origin: [process.env.CLIENT_URL]
  })
);

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cors({ credentials: true, origin: process.env.CLIENT_URL }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/post', postRoutes);
app.use('/api/connection', connectionRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/application', applicationRoutes);

// Error handling middleware
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to MySQL');

    app.listen(process.env.PORT || 5000, () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });
  } catch (error) {
    console.error('Database connection failed', error);
    process.exit(1);
  }
};

startServer();
