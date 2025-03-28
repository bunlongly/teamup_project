import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../config/cloudinary.js';
import { formatImage } from '../middleware/multerMiddleware.js';

const prisma = new PrismaClient();

// Helper function to upload image/file to Cloudinary
const uploadImageToCloudinary = async base64Image => {
  console.log('Uploading image to Cloudinary');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(base64Image, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        return reject(error);
      }
      console.log('Cloudinary upload result:', result);
      resolve({ secure_url: result.secure_url });
    });
  });
};

export const createPost = async (req, res) => {
  // req.user is set by your authentication middleware
  const { userId } = req.user;
  console.log('Creating post for user:', userId);

  // Extract fields from req.body
  const {
    postType,
    content,
    projectName,
    projectDescription,
    projectType,
    platform,
    technicalRole,
    duration,
    startDate,
    endDate,
    role,
    requirement
  } = req.body;

  // Handle optional file upload
  let fileUrl = null;
  if (req.file) {
    try {
      const base64Image = formatImage(req.file);
      const { secure_url } = await uploadImageToCloudinary(base64Image);
      fileUrl = secure_url;
    } catch (err) {
      console.error('Error uploading file:', err);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error uploading file'
      );
    }
  }

  try {
    const post = await prisma.post.create({
      data: {
        postType,
        content,
        projectName,
        projectDescription,
        projectType,
        platform, // New field
        technicalRole, // New field
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        fileUrl,
        role,
        requirement,
        userId
      }
    });

    return successResponse(res, 'Post created successfully', post);
  } catch (error) {
    console.error('Error creating post:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error creating post',
      error.message
    );
  }
};

export const getAllPosts = async (req, res) => {
  try {
    const posts = await prisma.post.findMany({
      include: {
        user: true // or select certain fields: { select: { firstName: true, ... } }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    return successResponse(res, 'Posts retrieved successfully', posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching posts',
      error.message
    );
  }
};

export const getPostById = async (req, res) => {
  const { id } = req.params;
  try {
    const post = await prisma.post.findUnique({
      where: { id },
      include: {
        user: true,
        tasks: true,
        applications: { include: { applicant: true } }
      }
    });
    if (!post) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'Post not found');
    }
    return successResponse(res, 'Post retrieved successfully', post);
  } catch (error) {
    console.error('Error fetching post:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error fetching post',
      error.message
    );
  }
};

export const getMyProjects = async (req, res) => {
  const currentUserId = req.user.id || req.user.userId;
  try {
    const projects = await prisma.post.findMany({
      where: { userId: currentUserId },
      include: { applications: { include: { applicant: true } } }
    });
    return res.status(200).json({ data: projects });
  } catch (error) {
    console.error('Error fetching my projects:', error);
    return res.status(500).json({ error: 'Error fetching my projects' });
  }
};
