import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { loginValidation, registerValidation, changePasswordValidation } from '../utils/validators';

const router = Router();

// Public routes
router.post('/login', AuthController.login);
router.post('/register', registerValidation, handleValidationErrors, AuthController.register);
router.post('/forgot-password', AuthController.forgotPassword);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, handleValidationErrors, AuthController.changePassword);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;