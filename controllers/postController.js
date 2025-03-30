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
  console.log('Request body:', req.body);
  const { userId } = req.user;
  console.log('Creating post for user:', userId);

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
    requirement,
    fileUrl: fileUrlFromBody
  } = req.body;

  if (!postType) {
    return errorResponse(res, StatusCodes.BAD_REQUEST, 'postType is required');
  }

  let fileUrl = fileUrlFromBody || null;
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
    // Create the post first
    const post = await prisma.post.create({
      data: {
        postType,
        content,
        projectName,
        projectDescription,
        projectType,
        platform,
        technicalRole,
        duration,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        fileUrl,
        role,
        requirement,
        userId
      }
    });

    // If this is a recruitment post, check and update the subscription.
    if (postType === 'RECRUITMENT') {
      try {
        const subscription = await prisma.subscription.findUnique({
          where: { userId }
        });
        if (!subscription || subscription.remainingPosts <= 0) {
          return errorResponse(
            res,
            StatusCodes.BAD_REQUEST,
            'You do not have any remaining recruitment posts. Please purchase a new plan.'
          );
        }
        // Only decrement if remainingPosts is greater than 0.
        const newRemaining = subscription.remainingPosts - 1;
        // If newRemaining would be negative, set it to 0 (or return an error)
        await prisma.subscription.update({
          where: { userId },
          data: {
            remainingPosts: newRemaining < 0 ? 0 : newRemaining
          }
        });
      } catch (subError) {
        console.error(
          'Error updating subscription after post creation:',
          subError
        );
      }
    }

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
        user: true,
        likes: true,
        comments: {
          include: {
            user: true
          }
        } // ✅ this closing brace was missing
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

// Add a comment to a post (only for STATUS posts)
export const addComment = async (req, res) => {
  try {
    const { postId, content } = req.body;
    const userId = req.user.id || req.user.userId;

    // Verify that the post exists and is a STATUS post.
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.postType !== 'STATUS') {
      return res
        .status(400)
        .json({ error: 'Comments are only allowed on status posts.' });
    }

    const comment = await prisma.comment.create({
      data: {
        postId,
        content,
        userId
      }
    });
    res.json(comment);
  } catch (error) {
    console.error('Error creating comment:', error);
    res.status(500).json({ error: 'Error creating comment' });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user.id || req.user.userId;

    // Find the comment
    const comment = await prisma.comment.findUnique({ where: { id: commentId } });
    if (!comment) {
      return res.status(404).json({ error: "Comment not found." });
    }
    if (comment.userId !== userId) {
      return res.status(403).json({ error: "You are not authorized to delete this comment." });
    }

    const deletedComment = await prisma.comment.delete({ where: { id: commentId } });
    return res.json(deletedComment);
  } catch (error) {
    console.error("Error deleting comment:", error);
    return res.status(500).json({ error: "Error deleting comment" });
  }
};


// Add a like (only for STATUS posts)
export const addLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id || req.user.userId;

    // Verify that the post exists and is a STATUS post.
    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post || post.postType !== 'STATUS') {
      return res
        .status(400)
        .json({ error: 'Likes are only allowed on status posts.' });
    }

    // Check if the user already liked this post.
    const existingLike = await prisma.like.findUnique({
      where: {
        postId_userId: {
          postId,
          userId
        }
      }
    });
    if (existingLike) {
      return res
        .status(400)
        .json({ error: 'You have already liked this post.' });
    }

    const like = await prisma.like.create({
      data: {
        postId,
        userId
      }
    });
    res.json(like);
  } catch (error) {
    console.error('Error adding like:', error);
    res.status(500).json({ error: 'Error adding like' });
  }
};

// Remove a like (toggle off) remains unchanged:
export const removeLike = async (req, res) => {
  try {
    const { postId } = req.body;
    const userId = req.user.id || req.user.userId;
    const like = await prisma.like.findUnique({
      where: { postId_userId: { postId, userId } }
    });
    if (!like) {
      return res.status(400).json({ error: 'Like not found.' });
    }
    const deletedLike = await prisma.like.delete({
      where: { id: like.id }
    });
    res.json(deletedLike);
  } catch (error) {
    console.error('Error removing like:', error);
    res.status(500).json({ error: 'Error removing like' });
  }
};
