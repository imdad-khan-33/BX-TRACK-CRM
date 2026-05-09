import { Router } from 'express';
import authRoutes from './authRoutes';
import userRoutes from './userRoutes';
import customerRoutes from './customerRoutes';
import noteRoutes from './noteRoutes';
import activityLogRoutes from './activityLogRoutes';
import { authMiddleware } from '@middleware/authMiddleware';

const router = Router();

/**
 * API v1 routes
 */

// Public test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Backend API is working perfectly!',
    vps_ip: '31.97.77.215',
    timestamp: new Date().toISOString()
  });
});

// Auth routes (no middleware required)
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/users', authMiddleware, userRoutes);
router.use('/customers', authMiddleware, customerRoutes);
router.use('/notes', authMiddleware, noteRoutes);
router.use('/activity-logs', authMiddleware, activityLogRoutes);

export default router;
