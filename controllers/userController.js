import { successResponse, errorResponse } from '../utils/responseUtil.js';
import { StatusCodes } from 'http-status-codes';
import { PrismaClient } from '@prisma/client';
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';

const prisma = new PrismaClient();

// Utility function to remove password field from user data
const removePassword = users => {
  return users.map(user => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Utility function to validate UUID format
const isValidUUID = id => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
};

// Upload Image to Cloudinary
const uploadImageToCloudinary = async filePath => {
  console.log('Uploading image to Cloudinary:', filePath);
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(filePath, (error, result) => {
      if (error) {
        console.error('Cloudinary upload error:', error);
        reject(error);
      } else {
        console.log('Cloudinary upload result:', result);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id
        });
      }
    });
  });
};

// DELETE Image from Cloudinary
const deleteImageFromCloudinary = async publicId => {
  console.log('Deleting image from Cloudinary:', publicId);
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
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
        userSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    const totalUsers = await prisma.user.count();

    if (users.length === 0) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'No users found');
    }

    // Remove the password field before returning the response
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

  // Validate UUID
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
        userSkills: {
          include: {
            skill: true
          }
        }
      }
    });

    if (!user) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'User not found');
    }

    // Remove password before returning the response
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
  console.log('Request file:', req.file);

  // Extract relation fields separately and remove them from the main update
  const { education, experience, skills, ...otherFields } = req.body;
  const updateData = { ...otherFields };

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!existingUser) {
      return errorResponse(res, StatusCodes.NOT_FOUND, 'User not found');
    }

    // Handle Profile Image Upload if file exists
    if (req.file) {
      try {
        const { secure_url, public_id } = await uploadImageToCloudinary(
          req.file.path
        );
        updateData.imageUrl = secure_url;
        updateData.imagePublicId = public_id;
        fs.unlinkSync(req.file.path);

        // Delete old image from Cloudinary if exists
        if (existingUser.imagePublicId) {
          await deleteImageFromCloudinary(existingUser.imagePublicId);
        }
      } catch (err) {
        console.error('Error uploading image to Cloudinary:', err);
        return errorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Error uploading image'
        );
      }
    }

    // Update main user record (excluding relation fields)
    await prisma.user.update({
      where: { id: userId },
      data: updateData
    });

    // Update Education: delete existing education records and re-create
    if (education !== undefined) {
      const educationData = JSON.parse(education);
      await prisma.education.deleteMany({ where: { userId } });
      for (const edu of educationData) {
        await prisma.education.create({
          data: {
            school: edu.school,
            degree: edu.degree,
            // Convert startYear and endYear to numbers
            startYear: parseInt(edu.startYear),
            endYear: edu.endYear ? parseInt(edu.endYear) : null,
            userId
          }
        });
      }
    }

    // Update Experience: delete existing experience records and re-create
    if (experience !== undefined) {
      const experienceData = JSON.parse(experience);
      await prisma.experience.deleteMany({ where: { userId } });
      for (const exp of experienceData) {
        // Convert year string to Date object (assuming January 1st)
        const startDate = new Date(`${exp.startYear}-01-01`);
        const endDate =
          exp.endYear && exp.endYear.toLowerCase() !== 'present'
            ? new Date(`${exp.endYear}-01-01`)
            : null;
        await prisma.experience.create({
          data: {
            // Map "title" from the client to the required "position" field.
            position: exp.title,
            // Provide default values for required fields not provided by client.
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

    // Update Skills: assuming skills is a list of skill names,
    // and that you use a join table (UserSkill) with a Skill model.
    if (skills !== undefined) {
      const skillsData = JSON.parse(skills);
      // Delete existing user skills
      await prisma.userSkill.deleteMany({ where: { userId } });
      for (const skillName of skillsData) {
        // Upsert the skill (create if not exists) based on the unique field (skillName)
        const skill = await prisma.skill.upsert({
          where: { skillName },
          update: {},
          create: { skillName }
        });
        // Create the relation record in the join table
        await prisma.userSkill.create({
          data: {
            userId,
            skillId: skill.id
          }
        });
      }
    }

    // Retrieve updated user data with relations
    const finalUser = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        education: true,
        experience: true,
        userSkills: {
          include: { skill: true }
        }
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
