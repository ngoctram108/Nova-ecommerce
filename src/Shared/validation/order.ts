// ─────────────────────────────────────────────
// NORA E-Commerce — Order Validation
// ─────────────────────────────────────────────

import { z } from 'zod';

/* ── Query Orders ── */

export const queryOrdersSchema = z.object({
  status: z
    .enum(['PENDING', 'CONFIRMED', 'SHIPPING', 'DELIVERED', 'CANCELLED'])
    .optional(),
  search: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export type QueryOrdersInput = z.infer<typeof queryOrdersSchema>;

/* ── Update Order Status ── */

export const updateOrderStatusSchema = z.object({
  status: z.enum([
    'PENDING',
    'CONFIRMED',
    'SHIPPING',
    'DELIVERED',
    'CANCELLED',
  ]),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
