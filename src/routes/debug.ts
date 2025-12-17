import { Router } from 'express';
import bcrypt from 'bcryptjs';
import database from '../config/database';

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

export default router;