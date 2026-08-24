'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { StatusBadge } from '@/components/ui';

interface OrderStatusSelectProps {
  orderId: string;
  currentStatus: string;
  compact?: boolean;
}

const STATUS_OPTIONS = [
  { value: 'PENDING', label: 'Chờ xác nhận' },
  { value: 'CONFIRMED', label: 'Đã xác nhận' },
  { value: 'PROCESSING', label: 'Đang xử lý' },
  { value: 'SHIPPING', label: 'Đang giao' },
  { value: 'DELIVERED', label: 'Đã giao' },
  { value: 'CANCELLED', label: 'Đã hủy' }
];

export default function OrderStatusSelect({ orderId, currentStatus, compact = false }: OrderStatusSelectProps) {
  const router = useRouter();
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState('');

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newStatus = e.target.value;
    if (newStatus === currentStatus) return;

    // Show prompt for note if cancelling
    let note = '';
    if (newStatus === 'CANCELLED') {
      const reason = prompt('Nhập lý do hủy đơn hàng:');
      if (reason === null) {
        e.target.value = currentStatus; // Revert selection
        return;
      }
      note = reason;
    }

    setIsUpdating(true);
    setError('');

    try {
      const res = await fetch(`/api/admin/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus, note }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Cập nhật thất bại');
      }

      router.refresh(); // Refresh page data
    } catch (err: any) {
      setError(err.message);
      e.target.value = currentStatus; // Revert selection
      alert(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div style={{ display: 'inline-block', position: 'relative' }}>
      <select
        value={currentStatus}
        onChange={handleChange}
        disabled={isUpdating}
        style={{
          padding: compact ? '4px 8px' : '8px 12px',
          borderRadius: 'var(--rounded-sm)',
          border: '1px solid var(--color-hairline)',
          backgroundColor: 'var(--color-surface)',
          fontSize: compact ? 'var(--text-caption-size)' : 'var(--text-body-size)',
          cursor: isUpdating ? 'wait' : 'pointer',
          outline: 'none',
        }}
      >
        {STATUS_OPTIONS.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
