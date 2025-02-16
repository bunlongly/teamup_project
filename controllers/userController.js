import { successResponse, errorResponse } from "../utils/responseUtil.js";
import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const removePassword = (users) => {
  return users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword;
  });
};

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

// Utility function to validate UUID format
const isValidUUID = (id) => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
    id
  );
};

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
      user,
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
