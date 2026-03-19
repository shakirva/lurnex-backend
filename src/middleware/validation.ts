import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { ApiResponse } from '../types';

export const handleValidationErrors = (req: Request, res: Response, next: NextFunction): void => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    const errorMessages = errors.array().map(error => error.msg).join(', ');
    
    console.log('❌ Validation failed:', errorMessages);
    
    const response: ApiResponse = {
      success: false,
      message: 'Validation failed',
      error: errorMessages
    };
    
    res.status(400).json(response);
    return;
  }
  
  next();
};