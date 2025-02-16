import { body, validationResult } from "express-validator";
import { PrismaClient } from "@prisma/client"; // Import Prisma Client
import { BadRequestError } from "../errors/customError.js";

// Instantiate Prisma Client
const prisma = new PrismaClient();

// Validation Helper Function
const withValidationErrors = (validateValues) => {
  return [
    validateValues,
    async (req, res, next) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        const errorMessages = errors.array().map((error) => error.msg);
        console.log("Validation errors:", errorMessages);
        return res.status(400).json({ errors: errorMessages });
      }
      next();
    },
  ];
};

// Validation for User Registration
export const validateRegisterInput = withValidationErrors([
  body("firstName").notEmpty().withMessage("First name is required"),
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email) => {
      const existingEmail = await prisma.user.findUnique({
        where: { email },
      });
      if (existingEmail) {
        throw new BadRequestError("Email already exists");
      }
    }),
  body("username")
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username) => {
      const existingUsername = await prisma.user.findUnique({
        where: { username },
      });
      if (existingUsername) {
        throw new BadRequestError("Username already exists");
      }
    }),
  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters long"),
  body("lastName").notEmpty().withMessage("Last name is required"),
]);

// Validation for User Login
export const validateLoginInput = withValidationErrors([
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
  body("password").notEmpty().withMessage("Password is required"),
]);

// Validation for Profile Update
export const validateUpdateUserProfile = withValidationErrors([
  body("firstName").optional().notEmpty().withMessage("First name is required"),
  body("lastName").optional().notEmpty().withMessage("Last name is required"),
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email format")
    .custom(async (email, { req }) => {
      if (email && email !== req.user.email) {
        const existingEmail = await prisma.user.findUnique({
          where: { email },
        });
        if (existingEmail) {
          throw new BadRequestError("Email already exists");
        }
      }
    }),
  body("username")
    .optional()
    .notEmpty()
    .withMessage("Username is required")
    .custom(async (username, { req }) => {
      if (username && username !== req.user.username) {
        const existingUsername = await prisma.user.findUnique({
          where: { username },
        });
        if (existingUsername) {
          throw new BadRequestError("Username already exists");
        }
      }
    }),
  body("phoneNumber")
    .optional()
    .notEmpty()
    .withMessage("Phone number is required"),
]);

// Custom Error Handler Middleware
const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err);

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || "Something went wrong, please try again later";

  return errorResponse(res, statusCode, message);
};

export default errorHandlerMiddleware;
