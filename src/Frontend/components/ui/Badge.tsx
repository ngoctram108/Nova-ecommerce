'use client';

import React from 'react';
import { cn } from '@/Shared/utils';
import { ProductBadge } from '@/Shared/types';

export interface BadgeProps {
  type: ProductBadge | 'SOLD_OUT' | 'LOW_STOCK';
  className?: string;
}

const badgeStyles: Record<string, { bg: string; text: string; label: string }> = {
  NEW: { bg: '#1d1d1f', text: '#ffffff', label: 'New' },
  SALE: { bg: '#ff3b30', text: '#ffffff', label: 'Sale' },
  FEATURED: { bg: '#0066cc', text: '#ffffff', label: 'Featured' },
  SOLD_OUT: { bg: '#7a7a7a', text: '#ffffff', label: 'Sold Out' },
  LOW_STOCK: { bg: '#ff9500', text: '#ffffff', label: 'Low Stock' },
};

export default function Badge({ type, className }: BadgeProps) {
  const style = badgeStyles[type];
  if (!style) return null;

  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 10px',
        fontSize: '11px',
        fontWeight: 600,
        letterSpacing: '0.5px',
        textTransform: 'uppercase',
        borderRadius: 'var(--rounded-xs)',
        backgroundColor: style.bg,
        color: style.text,
        lineHeight: 1,
      }}
    >
      {style.label}
    </span>
  );
}

/* ── Status Badge (for orders) ── */

export type OrderStatusBadge =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PROCESSING'
  | 'SHIPPING'
  | 'DELIVERED'
  | 'CANCELLED';

const statusStyles: Record<OrderStatusBadge, { bg: string; text: string; label: string }> = {
  PENDING: { bg: '#fff3cd', text: '#856404', label: 'Chờ xác nhận' },
  CONFIRMED: { bg: '#d4edda', text: '#155724', label: 'Đã xác nhận' },
  PROCESSING: { bg: '#cce5ff', text: '#004085', label: 'Đang xử lý' },
  SHIPPING: { bg: '#cce5ff', text: '#004085', label: 'Đang giao' },
  DELIVERED: { bg: '#d4edda', text: '#155724', label: 'Đã giao' },
  CANCELLED: { bg: '#f8d7da', text: '#721c24', label: 'Đã hủy' },
};

export function StatusBadge({
  status,
  className,
}: {
  status: OrderStatusBadge;
  className?: string;
}) {
  const style = statusStyles[status];
  if (!style) return null;

  return (
    <span
      className={cn(className)}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '4px 12px',
        fontSize: '12px',
        fontWeight: 600,
        borderRadius: 'var(--rounded-pill)',
        backgroundColor: style.bg,
        color: style.text,
        lineHeight: 1.4,
      }}
    >
      {style.label}
    </span>
  );
}
