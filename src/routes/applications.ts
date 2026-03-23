import { Router } from 'express';
import { JobApplicationController, uploadApplicationFiles } from '../controllers/JobApplicationController';
import { authenticateToken, requireAdmin, requireAdminOrEmployer } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { createApplicationValidation, updateApplicationStatusValidation } from '../utils/validators';

const router = Router();

// Public routes (accepts both JSON and form data)
router.post('/', uploadApplicationFiles, JobApplicationController.createApplication);
router.get('/my-applications', JobApplicationController.getMyApplications);

// Protected routes
router.get('/', JobApplicationController.getAllApplications); // Currently open for dashboard
router.get('/stats', authenticateToken, requireAdminOrEmployer, JobApplicationController.getApplicationStats);
router.get('/job/:jobId', authenticateToken, requireAdminOrEmployer, JobApplicationController.getApplicationsByJob);
router.get('/:id', authenticateToken, requireAdminOrEmployer, JobApplicationController.getApplicationById);
router.put('/:id/status', authenticateToken, requireAdminOrEmployer, updateApplicationStatusValidation, handleValidationErrors, JobApplicationController.updateApplicationStatus);
router.delete('/:id', authenticateToken, requireAdmin, JobApplicationController.deleteApplication); // Keep delete for admin only
router.get('/:id/resume', authenticateToken, requireAdminOrEmployer, JobApplicationController.downloadResume);

export default router;