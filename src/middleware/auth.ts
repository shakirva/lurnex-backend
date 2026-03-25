import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config';
import { AuthTokenPayload } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: AuthTokenPayload;
    }
  }
}

export const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({
      success: false,
      message: 'Access token required'
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    res.status(403).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

export const optionalAuthenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return next();
  }

  try {
    const decoded = jwt.verify(token, config.jwt.secret) as AuthTokenPayload;
    req.user = decoded;
    next();
  } catch (error) {
    // If token is invalid/expired, still continue as guest
    next();
  }
};

export const requireAdmin = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin') {
    res.status(403).json({
      success: false,
      message: 'Admin privileges required'
    });
    return;
  }

  next();
};

export const requireAdminOrEmployer = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.user) {
    res.status(401).json({
      success: false,
      message: 'Authentication required'
    });
    return;
  }

  if (req.user.role !== 'admin' && req.user.role !== 'employer') {
    res.status(403).json({
      success: false,
      message: 'Admin or Employer privileges required'
    });
    return;
  }

  next();
};