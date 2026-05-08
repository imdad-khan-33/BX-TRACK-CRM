import { Router } from 'express';
import { authController } from '@controllers/authController';

const router = Router();

/**
 * Auth routes
 */
router.post('/login', (req, res, next) =>
  authController.login(req as any, res).catch(next)
);

router.post('/refresh', (req, res, next) =>
  authController.refresh(req as any, res).catch(next)
);

export default router;
