import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  console.error('Error:', error);

  // Default error response
  let statusCode = 500;
  let message = 'Internal server error';
  let errorDetail: string | undefined;

  // Handle different types of errors
  if (error.code === 'ER_DUP_ENTRY') {
    statusCode = 409;
    message = 'Duplicate entry';
    errorDetail = 'Resource already exists';
  } else if (error.code === 'ER_NO_REFERENCED_ROW_2') {
    statusCode = 400;
    message = 'Invalid reference';
    errorDetail = 'Referenced resource does not exist';
  } else if (error.name === 'ValidationError') {
    statusCode = 400;
    message = 'Validation error';
    errorDetail = error.message;
  } else if (error.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (error.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  } else if (error.status) {
    statusCode = error.status;
    message = error.message || message;
  }

  const response: ApiResponse = {
    success: false,
    message,
    error: errorDetail || (process.env.NODE_ENV === 'development' ? error.message : undefined)
  };

  res.status(statusCode).json(response);
};

export const notFoundHandler = (req: Request, res: Response): void => {
  const response: ApiResponse = {
    success: false,
    message: `Route ${req.originalUrl} not found`
  };
  
  res.status(404).json(response);
};