import { v4 as uuid } from 'uuid';
import { getPrismaClient } from '@config/database';
import { AppError, TransactionContext } from '../types/index';
import {
  CreateCustomerDTO,
  UpdateCustomerDTO,
  PaginationDTO,
} from '@dtos/validators';

const prisma = getPrismaClient();

/**
 * Customer Service - Handles customer CRUD and advanced features
 */
export class CustomerService {
  /**
   * Create a new customer
   */
  async createCustomer(
    dto: CreateCustomerDTO,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot create customer for different organization');
    }

    // Validate assigned user exists in same organization
    if (dto.assignedToUserId) {
      const user = await prisma.user.findFirst({
        where: {
          id: dto.assignedToUserId,
          organizationId,
        },
      });

      if (!user) {
        throw new AppError(404, 'USER_NOT_FOUND', 'Assigned user not found');
      }

      // Check if user already has 5 customers
      const activeCount = await prisma.customer.count({
        where: {
          assignedToUserId: dto.assignedToUserId,
          organizationId,
          deletedAt: null,
        },
      });

      if (activeCount >= 5) {
        throw new AppError(
          400,
          'MAX_ASSIGNMENTS_EXCEEDED',
          'User already has maximum 5 customers assigned'
        );
      }
    }

    const customer = await prisma.customer.create({
      data: {
        id: uuid(),
        organizationId,
        name: dto.name,
        email: dto.email || null,
        phone: dto.phone || null,
        assignedToUserId: dto.assignedToUserId || null,
        version: 1,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'customer',
      customer.id,
      'created',
      performedBy.userId
    );

    return customer;
  }

  /**
   * Get customer by ID with tenant isolation
   */
  async getCustomer(customerId: string, organizationId: string) {
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId,
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    if (!customer) {
      throw new AppError(404, 'NOT_FOUND', 'Customer not found');
    }

    return customer;
  }

  /**
   * Get all customers in organization with pagination and search
   */
  async getCustomers(
    organizationId: string,
    pagination: PaginationDTO
  ) {
    const { page, pageSize, search } = pagination;
    const skip = (page - 1) * pageSize;

    // Build where clause for search
    const whereClause: any = {
      organizationId,
      deletedAt: null, // Exclude soft-deleted
    };

    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [customers, total] = await Promise.all([
      prisma.customer.findMany({
        where: whereClause,
        skip,
        take: pageSize,
        include: {
          assignedTo: {
            select: { id: true, name: true, email: true, role: true },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.customer.count({ where: whereClause }),
    ]);

    return {
      data: customers,
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
   * Update customer
   */
  async updateCustomer(
    customerId: string,
    organizationId: string,
    dto: UpdateCustomerDTO,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot update customer in different organization');
    }

    // Get customer first
    const customer = await this.getCustomer(customerId, organizationId);

    // Validate assigned user if changing assignment
    if (dto.assignedToUserId !== undefined && dto.assignedToUserId !== customer.assignedToUserId) {
      if (dto.assignedToUserId !== null) {
        const user = await prisma.user.findFirst({
          where: {
            id: dto.assignedToUserId,
            organizationId,
          },
        });

        if (!user) {
          throw new AppError(404, 'USER_NOT_FOUND', 'Assigned user not found');
        }

        // Check active assignments (excluding this customer if already assigned to this user)
        const activeCount = await prisma.customer.count({
          where: {
            assignedToUserId: dto.assignedToUserId,
            organizationId,
            deletedAt: null,
            id: { not: customerId },
          },
        });

        if (activeCount >= 5) {
          throw new AppError(
            400,
            'MAX_ASSIGNMENTS_EXCEEDED',
            'User already has maximum 5 customers assigned'
          );
        }
      }
    }

    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email !== undefined && { email: dto.email }),
        ...(dto.phone !== undefined && { phone: dto.phone }),
        ...(dto.assignedToUserId !== undefined && { assignedToUserId: dto.assignedToUserId }),
        version: { increment: 1 }, // Increment version for optimistic locking
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'customer',
      customerId,
      'updated',
      performedBy.userId
    );

    return updated;
  }

  /**
   * Assign customer to user with concurrency safety
   */
  async assignCustomerToUser(
    customerId: string,
    userId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot assign customer in different organization');
    }

    // Verify customer exists
    await this.getCustomer(customerId, organizationId);

    // Verify user exists in same organization
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new AppError(404, 'USER_NOT_FOUND', 'User not found');
    }

    // Check current active assignments (with transaction to prevent race condition)
    const activeCount = await prisma.customer.count({
      where: {
        assignedToUserId: userId,
        organizationId,
        deletedAt: null,
      },
    });

    if (activeCount >= 5) {
      throw new AppError(
        400,
        'MAX_ASSIGNMENTS_EXCEEDED',
        'User already has maximum 5 customers assigned'
      );
    }

    // Update with optimistic locking
    const updated = await prisma.customer.update({
      where: { id: customerId },
      data: {
        assignedToUserId: userId,
        version: { increment: 1 },
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'customer',
      customerId,
      'assigned',
      performedBy.userId,
      { assignedToUserId: userId }
    );

    return updated;
  }

  /**
   * Soft delete customer
   */
  async deleteCustomer(
    customerId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Get customer to verify it exists and not already deleted
    const customer = await this.getCustomer(customerId, organizationId);

    if (customer.deletedAt) {
      throw new AppError(400, 'ALREADY_DELETED', 'Customer already deleted');
    }

    const deleted = await prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: new Date(),
        version: { increment: 1 },
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'customer',
      customerId,
      'deleted',
      performedBy.userId
    );

    return deleted;
  }

  /**
   * Restore soft-deleted customer
   */
  async restoreCustomer(
    customerId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot restore customer in different organization');
    }

    // Fetch customer with soft delete check
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId,
      },
    });

    if (!customer) {
      throw new AppError(404, 'NOT_FOUND', 'Customer not found');
    }

    if (!customer.deletedAt) {
      throw new AppError(400, 'NOT_DELETED', 'Customer is not deleted');
    }

    const restored = await prisma.customer.update({
      where: { id: customerId },
      data: {
        deletedAt: null,
        version: { increment: 1 },
      },
      include: {
        assignedTo: {
          select: { id: true, name: true, email: true, role: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'customer',
      customerId,
      'restored',
      performedBy.userId
    );

    return restored;
  }

  /**
   * Get customer with notes
   */
  async getCustomerWithNotes(customerId: string, organizationId: string) {
    const customer = await this.getCustomer(customerId, organizationId);

    const notes = await prisma.note.findMany({
      where: {
        customerId,
        organizationId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { ...customer, notes };
  }

  /**
   * Log activity helper
   */
  private async logActivity(
    organizationId: string,
    entityType: string,
    entityId: string,
    action: string,
    performedByUserId?: string,
    metadata?: any
  ) {
    await prisma.activityLog.create({
      data: {
        id: uuid(),
        organizationId,
        entityType,
        entityId,
        action,
        performedByUserId,
        metadata,
        timestamp: new Date(),
      },
    });
  }
}

export const customerService = new CustomerService();
