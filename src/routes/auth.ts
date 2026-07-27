import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { loginValidation, registerValidation, changePasswordValidation } from '../utils/validators';

const router = Router();

// Public routes
router.post('/login', AuthController.login);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.post('/logout', authenticateToken, AuthController.logout);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;