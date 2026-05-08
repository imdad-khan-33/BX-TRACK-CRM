import { Router } from 'express';
import { activityLogController } from '@controllers/activityLogController';

const router = Router();

/**
 * Activity Log routes (all protected)
 */

// Get activity logs
router.get('/', (req, res, next) =>
  activityLogController.list(req as any, res).catch(next)
);

// Get summary
router.get('/summary', (req, res, next) =>
  activityLogController.getSummary(req as any, res).catch(next)
);

// Get logs by entity
router.get('/entity/:entityId', (req, res, next) =>
  activityLogController.getByEntity(req as any, res).catch(next)
);

// Get logs by user
router.get('/user/:userId', (req, res, next) =>
  activityLogController.getByUser(req as any, res).catch(next)
);

export default router;
