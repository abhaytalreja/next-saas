import { z } from 'zod';

/**
 * UUID validation
 */
export const uuidSchema = z.string().uuid();

/**
 * Pagination validation
 */
export const paginationSchema = z.object({
  page: z.number().int().positive().default(1),
  pageSize: z.number().int().positive().max(100).default(20),
});

/**
 * Order by validation
 */
export const orderBySchema = z.object({
  column: z.string(),
  ascending: z.boolean().default(true),
  nullsFirst: z.boolean().optional(),
});

/**
 * Filter validation
 */
export const filterSchema = z.object({
  column: z.string(),
  operator: z.enum([
    'eq', 'neq', 'gt', 'gte', 'lt', 'lte',
    'like', 'ilike', 'is', 'in', 'cs', 'cd',
    'sl', 'sr', 'nxl', 'nxr', 'adj'
  ]),
  value: z.any(),
});

/**
 * Query options validation
 */
export const queryOptionsSchema = z.object({
  select: z.string().optional(),
  limit: z.number().int().positive().max(1000).optional(),
  offset: z.number().int().nonnegative().optional(),
  orderBy: z.array(orderBySchema).optional(),
  filters: z.array(filterSchema).optional(),
});

/**
 * Soft delete validation
 */
export const softDeleteSchema = z.object({
  deleted_at: z.string().datetime().nullable(),
});

/**
 * Timestamp validation
 */
export const timestampSchema = z.object({
  created_at: z.string().datetime(),
  updated_at: z.string().datetime(),
});

/**
 * Metadata validation
 */
export const metadataSchema = z.record(z.any()).default({});