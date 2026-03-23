import { Router } from 'express';
import { EmployerController } from '../controllers/EmployerController';
import { authenticateToken, requireAdmin } from '../middleware/auth';

const router = Router();

// Admin: list all employers
router.get('/', authenticateToken, requireAdmin, EmployerController.getAll);

// Employer: update own profile
router.put('/profile', authenticateToken, EmployerController.updateProfile);

// Employer: get own jobs
router.get('/my-jobs', authenticateToken, EmployerController.getMyJobs);

// Admin: get single employer
router.get('/:id', authenticateToken, requireAdmin, EmployerController.getById);

export default router;
