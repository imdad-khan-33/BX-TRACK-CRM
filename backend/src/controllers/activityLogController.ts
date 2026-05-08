import { Response } from 'express';
import { TenantRequest } from '../types/index';
import { activityLogService } from '@services/activityLogService';
import { PaginationSchema } from '@dtos/validators';
import { getTenantOrgId } from '@utils/tenantIsolation';

/**
 * Activity Log Controller
 */
export class ActivityLogController {
  /**
   * GET /api/v1/activity-logs
   * Get activity logs for organization
   */
  async list(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { page, pageSize } = PaginationSchema.parse(req.query);
      const { entityType, action } = req.query as { entityType?: string; action?: string };

      const result = await activityLogService.getActivityLogs(
        organizationId,
        page,
        pageSize,
        entityType,
        action
      );

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
   * GET /api/v1/activity-logs/entity/:entityId
   * Get activity logs for specific entity
   */
  async getByEntity(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { entityId } = req.params;
      const { page, pageSize } = PaginationSchema.parse(req.query);

      const result = await activityLogService.getEntityActivityLogs(
        entityId,
        organizationId,
        page,
        pageSize
      );

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
   * GET /api/v1/activity-logs/user/:userId
   * Get activity logs by user
   */
  async getByUser(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { userId } = req.params;
      const { page, pageSize } = PaginationSchema.parse(req.query);

      const result = await activityLogService.getActivityLogsByUser(
        userId,
        organizationId,
        page,
        pageSize
      );

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
   * GET /api/v1/activity-logs/summary
   * Get activity summary for last N days
   */
  async getSummary(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const days = req.query.days ? parseInt(req.query.days as string, 10) : 7;

      const summary = await activityLogService.getActivitySummary(organizationId, days);

      res.json({
        success: true,
        data: summary,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const activityLogController = new ActivityLogController();
