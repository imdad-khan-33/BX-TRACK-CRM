import { Router } from 'express';
import { userController } from '@controllers/userController';
import { adminOnlyMiddleware } from '@middleware/authMiddleware';

const router = Router();

/**
 * User routes (all protected)
 */

// Create user (admin only)
router.post('/', adminOnlyMiddleware, (req, res, next) =>
  userController.create(req as any, res).catch(next)
);

// Get all users
router.get('/', (req, res, next) =>
  userController.list(req as any, res).catch(next)
);

// Get user by ID
router.get('/:id', (req, res, next) =>
  userController.getById(req as any, res).catch(next)
);

// Get active customer count
router.get('/:id/customer-count', (req, res, next) =>
  userController.getCustomerCount(req as any, res).catch(next)
);

// Update user
router.put('/:id', (req, res, next) =>
  userController.update(req as any, res).catch(next)
);

// Delete user (admin only)
router.delete('/:id', adminOnlyMiddleware, (req, res, next) =>
  userController.delete(req as any, res).catch(next)
);

// Restore user (admin only)
router.post('/:id/restore', adminOnlyMiddleware, (req, res, next) =>
  userController.restore(req as any, res).catch(next)
);

export default router;
