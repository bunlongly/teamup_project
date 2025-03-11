import { StatusCodes } from "http-status-codes";
import { PrismaClient } from "@prisma/client";
import {
  hashPassword,
  comparePassword,
  createJWT,
} from "../utils/authUtils.js";
import {
  successResponse,
  createdResponse,
  errorResponse,
} from "../utils/responseUtil.js";

const prisma = new PrismaClient();

// Register route
export const register = [

  async (req, res, next) => {
    const {
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      confirmPassword,
      username,
    } = req.body;

    try {
      // Check if passwords match
      if (password !== confirmPassword) {
        return errorResponse(
          res,
          StatusCodes.BAD_REQUEST,
          "Passwords do not match"
        );
      }

      // Check if it's the first user and assign role
      const isFirstAccount = (await prisma.user.count()) === 0;
      const role = isFirstAccount ? "ADMIN" : "FREELANCER";

      // Hash the password before saving
      const hashedPassword = await hashPassword(password);

      // Create user in the database
      const user = await prisma.user.create({
        data: {
          firstName,
          lastName,
          phoneNumber,
          username,
          email,
          password: hashedPassword,
          role,
        },
      });

      // Only return the necessary user data, excluding the password
      const { password: _, ...userWithoutPassword } = user;

      return createdResponse(res, "User registered successfully", {
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Server error"
      );
    } finally {
      await prisma.$disconnect();
    }
  },
];

// Login route
export const login = [
  async (req, res, next) => {
    const { email, password } = req.body;

    try {
      // Fetch user with all related data
      const user = await prisma.user.findUnique({
        where: { email },
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

      // Email not found
      if (!user) {
        return errorResponse(res, StatusCodes.UNAUTHORIZED, "Email not found");
      }

      // Check password
      const isPasswordCorrect = await comparePassword(password, user.password);
      if (!isPasswordCorrect) {
        return errorResponse(
          res,
          StatusCodes.UNAUTHORIZED,
          "Incorrect password"
        );
      }

      // Create JWT token
      const token = createJWT({ userId: user.id, role: user.role });

      // Get expiration time
      const expiresIn =
        process.env.NODE_ENV === "production"
          ? "1d"
          : process.env.JWT_EXPIRES_IN;

      // Remove the password field before sending the response
      const { password: userPassword, ...userWithoutPassword } = user;

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        maxAge:
          expiresIn === "1d" ? 24 * 60 * 60 * 1000 : 90 * 24 * 60 * 60 * 1000, // 1 day in production, 90 days in development
      });

      return successResponse(res, "User logged in", {
        token,
        expiresIn,
        user: userWithoutPassword,
      });
    } catch (error) {
      console.error(error);
      return errorResponse(
        res,
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Server error"
      );
    } finally {
      await prisma.$disconnect();
    }
  },
];

// Logout route
export const logout = (req, res) => {
  try {
    res.cookie("token", "", { expires: new Date(0) });
    return successResponse(res, "User logged out!");
  } catch (error) {
    console.error(error);
    return errorResponse(
      res,
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Error logging out",
      error.message
    );
  }
};
