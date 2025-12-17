import { Router } from 'express';
import authRoutes from './auth';
import jobRoutes from './jobs';
import applicationRoutes from './applications';
import contactRoutes from './contact';
import debugRoutes from './debug';

const router = Router();

// API Routes
router.use('/auth', authRoutes);
router.use('/jobs', jobRoutes);
router.use('/applications', applicationRoutes);
router.use('/contact', contactRoutes);

// Debug routes (only in development)
if (process.env.NODE_ENV === 'development') {
  router.use('/debug', debugRoutes);
}

// Health check route
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API is running successfully',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

export default router;