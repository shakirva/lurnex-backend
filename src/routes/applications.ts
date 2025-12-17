import { Router } from 'express';
import { JobApplicationController, uploadApplicationFiles } from '../controllers/JobApplicationController';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { createApplicationValidation, updateApplicationStatusValidation } from '../utils/validators';

const router = Router();

// Public routes (accepts both JSON and form data)
router.post('/', uploadApplicationFiles, JobApplicationController.createApplication);
router.get('/my-applications', JobApplicationController.getMyApplications);

// Protected routes (simplified - no auth for demo)
router.get('/', JobApplicationController.getAllApplications);
router.get('/stats', authenticateToken, requireAdmin, JobApplicationController.getApplicationStats);
router.get('/job/:jobId', authenticateToken, requireAdmin, JobApplicationController.getApplicationsByJob);
router.get('/:id', authenticateToken, requireAdmin, JobApplicationController.getApplicationById);
router.put('/:id/status', authenticateToken, requireAdmin, updateApplicationStatusValidation, handleValidationErrors, JobApplicationController.updateApplicationStatus);
router.delete('/:id', authenticateToken, requireAdmin, JobApplicationController.deleteApplication);
router.get('/:id/resume', authenticateToken, requireAdmin, JobApplicationController.downloadResume);

export default router;