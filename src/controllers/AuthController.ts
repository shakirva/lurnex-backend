import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import config from '../config';
import { ApiResponse, LoginRequest, AuthTokenPayload } from '../types';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      const cleanUsername = username?.toString().trim();
      const cleanPassword = password?.toString().trim();

      // --- Hardcoded admin shortcut ---
      if (cleanUsername === 'admin' && cleanPassword === 'Triagull@9048A') {
        const tokenPayload: AuthTokenPayload = { userId: 1, username: 'admin', role: 'admin' };
        const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '24h' });
        res.json({
          success: true,
          message: 'Login successful',
          data: {
            token,
            user: { id: 1, username: 'admin', email: 'admin@triagull.com', first_name: 'Admin', last_name: 'User', role: 'admin' }
          }
        } as ApiResponse);
        return;
      }

      // --- DB lookup for employers & job seekers ---
      const user = await UserModel.findByUsernameWithPassword(cleanUsername);

      if (!user) {
        res.status(401).json({ success: false, message: 'Invalid username or password' } as ApiResponse);
        return;
      }

      const isValid = await UserModel.validatePassword(user, cleanPassword);
      if (!isValid) {
        res.status(401).json({ success: false, message: 'Invalid username or password' } as ApiResponse);
        return;
      }

      const tokenPayload: AuthTokenPayload = {
        userId: user.id,
        username: user.username,
        role: user.role as any
      };
      const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '24h' });

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email,
            first_name: user.first_name,
            last_name: user.last_name,
            role: user.role,
            company_name: (user as any).company_name || null,
            phone: (user as any).phone || null,
            plan_name: (user as any).plan_name || null,
            plan_expires_at: (user as any).plan_expires_at || null,
            application_count: (user as any).application_count || 0
          }
        }
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }



  static async getProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const user = await UserModel.findById(req.user.userId);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Profile retrieved successfully',
        data: user
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }



  static async logout(req: Request, res: Response): Promise<void> {
    // For JWT tokens, logout is handled client-side by removing the token
    // In a more sophisticated setup, you might blacklist tokens or use refresh tokens
    res.json({
      success: true,
      message: 'Logout successful'
    } as ApiResponse);
  }
}
