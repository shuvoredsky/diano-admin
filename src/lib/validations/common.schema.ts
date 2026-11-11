import { z } from 'zod';

/**
 * Shared Zod Validation Schemas aligned with diano-server request contracts.
 * Note: Frontend validation improves UX; backend Zod schemas remain authoritative.
 */

export const bangladeshiPhoneSchema = z
  .string()
  .trim()
  .regex(/^(?:\+?88)?01[3-9]\d{8}$/, 'Invalid Bangladeshi phone number (e.g. 017XXXXXXXX)');

export const cuidSchema = z.string().trim().min(1, 'Identifier is required');

export const paginationFilterSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
  search: z.string().trim().optional(),
});

export const decimalMoneyStringSchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, 'Monetary value must be a valid non-negative decimal (e.g. "1500.00")');

