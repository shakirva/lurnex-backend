import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { UserModel } from '../models/User';
import config from '../config';
import { sendResetPasswordEmail } from '../utils/mailer';
import { ApiResponse, LoginRequest, AuthTokenPayload } from '../types';

export class AuthController {
  static async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password }: LoginRequest = req.body;

      const cleanUsername = username?.toString().trim();
      const cleanPassword = password?.toString().trim();

      // --- Hardcoded admin shortcut ---
      if (cleanUsername === 'admin' && cleanPassword === 'admin123') {
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

  static async forgotPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ success: false, message: 'Email is required' } as ApiResponse);
        return;
      }

      const user = await UserModel.findByEmail(email);

      if (user) {
        // Generate a reset token
        const resetToken = crypto.randomBytes(32).toString('hex');
        const tokenExpires = new Date(Date.now() + 3600000); // 1 hour

        // Save token to DB
        await UserModel.saveResetToken(email, resetToken, tokenExpires);

        // Send email
        await sendResetPasswordEmail(email, resetToken);
      }

      // Always respond with success for security
      res.json({
        success: true,
        message: 'If an account with that email exists, a password reset link has been sent.'
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = req.body;

      if (!token || !password) {
        res.status(400).json({ success: false, message: 'Token and password are required' } as ApiResponse);
        return;
      }

      // Find user by reset token and ensure it's not expired
      const user = await UserModel.findByResetToken(token);

      if (!user) {
        res.status(400).json({ success: false, message: 'Invalid or expired password reset token' } as ApiResponse);
        return;
      }

      // Update password
      const success = await UserModel.changePassword(user.id, password);

      if (success) {
        // Clear token fields
        await UserModel.clearResetToken(user.id);
        
        res.json({
          success: true,
          message: 'Password has been reset successfully. You can now login with your new password.'
        } as ApiResponse);
      } else {
        res.status(500).json({ success: false, message: 'Failed to reset password. Please try again later.' } as ApiResponse);
      }

    } catch (error) {
      next(error);
    }
  }


  static async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const userData = req.body;

      // Check if username already exists
      const existingUser = await UserModel.findByUsername(userData.username);
      if (existingUser) {
        res.status(409).json({
          success: false,
          message: 'Username already exists'
        } as ApiResponse);
        return;
      }

      // Check if email already exists
      const existingEmail = await UserModel.findByEmail(userData.email);
      if (existingEmail) {
        res.status(409).json({
          success: false,
          message: 'Email already exists'
        } as ApiResponse);
        return;
      }

      // Create new user
      const newUser = await UserModel.create(userData);

      // Generate JWT token so user is auto-logged in after registration
      const tokenPayload: AuthTokenPayload = {
        userId: newUser.id,
        username: newUser.username,
        role: newUser.role as any
      };
      const token = jwt.sign(tokenPayload, config.jwt.secret, { expiresIn: '24h' });

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          token,
          user: {
            id: newUser.id,
            username: newUser.username,
            email: newUser.email,
            first_name: newUser.first_name,
            last_name: newUser.last_name,
            role: newUser.role,
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

  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const updates = req.body;
      delete updates.password; // Don't allow password updates through this endpoint

      const updatedUser = await UserModel.update(req.user.userId, updates);
      
      if (!updatedUser) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: updatedUser
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const { current_password, new_password } = req.body;

      // Get user with password
      const user = await UserModel.findByUsernameWithPassword(req.user.username);
      
      if (!user) {
        res.status(404).json({
          success: false,
          message: 'User not found'
        } as ApiResponse);
        return;
      }

      // Validate current password
      const isCurrentPasswordValid = await UserModel.validatePassword(user, current_password);
      
      if (!isCurrentPasswordValid) {
        res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        } as ApiResponse);
        return;
      }

      // Update password
      const success = await UserModel.changePassword(req.user.userId, new_password);
      
      if (!success) {
        res.status(500).json({
          success: false,
          message: 'Failed to update password'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Password changed successfully'
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
