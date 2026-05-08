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

// Auth routes (no middleware required)
router.use('/auth', authRoutes);

// Protected routes (require authentication)
router.use('/users', authMiddleware, userRoutes);
router.use('/customers', authMiddleware, customerRoutes);
router.use('/notes', authMiddleware, noteRoutes);
router.use('/activity-logs', authMiddleware, activityLogRoutes);

export default router;
