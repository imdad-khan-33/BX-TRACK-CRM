import { getPrismaClient } from '@config/database';

const prisma = getPrismaClient();

/**
 * Activity Log Service - Handles activity logging and retrieval
 */
export class ActivityLogService {
  /**
   * Get activity logs for organization with pagination
   */
  async getActivityLogs(
    organizationId: string,
    page: number = 1,
    pageSize: number = 20,
    entityType?: string,
    action?: string
  ) {
    const skip = (page - 1) * pageSize;

    const whereClause: any = { organizationId };

    if (entityType) {
      whereClause.entityType = entityType;
    }

    if (action) {
      whereClause.action = action;
    }

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: whereClause,
        include: {
          performedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.activityLog.count({ where: whereClause }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get activity logs for a specific entity
   */
  async getEntityActivityLogs(
    entityId: string,
    organizationId: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          entityId,
          organizationId,
        },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.activityLog.count({
        where: {
          entityId,
          organizationId,
        },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get activity logs by performer
   */
  async getActivityLogsByUser(
    userId: string,
    organizationId: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    const skip = (page - 1) * pageSize;

    const [logs, total] = await Promise.all([
      prisma.activityLog.findMany({
        where: {
          performedByUserId: userId,
          organizationId,
        },
        include: {
          performedBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { timestamp: 'desc' },
      }),
      prisma.activityLog.count({
        where: {
          performedByUserId: userId,
          organizationId,
        },
      }),
    ]);

    return {
      data: logs,
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
        hasNextPage: page < Math.ceil(total / pageSize),
        hasPreviousPage: page > 1,
      },
    };
  }

  /**
   * Get summary of recent activities
   */
  async getActivitySummary(organizationId: string, days: number = 7) {
    console.log('Fetching summary for Org:', organizationId);

    // Temporarily removing date filter to confirm if data exists
    const logs = await prisma.activityLog.findMany({
      where: {
        organizationId,
      },
    });

    console.log('Logs found for summary:', logs.length);

    // Group by action type
    const actionCounts: any = {
      created: 0,
      updated: 0,
      deleted: 0,
      restored: 0,
      assigned: 0,
    };

    for (const log of logs) {
      const action = log.action.toLowerCase();
      if (actionCounts.hasOwnProperty(action)) {
        actionCounts[action]++;
      }
    }

    return {
      lastDays: days,
      totalActions: logs.length,
      actionCounts,
    };
  }
}

export const activityLogService = new ActivityLogService();
