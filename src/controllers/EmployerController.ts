import { Request, Response, NextFunction } from 'express';
import database from '../config/database';
import { ApiResponse } from '../types';

export class EmployerController {
  // GET /api/employers — list all employer accounts (admin only)
  static async getAll(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const query = `
        SELECT u.id, u.username, u.email, u.first_name, u.last_name, u.phone, u.company_name, u.is_active, u.created_at, u.updated_at,
               (SELECT COUNT(*) FROM jobs WHERE posted_by = u.id) as job_posted_count,
               sp.name as plan_name, us.expires_at as plan_expires_at
        FROM users u
        LEFT JOIN user_subscriptions us ON u.id = us.user_id AND us.is_active = 1 AND us.expires_at > CURRENT_TIMESTAMP
        LEFT JOIN subscription_plans sp ON us.plan_id = sp.id
        WHERE u.role = 'employer'
        ORDER BY u.created_at DESC
      `;


      const rows = await database.query(query);

      res.json({
        success: true,
        message: 'Employers retrieved successfully',
        data: rows || []
      } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/employers/:id — get single employer
  static async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = parseInt(req.params.id);
      const query = `
        SELECT id, username, email, first_name, last_name, phone, company_name, is_active, created_at, updated_at
        FROM users WHERE id = ? AND role = 'employer'
      `;
      const rows = await database.query(query, [id]);

      if (!rows || rows.length === 0) {
        res.status(404).json({ success: false, message: 'Employer not found' } as ApiResponse);
        return;
      }

      res.json({ success: true, message: 'Employer retrieved', data: rows[0] } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  // PUT /api/employers/:id/profile — employer updates their own profile
  static async updateProfile(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' } as ApiResponse);
        return;
      }

      const { first_name, last_name, phone, company_name } = req.body;

      const query = `
        UPDATE users
        SET first_name = ?, last_name = ?, phone = ?, company_name = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ? AND role = 'employer'
      `;
      await database.query(query, [first_name, last_name, phone, company_name, req.user.userId]);

      const rows = await database.query(
        'SELECT id, username, email, first_name, last_name, phone, company_name, is_active FROM users WHERE id = ?',
        [req.user.userId]
      );

      res.json({ success: true, message: 'Profile updated', data: rows[0] } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }

  // GET /api/employers/my-jobs — employer sees their own posted jobs
  static async getMyJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({ success: false, message: 'Authentication required' } as ApiResponse);
        return;
      }

      const query = `
        SELECT j.*, c.name as category_name,
               (SELECT COUNT(*) FROM job_applications WHERE job_id = j.id) as applicant_count
        FROM jobs j
        LEFT JOIN job_categories c ON j.category_id = c.id
        WHERE j.posted_by = ?
        ORDER BY j.created_at DESC
      `;
      const rows = await database.query(query, [req.user.userId]);

      res.json({ success: true, message: 'Jobs retrieved', data: rows || [] } as ApiResponse);
    } catch (error) {
      next(error);
    }
  }
}
