import { Router } from 'express';
import { noteController } from '@controllers/noteController';

const router = Router();

/**
 * Note routes (all protected)
 */

// Create note
router.post('/', (req, res, next) =>
  noteController.create(req as any, res).catch(next)
);

// Get note by ID
router.get('/:id', (req, res, next) =>
  noteController.getById(req as any, res).catch(next)
);

// Get notes for customer
router.get('/customer/:customerId', (req, res, next) =>
  noteController.listByCustomer(req as any, res).catch(next)
);

// Update note
router.put('/:id', (req, res, next) =>
  noteController.update(req as any, res).catch(next)
);

// Delete note
router.delete('/:id', (req, res, next) =>
  noteController.delete(req as any, res).catch(next)
);

export default router;
