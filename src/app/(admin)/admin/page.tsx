'use client';

import React, { useState, useEffect } from 'react';

export default function AdminOverview() {
  const [data, setData] = useState<{stats: any} | null>(null);
  
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

  if (!data) {
    return <div>Đang tải...</div>;
  }

  const { stats } = data;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Tổng quan
      </h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Tổng doanh thu</div>
          <div style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600, color: 'var(--color-primary)' }}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(stats.totalRevenue)}
          </div>
        </div>
        <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Tổng đơn hàng</div>
          <div style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600 }}>{stats.totalOrders}</div>
        </div>
        <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Khách hàng</div>
          <div style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600 }}>{stats.totalCustomers}</div>
        </div>
      </div>
    </div>
  );
}
