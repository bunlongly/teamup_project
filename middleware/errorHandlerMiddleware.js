import { StatusCodes } from 'http-status-codes';
import jwt from 'jsonwebtoken';
import {
  UnauthenticatedError,
  UnauthorizedError
} from '../errors/customError.js';
import { errorResponse } from '../utils/responseUtil.js';

export const authenticateUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) throw new UnauthenticatedError('Authentication required');

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    throw new UnauthenticatedError('Invalid authentication token');
  }
};

export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new UnauthorizedError('You do not have permission');
    }
    next();
  };
};

const errorHandlerMiddleware = (err, req, res, next) => {
  console.error(err); // Log for debugging

  const statusCode = err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR;
  const message = err.message || 'Something went wrong, please try again later';

  return errorResponse(res, statusCode, message);
};

export default errorHandlerMiddleware;
