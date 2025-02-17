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
