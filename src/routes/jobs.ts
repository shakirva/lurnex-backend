import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { createJobValidation, updateJobValidation, createCategoryValidation } from '../utils/validators';

const router = Router();

// Public routes
router.get('/', JobController.getAllJobs);
router.get('/categories', JobController.getJobCategories);
router.get('/category/:category', JobController.getJobsByCategory);
router.get('/:id', JobController.getJobById);

// Protected routes (Admin only) - Temporarily simplified for testing
router.post('/', JobController.createJob);
router.put('/:id', authenticateToken, requireAdmin, updateJobValidation, handleValidationErrors, JobController.updateJob);
router.delete('/:id', authenticateToken, requireAdmin, JobController.deleteJob);
router.get('/admin/stats', authenticateToken, requireAdmin, JobController.getJobStats);

// Category management (Admin only)
router.post('/categories', authenticateToken, requireAdmin, createCategoryValidation, handleValidationErrors, JobController.createJobCategory);

export default router;