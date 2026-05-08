import { Response } from 'express';
import { TenantRequest } from '../types/index';
import { userService } from '@services/userService';
import { CreateUserSchema, UpdateUserSchema, PaginationSchema } from '@dtos/validators';
import { getTenantOrgId, getCurrentUserId } from '@utils/tenantIsolation';

/**
 * User Controller
 */
export class UserController {
  /**
   * POST /api/v1/users
   * Create a new user (admin only)
   */
  async create(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);

      const dto = CreateUserSchema.parse(req.body);

      const user = await userService.createUser(
        dto,
        organizationId,
        {
          organizationId,
          userId,
          userRole: req.tenant!.userRole,
        }
      );

      res.status(201).json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/users/:id
   * Get user by ID
   */
  async getById(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { id } = req.params;

      const user = await userService.getUser(id, organizationId);

      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/users
   * Get all users in organization (with pagination)
   */
  async list(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { page, pageSize } = PaginationSchema.parse(req.query);

      const result = await userService.getUsers(organizationId, page, pageSize);

      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * PUT /api/v1/users/:id
   * Update user
   */
  async update(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const dto = UpdateUserSchema.parse(req.body);

      const user = await userService.updateUser(id, organizationId, dto, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: user,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/users/:id/customer-count
   * Get active customer count for a user
   */
  async getCustomerCount(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { id } = req.params;

      const count = await userService.getActiveCustomerCount(id, organizationId);

      res.json({
        success: true,
        data: { count, maxAssignments: 5 },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/v1/users/:id
   * Delete user
   */
  async delete(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const currentUserId = getCurrentUserId(req);
      const { id } = req.params;

      await userService.deleteUser(id, organizationId, {
        organizationId,
        userId: currentUserId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        message: 'User deleted successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/v1/users/:id/restore
   * Restore a soft-deleted user
   */
  async restore(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const currentUserId = getCurrentUserId(req);
      const { id } = req.params;

      await userService.restoreUser(id, organizationId, {
        organizationId,
        userId: currentUserId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        message: 'User restored successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const userController = new UserController();
