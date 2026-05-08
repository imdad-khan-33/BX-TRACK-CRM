import { Request } from 'express';

/**
 * Extended Express Request with tenant context
 */
export interface TenantRequest extends Request {
  tenant?: {
    organizationId: string;
    userId: string;
    userRole: 'admin' | 'member';
  };
}

/**
 * JWT Payload structure
 */
export interface JWTPayload {
  userId: string;
  organizationId: string;
  userRole: 'admin' | 'member';
  iat?: number;
  exp?: number;
}

/**
 * API Response wrapper
 */
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  timestamp: string;
}

/**
 * Pagination metadata
 */
export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Custom error class
 */
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'AppError';
  }
}

/**
 * Service layer transaction context
 */
export interface TransactionContext {
  organizationId: string;
  userId: string;
  userRole: 'admin' | 'member';
}
