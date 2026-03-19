import { Router } from 'express';
import bcrypt from 'bcryptjs';
import database from '../config/database';
import { SubscriptionModel } from '../models/Subscription';

const router = Router();

// Debug endpoint to test admin password (remove in production)
router.post('/debug/test-admin', async (req, res) => {
  try {
    const { password } = req.body;
    
    // Get admin user with password
    const query = 'SELECT * FROM users WHERE username = ? AND role = ?';
    const [users] = await database.query(query, ['admin', 'admin']);
    
    if (!users || users.length === 0) {
      return res.json({
        success: false,
        message: 'Admin user not found',
        debug: 'No admin user in database'
      });
    }
    
    const admin = users[0];
    const isPasswordValid = await bcrypt.compare(password || 'admin123', admin.password);
    
    res.json({
      success: true,
      debug: {
        userFound: true,
        userId: admin.id,
        username: admin.username,
        email: admin.email,
        role: admin.role,
        isActive: admin.is_active,
        passwordTest: isPasswordValid,
        hashedPassword: admin.password.substring(0, 20) + '...'
      }
    });
    
  } catch (error) {
    console.error('Debug test error:', error);
    res.status(500).json({
      success: false,
      message: 'Debug test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// Debug endpoint to activate a subscription for testing
router.post('/activate-subscription', async (req, res) => {
  try {
    const { userId, planSlug } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        message: 'userId is required'
      });
    }

    const subscription = await SubscriptionModel.createSubscription(userId, planSlug || 'premium', 'DEBUG_TEST_BYPASS');
    
    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: 'Plan not found or failed to create subscription'
      });
    }

    res.json({
      success: true,
      message: `Test subscription (${planSlug || 'premium'}) activated for user ${userId}`,
      data: subscription
    });
    
  } catch (error) {
    console.error('Subscription activation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to activate test subscription',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

export default router;