import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { SubscriptionModel } from '../models/Subscription';
import { UserModel } from '../models/User';
import { UserController } from '../controllers/UserController';

const router = Router();

// List all managers (Admin only)
router.get('/users/managers', authenticateToken, requireAdmin, UserController.getManagers);

// Update user status (Admin only)
router.put('/users/:id/status', authenticateToken, requireAdmin, UserController.updateStatus);

// Create user manually (Admin only)
router.post('/users', authenticateToken, requireAdmin, UserController.createUser);

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, UserController.deleteUser);

export default router;
