import { Response } from 'express';
import { TenantRequest, AppError } from '../types/index';
import { noteService } from '@services/noteService';
import { CreateNoteSchema, PaginationSchema } from '@dtos/validators';
import { getTenantOrgId, getCurrentUserId } from '@utils/tenantIsolation';

/**
 * Note Controller
 */
export class NoteController {
  /**
   * POST /api/v1/notes
   * Create a note for a customer
   */
  async create(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);

      const dto = CreateNoteSchema.parse(req.body);

      const note = await noteService.createNote(dto, organizationId, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.status(201).json({
        success: true,
        data: note,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/notes/:id
   * Get note by ID
   */
  async getById(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { id } = req.params;

      const note = await noteService.getNote(id, organizationId);

      res.json({
        success: true,
        data: note,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/customers/:customerId/notes
   * Get all notes for a customer
   */
  async listByCustomer(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { customerId } = req.params;
      const { page, pageSize } = PaginationSchema.parse(req.query);

      const result = await noteService.getNotesByCustomer(
        customerId,
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
   * PUT /api/v1/notes/:id
   * Update note
   */
  async update(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;
      const { content } = req.body;

      if (!content || typeof content !== 'string') {
        throw new AppError(400, 'INVALID_INPUT', 'Content is required');
      }

      const note = await noteService.updateNote(id, organizationId, content, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: note,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/v1/notes/:id
   * Delete note
   */
  async delete(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const result = await noteService.deleteNote(id, organizationId, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: result,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const noteController = new NoteController();
