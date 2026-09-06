'use client';

import React, { useMemo, useState } from 'react';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

interface OrderData {
  total: number;
  dateStr: string;
}

interface RevenueChartProps {
  orders: OrderData[];
  days: number;
}

export default function RevenueChart({ orders, days }: RevenueChartProps) {
  const [metric, setMetric] = useState<'revenue' | 'orders'>('revenue');

  const chartData = useMemo(() => {
    const dataMap = new Map<string, { label: string, revenue: number, orders: number, sortKey: string }>();
    const now = new Date();
    
    // Normalize `now` to end of day to include all today's orders
    now.setHours(23, 59, 59, 999);
    
    // Create zero-filled timeline
    if (days <= 30) {
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        const key = d.toISOString().split('T')[0];
        const label = `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        dataMap.set(key, { label, revenue: 0, orders: 0, sortKey: key });
      }
    } else if (days === 90) {
      // Group by week (last 13 weeks)
      for (let i = 12; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 7);
        // Get start of week (Monday)
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - day + 1);
        const key = d.toISOString().split('T')[0];
        const label = `Tuần ${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
        dataMap.set(key, { label, revenue: 0, orders: 0, sortKey: key });
      }
    } else if (days === 365) {
      // Group by month (last 12 months)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = `Tháng ${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        dataMap.set(key, { label, revenue: 0, orders: 0, sortKey: key });
      }
    }

    // Assign data
    orders.forEach(order => {
      const d = new Date(order.dateStr);
      let key = '';
      if (days <= 30) {
        key = d.toISOString().split('T')[0];
      } else if (days === 90) {
        const day = d.getDay() || 7;
        d.setDate(d.getDate() - day + 1);
        key = d.toISOString().split('T')[0];
      } else if (days === 365) {
        key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      }
      
      const entry = dataMap.get(key);
      if (entry) {
        entry.revenue += order.total;
        entry.orders += 1;
      }
    });

    return Array.from(dataMap.values()).sort((a, b) => a.sortKey.localeCompare(b.sortKey));
  }, [orders, days]);

  const formatCurrency = (val: number) => {
    if (val === 0) return '0 đ';
    if (val >= 1000000000) return `${(val / 1000000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
    if (val >= 1000000) return `${(val / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr`;
    if (val >= 1000) return `${(val / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 0 })} k`;
    return val.toString();
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid var(--color-hairline)', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
          <p style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--color-ink)' }}>{payload[0].payload.label}</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
              <span style={{ color: 'var(--color-ink-muted-80)', fontSize: 13 }}>Doanh thu:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-primary)', fontSize: 13 }}>{payload[0].payload.revenue.toLocaleString('vi-VN')} đ</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '24px' }}>
              <span style={{ color: 'var(--color-ink-muted-80)', fontSize: 13 }}>Đơn hàng:</span>
              <span style={{ fontWeight: 600, color: 'var(--color-ink)', fontSize: 13 }}>{payload[0].payload.orders}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)', flexWrap: 'wrap', gap: 12 }}>
        <h3 style={{ fontSize: 'var(--text-base-size)', fontWeight: 600, margin: 0 }}>Biểu đồ doanh thu ({days} ngày)</h3>
        
        <div style={{ display: 'flex', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 'var(--rounded-md)', padding: 4 }}>
          <button 
            onClick={() => setMetric('revenue')}
            style={{ 
              padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              backgroundColor: metric === 'revenue' ? '#fff' : 'transparent',
              color: metric === 'revenue' ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
              boxShadow: metric === 'revenue' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Doanh thu
          </button>
          <button 
            onClick={() => setMetric('orders')}
            style={{ 
              padding: '6px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              backgroundColor: metric === 'orders' ? '#fff' : 'transparent',
              color: metric === 'orders' ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
              boxShadow: metric === 'orders' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              transition: 'all 0.2s'
            }}
          >
            Số đơn
          </button>
        </div>
      </div>

      <div style={{ height: 320, width: '100%', marginTop: 'var(--space-xl)' }}>
        {chartData.length === 0 ? (
           <div style={{ color: 'var(--color-ink-muted-80)', textAlign: 'center', padding: 'var(--space-xl) 0', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Chưa có phát sinh giao dịch</div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-hairline)" />
              <XAxis 
                dataKey="label" 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--color-ink-muted-80)' }} 
                dy={10}
                minTickGap={30}
              />
              <YAxis 
                axisLine={false} 
                tickLine={false} 
                tick={{ fontSize: 12, fill: 'var(--color-ink-muted-80)' }} 
                tickFormatter={metric === 'revenue' ? formatCurrency : (v) => v}
                dx={-10}
                width={70}
                allowDecimals={false}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey={metric} 
                stroke="var(--color-primary)" 
                strokeWidth={2}
                fillOpacity={1} 
                fill="url(#colorRevenue)" 
                activeDot={{ r: 6, strokeWidth: 0, fill: 'var(--color-primary)' }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
