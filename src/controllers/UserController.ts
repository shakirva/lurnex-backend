import { Request, Response, NextFunction } from 'express';
import database from '../config/database';
import { ApiResponse } from '../types';

export class UserController {
  // GET /api/admin/users/candidates — list all job seeker accounts (admin only)
  static async getCandidates(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.experience_years, u.is_active, u.created_at, u.updated_at,
               (SELECT COUNT(*) FROM job_applications WHERE applicant_email = u.email) as application_count,
               sp.name as plan_name, us.expires_at as plan_expires_at
        FROM users u
        LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.is_active = 1 AND us.expires_at > CURRENT_TIMESTAMP
        LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE u.role = 'user'
        ORDER BY u.created_at DESC
      `;

      const rows = await database.query(query);

      res.json({
        success: true,
        message: 'Candidates retrieved successfully',
        data: rows || []
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  // POST /api/admin/users — create user (admin only)
  static async createUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password, first_name, last_name, role, phone, company_name, experience_years } = req.body;

      if (!username || !email || !password || !role) {
        res.status(400).json({ success: false, message: 'Required fields missing' });
        return;
      }

      // Check if exists
      const existingUser = await database.query('SELECT id FROM users WHERE username = ? OR email = ?', [username, email]);
      if (existingUser && existingUser.length > 0) {
        res.status(409).json({ success: false, message: 'Username or Email already exists' });
        return;
      }

      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash(password, 12);

      const query = `
        INSERT INTO users (username, email, password, first_name, last_name, role, phone, company_name, experience_years)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      const result = await database.query(query, [
        username,
        email,
        hashedPassword,
        first_name,
        last_name,
        role,
        phone || null,
        company_name || null,
        experience_years || 0
      ]);

      res.status(201).json({
        success: true,
        message: 'User created successfully',
        data: { id: result.insertId }
      });
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/admin/users/:id/status — activate/deactivate user (admin only)
  static async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { is_active } = req.body;

      await database.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);

      res.json({
        success: true,
        message: `User ${is_active ? 'activated' : 'deactivated'} successfully`
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  // DELETE /api/admin/users/:id — delete user account (admin only)
  static async deleteUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;

      // 1. Delete associated data if needed (optional depending on DB constraints)
      // For now, let's just delete the user. Cascade delete should handle applications/jobs if configured.

      await database.query('DELETE FROM users WHERE id = ?', [id]);

      res.json({
        success: true,
        message: 'User deleted successfully'
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
