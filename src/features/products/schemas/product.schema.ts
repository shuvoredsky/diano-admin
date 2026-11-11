import { z } from 'zod';

import {
  decimalMoneyStringSchema,
  paginationFilterSchema,
} from '@/lib/validations/common.schema';

export const productStatusSchema = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

export const productSlugSchema = z
  .string()
  .trim()
  .min(2)
  .max(200)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Slug must be lowercase alphanumeric with hyphens');

export const productFilterSchema = paginationFilterSchema.extend({
  status: productStatusSchema.optional(),
  categoryId: z.string().uuid().optional(),
  isFeatured: z.coerce.boolean().optional(),
});

export const createProductBaseSchema = z.object({
  name: z.string().trim().min(2, 'Product name is required').max(200),
  slug: productSlugSchema,
  sku: z.string().trim().min(2, 'SKU is required').max(64),
  basePrice: decimalMoneyStringSchema,
  salePrice: decimalMoneyStringSchema.optional().nullable(),
  status: productStatusSchema.default('DRAFT'),
  isFeatured: z.boolean().default(false),
});

export type ProductFilterValues = z.infer<typeof productFilterSchema>;
export type CreateProductBaseValues = z.infer<typeof createProductBaseSchema>;
