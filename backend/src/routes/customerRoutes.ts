import { Router } from 'express';
import { customerController } from '@controllers/customerController';
import { adminOnlyMiddleware } from '@middleware/authMiddleware';

const router = Router();



// Create customer
router.post('/', (req, res, next) =>
  customerController.create(req as any, res).catch(next)
);

// Get all customers with pagination/search
router.get('/', (req, res, next) =>
  customerController.list(req as any, res).catch(next)
);

// Get customer by ID
router.get('/:id', (req, res, next) =>
  customerController.getById(req as any, res).catch(next)
);

// Get customer with notes
router.get('/:id/with-notes', (req, res, next) =>
  customerController.getWithNotes(req as any, res).catch(next)
);

// Update customer
router.put('/:id', (req, res, next) =>
  customerController.update(req as any, res).catch(next)
);

// Soft delete customer - Admin only
router.delete('/:id', adminOnlyMiddleware, (req, res, next) =>
  customerController.delete(req as any, res).catch(next)
);

// Restore soft-deleted customer - Admin only
router.post('/:id/restore', adminOnlyMiddleware, (req, res, next) =>
  customerController.restore(req as any, res).catch(next)
);

// Assign customer to user
router.post('/:id/assign', (req, res, next) =>
  customerController.assign(req as any, res).catch(next)
);

// Unassign customer from user
router.post('/:id/unassign', (req, res, next) =>
  customerController.unassign(req as any, res).catch(next)
);

export default router;
