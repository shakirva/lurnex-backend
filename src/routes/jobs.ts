import { Router } from 'express';
import { JobController } from '../controllers/JobController';
import { authenticateToken, optionalAuthenticateToken, requireAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { createJobValidation, updateJobValidation, createCategoryValidation } from '../utils/validators';

const router = Router();


// Publicly accessible routes (with optional auth for masking logic)
router.get('/', optionalAuthenticateToken, JobController.getAllJobs);
router.get('/categories', JobController.getJobCategories);
router.get('/category/:category', optionalAuthenticateToken, JobController.getJobsByCategory);
router.get('/:id', optionalAuthenticateToken, JobController.getJobById);


// Protected routes
router.post('/', authenticateToken, JobController.createJob);
router.put('/:id', authenticateToken, requireAdmin, updateJobValidation, handleValidationErrors, JobController.updateJob);
router.delete('/:id', authenticateToken, requireAdmin, JobController.deleteJob);
router.get('/admin/stats', authenticateToken, requireAdmin, JobController.getJobStats);

// Category management (Admin only)
router.post('/categories', authenticateToken, requireAdmin, createCategoryValidation, handleValidationErrors, JobController.createJobCategory);

export default router;