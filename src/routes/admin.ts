import { Router } from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth';
import { SubscriptionModel } from '../models/Subscription';
import { UserModel } from '../models/User';
import { UserController } from '../controllers/UserController';

const router = Router();

// List all candidates (Admin only)
router.get('/users/candidates', authenticateToken, requireAdmin, UserController.getCandidates);

// Update user status (Admin only)
router.put('/users/:id/status', authenticateToken, requireAdmin, UserController.updateStatus);

// Create user manually (Admin only)
router.post('/users', authenticateToken, requireAdmin, UserController.createUser);

// Delete user (Admin only)
router.delete('/users/:id', authenticateToken, requireAdmin, UserController.deleteUser);

// Enable subscription for a user (Admin only)
router.post('/subscriptions/enable', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId, planSlug } = req.body;

    if (!userId || !planSlug) {
      res.status(400).json({
        success: false,
        message: 'userId and planSlug are required'
      });
      return;
    }

    // Check if user exists
    const user = await UserModel.findById(userId);
    if (!user) {
      res.status(404).json({
        success: false,
        message: 'User not found'
      });
      return;
    }

    const subscription = await SubscriptionModel.createSubscription(userId, planSlug, 'OFFLINE_PAYMENT');
    
    if (!subscription) {
      res.status(500).json({
        success: false,
        message: 'Failed to create subscription'
      });
      return;
    }

    res.json({
      success: true,
      message: `Subscription successfully enabled for ${user.username}`,
      data: subscription
    });
  } catch (error) {
    console.error('Error enabling subscription:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while enabling subscription'
    });
  }
});

// Get user subscriptions (Admin only - for dashboard visibility)
router.get('/users/:userId/subscription', authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { userId } = req.params;
    const subscription = await SubscriptionModel.getUserSubscription(parseInt(userId));
    
    res.json({
      success: true,
      data: subscription
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to fetch subscription status'
    });
  }
});

export default router;
