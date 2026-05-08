/**
 * API Response types
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

export interface PaginationMeta {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: PaginationMeta;
}

/**
 * Organization
 */
export interface Organization {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * User
 */
export interface User {
  id: string;
  organizationId: string;
  name: string;
  email: string;
  role: 'admin' | 'member';
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserRequest {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'member';
}

export interface UpdateUserRequest {
  name?: string;
  email?: string;
  role?: 'admin' | 'member';
}

/**
 * Customer
 */
export interface Customer {
  id: string;
  organizationId: string;
  name: string;
  email: string | null;
  phone: string | null;
  assignedToUserId: string | null;
  assignedTo?: User | null;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCustomerRequest {
  name: string;
  email?: string | null;
  phone?: string | null;
  assignedToUserId?: string | null;
}

export interface UpdateCustomerRequest {
  name?: string;
  email?: string | null;
  phone?: string | null;
  assignedToUserId?: string | null;
}

export interface AssignCustomerRequest {
  userId: string;
}

/**
 * Note
 */
export interface Note {
  id: string;
  customerId: string;
  organizationId: string;
  content: string;
  createdByUserId: string;
  createdBy?: User;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNoteRequest {
  content: string;
  customerId: string;
}

/**
 * Activity Log
 */
export interface ActivityLog {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  action: string;
  performedByUserId: string | null;
  performedBy?: User | null;
  metadata: any;
  timestamp: string;
}
