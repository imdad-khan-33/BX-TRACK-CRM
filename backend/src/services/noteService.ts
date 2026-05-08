import { v4 as uuid } from 'uuid';
import { getPrismaClient } from '@config/database';
import { AppError, TransactionContext } from '../types/index';
import { CreateNoteDTO } from '@dtos/validators';

const prisma = getPrismaClient();

/**
 * Note Service - Handles note CRUD operations
 */
export class NoteService {
  /**
   * Create a note for a customer
   */
  async createNote(
    dto: CreateNoteDTO,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot create note for different organization');
    }

    // Verify customer exists and belongs to organization
    const customer = await prisma.customer.findFirst({
      where: {
        id: dto.customerId,
        organizationId,
      },
    });

    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    // Create note
    const note = await prisma.note.create({
      data: {
        id: uuid(),
        customerId: dto.customerId,
        organizationId,
        content: dto.content,
        createdByUserId: performedBy.userId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'note',
      note.id,
      'added',
      performedBy.userId,
      { customerId: dto.customerId }
    );

    return note;
  }

  /**
   * Get note by ID with tenant isolation
   */
  async getNote(noteId: string, organizationId: string) {
    const note = await prisma.note.findFirst({
      where: {
        id: noteId,
        organizationId,
      },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    if (!note) {
      throw new AppError(404, 'NOT_FOUND', 'Note not found');
    }

    return note;
  }

  /**
   * Get all notes for a customer
   */
  async getNotesByCustomer(
    customerId: string,
    organizationId: string,
    page: number = 1,
    pageSize: number = 20
  ) {
    // Verify customer exists
    const customer = await prisma.customer.findFirst({
      where: {
        id: customerId,
        organizationId,
      },
    });

    if (!customer) {
      throw new AppError(404, 'CUSTOMER_NOT_FOUND', 'Customer not found');
    }

    const skip = (page - 1) * pageSize;

    const [notes, total] = await Promise.all([
      prisma.note.findMany({
        where: {
          customerId,
          organizationId,
        },
        include: {
          createdBy: {
            select: { id: true, name: true, email: true },
          },
        },
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.note.count({
        where: {
          customerId,
          organizationId,
        },
      }),
    ]);

    return {
      data: notes,
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
   * Update note
   */
  async updateNote(
    noteId: string,
    organizationId: string,
    content: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot update note in different organization');
    }

    // Get note to verify it exists
    await this.getNote(noteId, organizationId);

    const updated = await prisma.note.update({
      where: { id: noteId },
      data: { content },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'note',
      noteId,
      'updated',
      performedBy.userId
    );

    return updated;
  }

  /**
   * Delete note
   */
  async deleteNote(
    noteId: string,
    organizationId: string,
    performedBy: TransactionContext
  ) {
    // Verify tenant isolation
    if (performedBy.organizationId !== organizationId) {
      throw new AppError(403, 'TENANT_MISMATCH', 'Cannot delete note in different organization');
    }

    // Get note to verify it exists
    await this.getNote(noteId, organizationId);

    await prisma.note.delete({
      where: { id: noteId },
    });

    // Log activity
    await this.logActivity(
      organizationId,
      'note',
      noteId,
      'deleted',
      performedBy.userId
    );

    return { success: true };
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

export const noteService = new NoteService();
