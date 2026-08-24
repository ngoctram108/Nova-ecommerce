'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { StatusBadge } from '@/Frontend/components/ui';
import OrderStatusSelect from '@/Frontend/components/admin/OrderStatusSelect';

export default function AdminOrders() {
  const [data, setData] = useState<{orders: any[]} | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) {
          setData(resData);
        }
      })
      .catch(console.error);
  }, []);

  if (!data) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Quản lý đơn hàng
      </h2>
      
      <div className="tile-light" style={{ borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
            <tr>
              <th style={{ padding: 16, fontWeight: 600 }}>Mã ĐH</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Khách hàng</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Ngày đặt</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Trạng thái</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Tổng tiền</th>
              <th style={{ padding: 16, fontWeight: 600 }}></th>
            </tr>
          </thead>
          <tbody>
            {data.orders.map(order => (
              <tr key={order.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                <td style={{ padding: 16 }}>{order.id}</td>
                <td style={{ padding: 16 }}>{order.user?.email || 'Guest'}</td>
                <td style={{ padding: 16 }}>{new Intl.DateTimeFormat('vi-VN').format(new Date(order.createdAt))}</td>
                <td style={{ padding: 16 }}>
                  <OrderStatusSelect orderId={order.id} currentStatus={order.status} compact />
                </td>
                <td style={{ padding: 16, fontWeight: 600 }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                </td>
                <td style={{ padding: 16, textAlign: 'right' }}>
                  <Link href={`/admin/orders/${order.id}`} style={{ color: 'var(--color-primary)', fontWeight: 600 }}>
                    Chi tiết
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
