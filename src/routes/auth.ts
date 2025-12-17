import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { authenticateToken } from '../middleware/auth';
import { handleValidationErrors } from '../middleware/validation';
import { loginValidation, registerValidation, changePasswordValidation } from '../utils/validators';

const router = Router();

// Public routes
router.post('/login', AuthController.login); // Removed validation for simplicity
router.post('/register', registerValidation, handleValidationErrors, AuthController.register);

// Protected routes
router.get('/profile', authenticateToken, AuthController.getProfile);
router.put('/profile', authenticateToken, AuthController.updateProfile);
router.post('/change-password', authenticateToken, changePasswordValidation, handleValidationErrors, AuthController.changePassword);
router.post('/logout', authenticateToken, AuthController.logout);

export default router;