import { z } from 'zod';

/**
 * User DTOs
 */
export const CreateUserSchema = z.object({
  name: z.string().min(2).max(255),
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(['admin', 'member']),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(2).max(255).optional(),
  email: z.string().email().optional(),
  role: z.enum(['admin', 'member']).optional(),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema>;
export type UpdateUserDTO = z.infer<typeof UpdateUserSchema>;

/**
 * Customer DTOs
 */
export const CreateCustomerSchema = z.object({
  name: z.string().min(1).max(255),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  assignedToUserId: z.string().uuid().optional().nullable(),
});

export const UpdateCustomerSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  email: z.string().email().optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  assignedToUserId: z.string().uuid().optional().nullable(),
});

export const AssignCustomerSchema = z.object({
  userId: z.string().uuid(),
});

export type CreateCustomerDTO = z.infer<typeof CreateCustomerSchema>;
export type UpdateCustomerDTO = z.infer<typeof UpdateCustomerSchema>;
export type AssignCustomerDTO = z.infer<typeof AssignCustomerSchema>;

/**
 * Note DTOs
 */
export const CreateNoteSchema = z.object({
  content: z.string().min(1).max(5000),
  customerId: z.string().uuid(),
});

export type CreateNoteDTO = z.infer<typeof CreateNoteSchema>;

/**
 * Pagination DTOs
 */
export const PaginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  pageSize: z.coerce
    .number()
    .int()
    .positive()
    .max(100)
    .default(20),
  search: z.string().optional(),
});

export type PaginationDTO = z.infer<typeof PaginationSchema>;

/**
 * Auth DTOs
 */
export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export type LoginDTO = z.infer<typeof LoginSchema>;
