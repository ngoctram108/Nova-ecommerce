// ─────────────────────────────────────────────
// NORA E-Commerce — Product Validation
// ─────────────────────────────────────────────

import { z } from 'zod';

/* ── Product Color ── */

const productColorSchema = z.object({
  name: z.string().min(1),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Invalid hex color'),
  swatch: z.string().optional(),
});

/* ── Product Variant ── */

const productVariantSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  sku: z.string().min(1),
  price: z.number().positive().optional(),
  stock: z.number().int().min(0),
  attributes: z.record(z.string(), z.string()),
});

/* ── Create Product ── */

export const createProductSchema = z.object({
  name: z.string().min(2, 'Tên sản phẩm quá ngắn').max(200),
  brand: z.string().min(1, 'Vui lòng chọn thương hiệu'),
  category: z.string().min(1, 'Vui lòng chọn danh mục'),
  categorySlug: z.string().min(1),
  description: z.string().min(10, 'Mô tả quá ngắn'),
  price: z.number().positive('Giá phải lớn hơn 0'),
  compareAt: z.number().positive().optional(),
  stock: z.number().int().min(0, 'Tồn kho không được âm'),
  images: z.array(z.string()).min(1, 'Cần ít nhất một hình ảnh'),
  thumbnail: z.string().min(1),
  badge: z.enum(['NEW', 'SALE', 'FEATURED']).optional(),
  colors: z.array(productColorSchema).optional(),
  sizes: z.array(z.string()).optional(),
  variants: z.array(productVariantSchema).optional(),
  specs: z.record(z.string(), z.string()).default({}),
  featured: z.boolean().default(false),
});

export type CreateProductInput = z.infer<typeof createProductSchema>;

/* ── Update Product ── */

export const updateProductSchema = createProductSchema.partial();

export type UpdateProductInput = z.infer<typeof updateProductSchema>;
