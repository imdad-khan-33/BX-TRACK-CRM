import { Response } from 'express';
import { TenantRequest, AppError } from '../types/index';
import { authService } from '@services/authService';
import { LoginSchema } from '@dtos/validators';

/**
 * Auth Controller
 */
export class AuthController {
  /**
   * POST /api/v1/auth/login
   */
  async login(req: TenantRequest, res: Response): Promise<void> {
    try {
      const { email, password } = LoginSchema.parse(req.body);

      const result = await authService.login({ email, password });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/v1/auth/refresh
   */
  async refresh(req: TenantRequest, res: Response): Promise<void> {
    try {
      if (!req.tenant) {
        throw new AppError(401, 'NO_TOKEN', 'No authentication token provided');
      }

      const token = authService.refreshToken(
        req.tenant.userId,
        req.tenant.organizationId,
        req.tenant.userRole
      );

      res.json({
        success: true,
        data: { token },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const authController = new AuthController();
