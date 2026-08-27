'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, ShoppingBag, Users, Package, 
  AlertTriangle, XCircle, Archive, ArrowRight 
} from 'lucide-react';

interface DashboardData {
  stats: {
    totalOrders: number;
    totalRevenue: number;
    totalCustomers: number;
    totalProducts: number;
    totalStock: number;
    lowStockCount: number;
    outOfStockCount: number;
  };
  recentOrders: Array<{
    id: string;
    customer: string;
    total: number;
    status: string;
    itemCount: number;
    createdAt: string;
  }>;
  topProducts: Array<{
    productId: string;
    name: string;
    totalSold: number;
  }>;
}

const STATUS_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  PENDING: { bg: 'rgba(255,160,0,0.1)', text: 'var(--color-warning)', label: 'Chờ xử lý' },
  CONFIRMED: { bg: 'rgba(0,102,204,0.1)', text: 'var(--color-primary)', label: 'Đã xác nhận' },
  PROCESSING: { bg: 'rgba(0,102,204,0.1)', text: 'var(--color-primary)', label: 'Đang xử lý' },
  SHIPPING: { bg: 'rgba(42,157,143,0.1)', text: 'var(--color-success)', label: 'Đang giao' },
  DELIVERED: { bg: 'rgba(42,157,143,0.1)', text: 'var(--color-success)', label: 'Đã giao' },
  CANCELLED: { bg: 'rgba(230,57,70,0.1)', text: 'var(--color-danger)', label: 'Đã huỷ' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(s));

export default function AdminDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) setData(resData);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
        {/* Skeleton cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
          {[1,2,3,4].map(i => (
            <div key={i} style={{ height: 120, borderRadius: 'var(--rounded-lg)', backgroundColor: '#fff', border: '1px solid var(--color-hairline)', animation: 'pulse 1.5s ease-in-out infinite' }} />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return <div style={{ color: 'var(--color-ink-muted-80)' }}>Không thể tải dữ liệu dashboard.</div>;
  }

  const { stats, recentOrders, topProducts } = data;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Main Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        <MetricCard
          icon={<TrendingUp size={22} />}
          label="Tổng doanh thu"
          value={formatCurrency(stats.totalRevenue)}
          accent="var(--color-primary)"
        />
        <MetricCard
          icon={<Package size={22} />}
          label="Tổng đơn hàng"
          value={stats.totalOrders.toString()}
          accent="var(--color-ink)"
        />
        <MetricCard
          icon={<Users size={22} />}
          label="Khách hàng"
          value={stats.totalCustomers.toString()}
          accent="#6c5ce7"
        />
        <MetricCard
          icon={<ShoppingBag size={22} />}
          label="Sản phẩm"
          value={stats.totalProducts.toString()}
          accent="#00b894"
        />
      </div>

      {/* Inventory alerts */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--rounded-sm)', backgroundColor: 'rgba(42,157,143,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Archive size={20} color="var(--color-success)" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>Tổng tồn kho</div>
            <div style={{ fontSize: 22, fontWeight: 700 }}>{stats.totalStock.toLocaleString()}</div>
          </div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--rounded-sm)', backgroundColor: 'rgba(255,160,0,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <AlertTriangle size={20} color="var(--color-warning)" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>Sắp hết hàng</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-warning)' }}>{stats.lowStockCount}</div>
          </div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 44, height: 44, borderRadius: 'var(--rounded-sm)', backgroundColor: 'rgba(230,57,70,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <XCircle size={20} color="var(--color-danger)" />
          </div>
          <div>
            <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>Hết hàng</div>
            <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-danger)' }}>{stats.outOfStockCount}</div>
          </div>
        </div>
      </div>

      {/* Two columns: Recent Orders + Top Products */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)' }}>
        {/* Recent Orders */}
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Đơn hàng gần đây</h3>
            <Link href="/admin/orders" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {recentOrders.length === 0 ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Chưa có đơn hàng</div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {recentOrders.map(order => {
                  const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
                  return (
                    <tr key={order.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                      <td style={{ padding: '12px 20px' }}>
                        <Link href={`/admin/orders/${order.id}`} style={{ fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', fontSize: 14 }}>
                          {order.id.slice(-8).toUpperCase()}
                        </Link>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 2 }}>{order.customer}</div>
                      </td>
                      <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                        <span style={{ padding: '3px 10px', borderRadius: 100, backgroundColor: sc.bg, color: sc.text, fontSize: 12, fontWeight: 600 }}>
                          {sc.label}
                        </span>
                      </td>
                      <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                        {formatCurrency(order.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Top Products */}
        <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontWeight: 600, fontSize: 16 }}>Sản phẩm bán chạy</h3>
            <Link href="/admin/products" style={{ display: 'flex', alignItems: 'center', gap: 4, color: 'var(--color-primary)', fontSize: 14, fontWeight: 500, textDecoration: 'none' }}>
              Xem tất cả <ArrowRight size={14} />
            </Link>
          </div>
          {topProducts.length === 0 ? (
            <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Chưa có dữ liệu bán hàng</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {topProducts.map((product, idx) => (
                <div key={product.productId} style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 12, borderBottom: idx < topProducts.length - 1 ? '1px solid var(--color-divider-soft)' : 'none' }}>
                  <div style={{ 
                    width: 28, height: 28, borderRadius: '50%', 
                    backgroundColor: idx < 3 ? 'var(--color-primary)' : 'var(--color-surface-pearl)', 
                    color: idx < 3 ? '#fff' : 'var(--color-ink-muted-80)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', 
                    fontSize: 13, fontWeight: 700, flexShrink: 0 
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 14 }}>
                    {product.name}
                  </div>
                  <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--color-ink-muted-80)', whiteSpace: 'nowrap' }}>
                    {product.totalSold} đã bán
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, accent }: { icon: React.ReactNode; label: string; value: string; accent: string }) {
  return (
    <div style={{ 
      padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', 
      border: '1px solid var(--color-hairline)', borderLeft: `4px solid ${accent}`,
      display: 'flex', alignItems: 'center', gap: 16, transition: 'box-shadow 0.2s',
    }}>
      <div style={{ 
        width: 48, height: 48, borderRadius: 'var(--rounded-sm)', 
        backgroundColor: `${accent}14`, 
        display: 'flex', alignItems: 'center', justifyContent: 'center', color: accent, flexShrink: 0 
      }}>
        {icon}
      </div>
      <div>
        <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)', marginBottom: 4 }}>{label}</div>
        <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: '-0.5px' }}>{value}</div>
      </div>
    </div>
  );
}
