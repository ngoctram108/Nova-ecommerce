// ─────────────────────────────────────────────
// NORA E-Commerce — Checkout Validation
// Source of truth: IMPLEMENT.md §6, §11.8
// Uses Zod for schema validation
// ─────────────────────────────────────────────

import { z } from 'zod';

/* ── Shipping Address ── */

export const shippingAddressSchema = z.object({
  fullName: z
    .string()
    .min(2, 'Vui lòng nhập họ tên')
    .max(100, 'Họ tên quá dài'),
  email: z
    .string()
    .email('Email không hợp lệ'),
  phone: z
    .string()
    .regex(/^0\d{9}$/, 'Số điện thoại không hợp lệ (VD: 0912345678)'),
  address: z
    .string()
    .min(5, 'Vui lòng nhập địa chỉ chi tiết')
    .max(200, 'Địa chỉ quá dài'),
  city: z
    .string()
    .min(2, 'Vui lòng chọn thành phố'),
  district: z
    .string()
    .optional(),
  ward: z
    .string()
    .optional(),
  note: z
    .string()
    .max(500, 'Ghi chú quá dài')
    .optional(),
});

export type ShippingAddressInput = z.infer<typeof shippingAddressSchema>;

/* ── Delivery Method ── */

export const deliveryMethodSchema = z.enum(['STANDARD', 'EXPRESS']);

/* ── Payment Method ── */

export const paymentMethodSchema = z.enum(['COD', 'MOCK_CARD']);

/* ── Cart Item ── */

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  variantId: z.string().optional(),
  quantity: z
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1')
    .max(99, 'Số lượng tối đa là 99'),
  price: z.number().positive('Giá phải lớn hơn 0'),
  name: z.string(),
  thumbnail: z.string(),
  variant: z.string().optional(),
  maxStock: z.number(),
});

/* ── Create Order ── */

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        variantId: z.string().optional(),
        quantity: z.number().int().min(1),
        price: z.number().positive(),
        name: z.string(),
        thumbnail: z.string(),
        variant: z.string().optional(),
        maxStock: z.number(),
      })
    )
    .min(1, 'Cart is empty'),
  customer: shippingAddressSchema,
  paymentMethod: paymentMethodSchema,
  deliveryMethod: deliveryMethodSchema,
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;

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

/* ── Mock Card Payment ── */

export const mockCardSchema = z.object({
  cardNumber: z
    .string()
    .regex(/^\d{16}$/, 'Số thẻ phải gồm 16 chữ số'),
  expiry: z
    .string()
    .regex(/^(0[1-9]|1[0-2])\/\d{2}$/, 'Ngày hết hạn không hợp lệ (MM/YY)'),
  cvv: z
    .string()
    .regex(/^\d{3,4}$/, 'CVV không hợp lệ'),
  name: z
    .string()
    .min(2, 'Vui lòng nhập tên chủ thẻ'),
});

export type MockCardInput = z.infer<typeof mockCardSchema>;
