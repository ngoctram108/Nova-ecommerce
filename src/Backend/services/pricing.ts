// ─────────────────────────────────────────────
// NORA E-Commerce — Pricing Service
// Source of truth: IMPLEMENT.md §10
// All price calculation logic lives here.
// UI must NOT calculate prices directly.
// ─────────────────────────────────────────────

import { CartItem, DeliveryMethod, OrderItem } from '@/Shared/types';

/* ── Constants ── */

const FREE_SHIPPING_THRESHOLD = 1_000_000; // VND
const STANDARD_SHIPPING_FEE = 30_000;      // VND
const EXPRESS_SHIPPING_FEE = 55_000;       // VND

/* ── Subtotal ── */

/**
 * Calculate subtotal from cart items.
 * subtotal = Σ(unitPrice × quantity)
 */
export function calculateSubtotal(items: CartItem[] | OrderItem[]): number {
  return items.reduce((sum, item) => {
    const price = 'unitPrice' in item ? item.unitPrice : item.price;
    return sum + price * item.quantity;
  }, 0);
}

/* ── Shipping ── */

/**
 * Calculate shipping fee based on subtotal and delivery method.
 * - subtotal >= 1,000,000 → free shipping (standard)
 * - subtotal < 1,000,000 → 30,000 VND (standard)
 * - Express always adds 55,000 VND
 */
export function calculateShipping(
  subtotal: number,
  deliveryMethod: DeliveryMethod = 'STANDARD'
): number {
  if (deliveryMethod === 'EXPRESS') {
    return EXPRESS_SHIPPING_FEE;
  }

  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : STANDARD_SHIPPING_FEE;
}

/**
 * Get shipping info text
 */
export function getShippingInfo(subtotal: number): string {
  if (subtotal >= FREE_SHIPPING_THRESHOLD) {
    return 'Miễn phí vận chuyển';
  }
  const remaining = FREE_SHIPPING_THRESHOLD - subtotal;
  return `Mua thêm ${new Intl.NumberFormat('vi-VN').format(remaining)}₫ để được miễn phí vận chuyển`;
}

/* ── Discount ── */

/**
 * Calculate product-level discount (compareAt - price).
 * MVP: discount comes from product sale price, not coupon engine.
 */
export function calculateItemDiscount(
  price: number,
  compareAt: number | undefined,
  quantity: number
): number {
  if (!compareAt || compareAt <= price) return 0;
  return (compareAt - price) * quantity;
}

/**
 * Calculate total discount from cart items with product data.
 */
export function calculateTotalDiscount(
  items: { price: number; compareAt?: number; quantity: number }[]
): number {
  return items.reduce(
    (sum, item) => sum + calculateItemDiscount(item.price, item.compareAt, item.quantity),
    0
  );
}

/* ── Total ── */

/**
 * Calculate order total.
 * total = subtotal + shippingFee - discount
 */
export function calculateTotal(
  subtotal: number,
  shippingFee: number,
  discount: number = 0
): number {
  return Math.max(0, subtotal + shippingFee - discount);
}

/* ── Full calculation ── */

export interface PricingSummary {
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  freeShipping: boolean;
}

/**
 * Calculate complete pricing summary for an order.
 * This is the single source of truth for any order total.
 */
export function calculatePricingSummary(
  items: CartItem[] | OrderItem[],
  deliveryMethod: DeliveryMethod = 'STANDARD',
  discount: number = 0
): PricingSummary {
  const subtotal = calculateSubtotal(items);
  const shippingFee = calculateShipping(subtotal, deliveryMethod);
  const total = calculateTotal(subtotal, shippingFee, discount);
  const freeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;

  return {
    subtotal,
    shippingFee,
    discount,
    total,
    freeShipping,
  };
}

/* ── Exports for testing ── */

export const PRICING_CONSTANTS = {
  FREE_SHIPPING_THRESHOLD,
  STANDARD_SHIPPING_FEE,
  EXPRESS_SHIPPING_FEE,
} as const;
