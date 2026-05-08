import { TenantRequest, AppError } from '../types/index';

/**
 * Verify that requested organizationId matches tenant context
 * This is a critical security check to prevent data leakage
 */
export function verifyTenantAccess(
  req: TenantRequest,
  requestedOrgId: string
): void {
  if (!req.tenant) {
    throw new AppError(401, 'NO_TENANT', 'Tenant context not found');
  }

  if (req.tenant.organizationId !== requestedOrgId) {
    throw new AppError(
      403,
      'TENANT_MISMATCH',
      'You do not have access to this organization'
    );
  }
}

/**
 * Get tenant organization ID from request
 */
export function getTenantOrgId(req: TenantRequest): string {
  if (!req.tenant?.organizationId) {
    throw new AppError(
      401,
      'NO_TENANT',
      'Tenant context not found'
    );
  }

  return req.tenant.organizationId;
}

/**
 * Get current user ID from request
 */
export function getCurrentUserId(req: TenantRequest): string {
  if (!req.tenant?.userId) {
    throw new AppError(
      401,
      'NO_USER',
      'User context not found'
    );
  }

  return req.tenant.userId;
}
