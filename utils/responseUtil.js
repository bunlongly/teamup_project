export const successResponse = (res, message, data = {}) => {
  res.status(200).json({
    success: true,
    message,
    data,
  });
};

export const createdResponse = (res, message, data = {}) => {
  res.status(201).json({
    success: true,
    message,
    data,
  });
};

export const errorResponse = (res, statusCode, message, error = null) => {
  res.status(statusCode).json({
    success: false,
    message,
    error: error || null,
  });
};
