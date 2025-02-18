import { successResponse, errorResponse } from "../utils/responseUtil.js";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import cloudinary from "../config/cloudinary.js";
import fs from "fs";

const prisma = new PrismaClient();

// Utility function to remove password field from user data
const removePassword = (users) => {
  return users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

// Utility function to validate UUID format
const isValidUUID = (id) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
};

// Upload Image to Cloudinary
const uploadImageToCloudinary = async (filePath) => {
  console.log("Uploading image to Cloudinary:", filePath);
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.upload(filePath, (error, result) => {
      if (error) {
        console.error("Cloudinary upload error:", error);
        reject(error);
      } else {
        console.log("Cloudinary upload result:", result);
        resolve({
          secure_url: result.secure_url,
          public_id: result.public_id,
        });
      }
    });
  });
};

// DELETE Image from Cloudinary
const deleteImageFromCloudinary = async (publicId) => {
  console.log("Deleting image from Cloudinary:", publicId);
  return new Promise((resolve, reject) => {
    cloudinary.v2.uploader.destroy(publicId, (error, result) => {
      if (error) {
        console.error("Cloudinary delete error:", error);
        reject(error);
      } else {
        console.log("Cloudinary delete result:", result);
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
            skill: true,
          },
        },
      },
    });

    const totalUsers = await prisma.user.count();

    if (users.length === 0) {
      return errorResponse(res, StatusCodes.NOT_FOUND, "No users found");
    }

    // Remove the password field before returning the response
    const usersWithoutPassword = removePassword(users);
    const totalPages = Math.ceil(totalUsers / pageSize);

    return successResponse(res, "Users retrieved successfully", {
      pagination: {
        currentPage: parseInt(page),
        pageSize: parseInt(pageSize),
        totalUsers,
        totalPages,
      },
      users: usersWithoutPassword,
    });
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error retrieving users"
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
      "Invalid or missing user ID"
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
            skill: true,
          },
        },
      },
    });

    if (!user) {
      return errorResponse(res, StatusCodes.NOT_FOUND, "User not found");
    }

    // Remove password before returning the response
    const { password, ...userWithoutPassword } = user;

    return successResponse(
      res,
      `User retrieved successfully for username ${user.username}`,
      userWithoutPassword
    );
  } catch (error) {
    console.error("Database error:", error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error retrieving user"
    );
  }
};

// UPDATE USER PROFILE (with Cloudinary image upload)
export const updateUserProfile = async (req, res) => {
  const { userId } = req.user;
  console.log("Updating profile for user ID:", userId);
  console.log("Request body:", req.body);
  console.log("Request file:", req.file);
  const updateData = {};

  // Allowed fields for profile update
  const allowedFields = [
    "firstName",
    "lastName",
    "email",
    "username",
    "phoneNumber",
    "location",
    "imageUrl",
    "jobTitle",
    "bio",
    "description",
  ];

  for (const field of allowedFields) {
    if (req.body[field] !== undefined) {
      updateData[field] = req.body[field];
    }
  }

  try {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      return errorResponse(res, StatusCodes.NOT_FOUND, "User not found");
    }

    // Handle Profile Image Upload
    if (req.file) {
      try {
        // Upload new image to Cloudinary
        const { secure_url, public_id } = await uploadImageToCloudinary(
          req.file.path
        );

        // Save new image details in DB
        updateData.imageUrl = secure_url;
        updateData.imagePublicId = public_id;

        // Remove local file after upload
        fs.unlinkSync(req.file.path);

        // Delete old image from Cloudinary
        if (existingUser.imagePublicId) {
          await deleteImageFromCloudinary(existingUser.imagePublicId);
        }
      } catch (err) {
        console.error("Error uploading image to Cloudinary:", err);
        return errorResponse(
          res,
          StatusCodes.INTERNAL_SERVER_ERROR,
          "Error uploading image"
        );
      }
    }

    // Update user data
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      include: {
        education: true,
        experience: true,
        userSkills: {
          include: {
            skill: true,
          },
        },
      },
    });

    // Remove password field before sending response
    const { password, ...userWithoutPassword } = updatedUser;

    return successResponse(
      res,
      "Profile updated successfully",
      userWithoutPassword
    );
  } catch (error) {
    console.error("Error updating profile:", error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error updating profile"
    );
  }
};
