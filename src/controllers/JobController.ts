import { Request, Response, NextFunction } from 'express';
import { JobModel } from '../models/Job';
import { JobCategoryModel } from '../models/JobCategory';
import { ApiResponse, CreateJobRequest, UpdateJobRequest, JobFilters, PaginationParams } from '../types';

export class JobController {
  static async createJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📝 Creating job with data:', req.body);
      
      // Clean up the job data and convert frontend fields to backend fields
      const jobData: CreateJobRequest = {
        title: req.body.title,
        company: req.body.company,
        location: req.body.location,
        type: req.body.type || 'Full-time',
        salary: req.body.salary,
        description: req.body.description,
        requirements: Array.isArray(req.body.requirements) ? req.body.requirements : [req.body.requirements || 'Basic skills'],
        logo: req.body.logo,
        category_id: req.body.category_id || 1,
        food_accommodation: req.body.foodAccommodation || req.body.food_accommodation || 'Not Provided',
        gender: req.body.gender || 'Any',
        expires_at: req.body.expires_at || null
      };
      
      // Use default admin user ID if not authenticated (for testing)
      const userId = req.user?.userId || 1;
      
      const newJob = await JobModel.create(jobData, userId);

      res.status(201).json({
        success: true,
        message: 'Job created successfully',
        data: newJob
      } as ApiResponse);

    } catch (error) {
      console.error('❌ Job creation error:', error);
      next(error);
    }
  }

  static async getAllJobs(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      console.log('📋 Getting all jobs...');
      
      const jobs = await JobModel.findAll();

      res.json({
        success: true,
        message: 'Jobs retrieved successfully',
        data: jobs
      } as ApiResponse);

    } catch (error) {
      console.error('❌ Error getting jobs:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch jobs'
      } as ApiResponse);
    }
  }

  static async getJobById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const jobId = parseInt(req.params.id);
      const job = await JobModel.findById(jobId);

      if (!job) {
        res.status(404).json({
          success: false,
          message: 'Job not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Job retrieved successfully',
        data: job
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async updateJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const jobId = parseInt(req.params.id);
      const updates: UpdateJobRequest = req.body;

      const updatedJob = await JobModel.update(jobId, updates);

      if (!updatedJob) {
        res.status(404).json({
          success: false,
          message: 'Job not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Job updated successfully',
        data: updatedJob
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async deleteJob(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          message: 'Authentication required'
        } as ApiResponse);
        return;
      }

      const jobId = parseInt(req.params.id);
      const success = await JobModel.delete(jobId);

      if (!success) {
        res.status(404).json({
          success: false,
          message: 'Job not found'
        } as ApiResponse);
        return;
      }

      res.json({
        success: true,
        message: 'Job deleted successfully'
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getJobsByCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categoryName = req.params.category;
      const jobs = await JobModel.findByCategory(categoryName);

      res.json({
        success: true,
        message: 'Jobs retrieved successfully',
        data: jobs
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getJobStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const stats = await JobModel.getStats();

      res.json({
        success: true,
        message: 'Job statistics retrieved successfully',
        data: stats
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async getJobCategories(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const categories = await JobCategoryModel.getCategoriesWithJobCount();

      res.json({
        success: true,
        message: 'Job categories retrieved successfully',
        data: categories
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }

  static async createJobCategory(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user || req.user.role !== 'admin') {
        res.status(403).json({
          success: false,
          message: 'Admin privileges required'
        } as ApiResponse);
        return;
      }

      const { name, description } = req.body;
      const category = await JobCategoryModel.create(name, description);

      res.status(201).json({
        success: true,
        message: 'Job category created successfully',
        data: category
      } as ApiResponse);

    } catch (error) {
      next(error);
    }
  }
}