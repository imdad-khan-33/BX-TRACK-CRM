import { Response } from 'express';
import { TenantRequest } from '../types/index';
import { customerService } from '@services/customerService';
import {
  CreateCustomerSchema,
  UpdateCustomerSchema,
  AssignCustomerSchema,
  PaginationSchema,
} from '@dtos/validators';
import { getTenantOrgId, getCurrentUserId } from '@utils/tenantIsolation';

/**
 * Customer Controller
 */
export class CustomerController {
  /**
   * POST /api/v1/customers
   * Create a new customer
   */
  async create(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);

      const dto = CreateCustomerSchema.parse(req.body);

      const customer = await customerService.createCustomer(
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
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/customers/:id
   * Get customer by ID
   */
  async getById(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { id } = req.params;

      const customer = await customerService.getCustomer(id, organizationId);

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/customers
   * Get all customers with pagination and search
   */
  async list(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const pagination = PaginationSchema.parse(req.query);

      const result = await customerService.getCustomers(organizationId, pagination);

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
   * PUT /api/v1/customers/:id
   * Update customer
   */
  async update(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const dto = UpdateCustomerSchema.parse(req.body);

      const customer = await customerService.updateCustomer(id, organizationId, dto, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * DELETE /api/v1/customers/:id
   * Soft delete customer
   */
  async delete(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const customer = await customerService.deleteCustomer(id, organizationId, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/v1/customers/:id/restore
   * Restore soft-deleted customer
   */
  async restore(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const customer = await customerService.restoreCustomer(id, organizationId, {
        organizationId,
        userId,
        userRole: req.tenant!.userRole,
      });

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/v1/customers/:id/assign
   * Assign customer to user (with concurrency safety)
   */
  async assign(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const { userId: assignToUserId } = AssignCustomerSchema.parse(req.body);

      const customer = await customerService.assignCustomerToUser(
        id,
        assignToUserId,
        organizationId,
        {
          organizationId,
          userId,
          userRole: req.tenant!.userRole,
        }
      );

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * POST /api/v1/customers/:id/unassign
   * Unassign customer from user
   */
  async unassign(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const userId = getCurrentUserId(req);
      const { id } = req.params;

      const customer = await customerService.updateCustomer(
        id,
        organizationId,
        { assignedToUserId: null },
        {
          organizationId,
          userId,
          userRole: req.tenant!.userRole,
        }
      );

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * GET /api/v1/customers/:id/with-notes
   * Get customer with all associated notes
   */
  async getWithNotes(req: TenantRequest, res: Response): Promise<void> {
    try {
      const organizationId = getTenantOrgId(req);
      const { id } = req.params;

      const customer = await customerService.getCustomerWithNotes(id, organizationId);

      res.json({
        success: true,
        data: customer,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      throw error;
    }
  }
}

export const customerController = new CustomerController();
