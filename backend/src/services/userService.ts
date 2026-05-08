import { hash, compare } from 'bcryptjs';
import { v4 as uuid } from 'uuid';
import { getPrismaClient } from '@config/database';
import { AppError, TransactionContext } from '../types/index';
import { CreateUserDTO, UpdateUserDTO } from '@dtos/validators';

const prisma = getPrismaClient();

/**
 * User Service - Handles user CRUD operations
 */
export class UserService {
  /**
   * Create a new user (admin only)
   */
  async createUser(
    dto: CreateUserDTO,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Only admins can create users
    if (performedBy.userRole !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can create users');
    }

    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot create user for different organization');
    }

    // Check if email already exists in organization
    const existingUser = await prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email: dto.email,
        },
      },
    });

    if (existingUser) {
      throw new AppError(409, 'DUPLICATE_EMAIL', 'Email already exists in this organization');
    }

    // Hash password
    const passwordHash = await hash(dto.password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        id: uuid(),
        organizationId,
        name: dto.name,
        email: dto.email,
        passwordHash,
        role: dto.role,
      },
    });

    // Log activity
    await this.logActivity(organizationId, 'user', user.id, 'created', performedBy.userId);

    return this.excludePassword(user);
  }

  /**
   * Get user by ID with tenant isolation
   */
  async getUser(userId: string, organizationId: string) {
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    return this.excludePassword(user);
  }

  /**
   * Get all users in organization
   */
  async getUsers(organizationId: string, page: number = 1, pageSize: number = 20) {
    const skip = (page - 1) * pageSize;

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where: { 
          organizationId,
          deletedAt: null 
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ 
        where: { 
          organizationId,
          deletedAt: null 
        } 
      }),
    ]);

    return {
      data: users.map((u) => this.excludePassword(u)),
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
   * Update user
   */
  async updateUser(
    userId: string,
    organizationId: string,
    dto: UpdateUserDTO,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot update user in different organization');
    }

    // Get user first to verify it exists
    const user = await this.getUser(userId, organizationId);

    // Check if new email is unique (if changing email)
    if (dto.email && dto.email !== user.email) {
      const existing = await prisma.user.findUnique({
        where: {
          organizationId_email: {
            organizationId,
            email: dto.email,
          },
        },
      });

      if (existing && existing.id !== userId) {
        throw new AppError(409, 'DUPLICATE_EMAIL', 'Email already exists in this organization');
      }
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.email && { email: dto.email }),
        ...(dto.role && { role: dto.role }),
      },
    });

    // Log activity
    await this.logActivity(organizationId, 'user', userId, 'updated', performedBy.userId);

    return this.excludePassword(updated);
  }

  /**
   * Delete user
   */
  async deleteUser(
    userId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Only admins can delete users
    if (performedBy.userRole !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can delete users');
    }

    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot delete user in different organization');
    }

    // Cannot delete yourself
    if (performedBy.userId === userId) {
      throw new AppError(400, 'BAD_REQUEST', 'You cannot delete your own account');
    }

    // Get user first to verify it exists and not already deleted
    const user = await this.getUser(userId, organizationId);
    if (user.deletedAt) {
      throw new AppError(400, 'ALREADY_DELETED', 'User already deleted');
    }

    // Soft delete user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: new Date() },
    });

    // Log activity
    await this.logActivity(organizationId, 'user', userId, 'deleted', performedBy.userId);

    return { success: true };
  }

  /**
   * Restore a soft-deleted user
   */
  async restoreUser(
    userId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Only admins can restore users
    if (performedBy.userRole !== 'admin') {
      throw new AppError(403, 'FORBIDDEN', 'Only admins can restore users');
    }

    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot restore user in different organization');
    }

    // Check if user exists (including deleted ones)
    const user = await prisma.user.findFirst({
      where: {
        id: userId,
        organizationId,
      },
    });

    if (!user) {
      throw new AppError(404, 'NOT_FOUND', 'User not found');
    }

    if (!user.deletedAt) {
      throw new AppError(400, 'BAD_REQUEST', 'User is not deleted');
    }

    // Restore user
    await prisma.user.update({
      where: { id: userId },
      data: { deletedAt: null },
    });

    // Log activity
    await this.logActivity(organizationId, 'user', userId, 'restored', performedBy.userId);

    return { success: true };
  }

  /**
   * Get user by email (for authentication)
   */
  async getUserByEmail(email: string, organizationId: string) {
    return prisma.user.findUnique({
      where: {
        organizationId_email: {
          organizationId,
          email,
        },
      },
    });
  }

  /**
   * Get user by email across all organizations (for login)
   */
  async getUserByEmailAcrossOrgs(email: string) {
    return prisma.user.findFirst({
      where: { email },
    });
  }

  /**
   * Verify password
   */
  async verifyPassword(passwordHash: string, password: string): Promise<boolean> {
    return compare(password, passwordHash);
  }

  /**
   * Get active customer count for user
   */
  async getActiveCustomerCount(userId: string, organizationId: string): Promise<number> {
    return prisma.customer.count({
      where: {
        assignedToUserId: userId,
        organizationId,
        deletedAt: null,
      },
    });
  }

  /**
   * Log activity helper
   */
  private async logActivity(
    organizationId: string,
    entityType: string,
    entityId: string,
    action: string,
    performedByUserId?: string
  ) {
    await prisma.activityLog.create({
      data: {
        id: uuid(),
        organizationId,
        entityType,
        entityId,
        action,
        performedByUserId,
        timestamp: new Date(),
      },
    });
  }

  /**
   * Remove password from user object
   */
  private excludePassword(user: any) {
    const { passwordHash, ...rest } = user;
    return rest;
  }
}

export const userService = new UserService();
