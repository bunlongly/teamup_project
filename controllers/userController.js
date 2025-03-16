import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../config/cloudinary.js';
// We no longer need fs because files are stored in memory
import { formatImage } from '../middleware/multerMiddleware.js';

const prisma = new PrismaClient();

// Remove password field from user objects
const removePassword = users =>
  users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });

// Validate UUID format
const isValidUUID = id =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);

// Upload image to Cloudinary using a base64 string
const uploadImageToCloudinary = async base64Image => {
  console.log('Uploading image to Cloudinary');
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(base64Image, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        reject(error);
      } else {
        console.log('Cloudinary upload result:', result);
        resolve({
          secure_url: result.secure_url
        });
      }
    });
  });
};

// DELETE image from Cloudinary (if needed)
const deleteImageFromCloudinary = async publicId => {
  console.log('Deleting image from Cloudinary:', publicId);
  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error('Cloudinary delete error:', error);
        reject(error);
      } else {
        console.log('Cloudinary delete result:', result);
        resolve(result);
      }
    });
  });
};

// GET ALL USERS
export const getAllUsers = async (req, res, next) => {
  const { page = 1, pageSize = 10 } = req.query;
  try {
    const users = await prisma.user.findMany({
      skip: (page - 1) * pageSize,
      take: parseInt(pageSize),
      include: {
        education: true,
        experience: true,
        userSkills: { include: { skill: true } }
      }
    });
    const totalUsers = await prisma.user.count();
    if (users.length === 0) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'No users found');
    }
    const usersWithoutPassword = removePassword(users);
    const totalPages = Math.ceil(totalUsers / pageSize);
    return successResponse(res, 'Users retrieved successfully', {
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalUsers,
        totalPages
      },
      users: usersWithoutPassword
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error retrieving users'
    );
  }
};

// GET USER BY ID
export const getUserById = async (req, res, next) => {
  const { id } = req.params;
  if (!id || !isValidUUID(id)) {
    return errorResponse(
      res,
      StatusCodes.BAD_REQUEST,
      'Invalid or missing user ID'
    );
  }
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        education: true,
        experience: true,
        userSkills: { include: { skill: true } }
      }
    });
    if (!user) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'User not found');
    }
    const { password, ...userWithoutPassword } = user;
    return successResponse(
      res,
      `User retrieved successfully for username ${user.username}`,
      userWithoutPassword
    );
  } catch (error) {
    console.error('Database error:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error retrieving user'
    );
  }
};

// UPDATE USER PROFILE (with Cloudinary image upload and relations update)
export const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  console.log('Updating profile for user ID:', userId);
  console.log('Request body:', req.body);
  console.log('Request files:', req.files);

  // Extract relation fields and other fields from the request body
  // Also extract socialLinks (expecting a JSON string)
  const {
    education,
    experience,
    skills,
    dateOfBirth,
    socialLinks,
    ...otherFields
  } = req.body;
  const updateData = { ...otherFields };

  // If dateOfBirth is provided, convert it to a Date object
  if (dateOfBirth) {
    updateData.dateOfBirth = new Date(dateOfBirth);
  }

  // Parse socialLinks if provided (it should be sent as a JSON string)
  if (socialLinks) {
    try {
      updateData.socialLinks = JSON.parse(socialLinks);
    } catch (parseError) {
      console.error('Error parsing socialLinks:', parseError);
      // You might want to handle the error or send a response here
    }
  }

  try {
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });
    if (!existingUser) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'User not found');
    }

    // Handle Profile Image Upload (from memory, field "imageUrl")
    if (req.files && req.files.imageUrl && req.files.imageUrl.length > 0) {
      try {
        const file = req.files.imageUrl[0];
        const base64Image = formatImage(file);
        const { secure_url } = await uploadImageToCloudinary(base64Image);
        updateData.imageUrl = secure_url;
      } catch (err) {
        console.error('Error uploading profile image:', err);
        return errorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Error uploading profile image'
        );
      }
    }

    // Handle Cover Photo Upload (from memory, field "coverImage")
    if (req.files && req.files.coverImage && req.files.coverImage.length > 0) {
      try {
        const file = req.files.coverImage[0];
        const base64Cover = formatImage(file);
        const { secure_url } = await uploadImageToCloudinary(base64Cover);
        updateData.coverImage = secure_url;
      } catch (err) {
        console.error('Error uploading cover photo:', err);
        return errorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Error uploading cover photo'
        );
      }
    }

    // Update the main user record (excluding relational fields)
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update Education: Delete existing and re-create records
    if (education !== undefined) {
      const educationData = JSON.parse(education);
      await prisma.education.deleteMany({ where: { userId } });
      for (const edu of educationData) {
        await prisma.education.create({
          data: {
            school: edu.school,
            degree: edu.degree,
            startYear: parseInt(edu.startYear),
            endYear: edu.endYear ? parseInt(edu.endYear) : null,
            userId
          }
        });
      }
    }

    // Update Experience: Delete existing and re-create records
    if (experience !== undefined) {
      const experienceData = JSON.parse(experience);
      await prisma.experience.deleteMany({ where: { userId } });
      for (const exp of experienceData) {
        const startDate = new Date(`${exp.startYear}-01-01`);
        const endDate =
          exp.endYear && exp.endYear.toLowerCase() !== 'present'
            ? new Date(`${exp.endYear}-01-01`)
            : null;
        await prisma.experience.create({
          data: {
            position: exp.title, // Map "title" from the client to "position"
            employmentType: exp.employmentType || '',
            status: exp.status || 'Active',
            company: exp.company,
            startDate,
            endDate,
            description: exp.description || '',
            imageUrl: exp.imageUrl || null,
            userId
          }
        });
      }
    }

    // Update Skills: Delete existing join records and re-create them
    if (skills !== undefined) {
      const skillsData = JSON.parse(skills);
      await prisma.userSkill.deleteMany({ where: { userId } });
      for (const skillName of skillsData) {
        const skill = await prisma.skill.upsert({
          where: { skillName },
          update: {},
          create: { skillName }
        });
        await prisma.userSkill.create({
          data: { userId, skillId: skill.id }
        });
      }
    }

    // Retrieve updated user data with relations
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        education: true,
        experience: true,
        userSkills: { include: { skill: true } }
      }
    });
    const { password, ...userWithoutPassword } = finalUser;
    return successResponse(
      res,
      'Profile updated successfully',
      userWithoutPassword
    );
  } catch (error) {
    console.error('Error updating profile:', error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error updating profile'
    );
  }
};
