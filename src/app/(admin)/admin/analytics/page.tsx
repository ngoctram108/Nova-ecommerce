import React, { Suspense } from 'react';
import { prisma } from '@/Backend/database/prisma';
import { verifySession } from '@/Backend/auth/session';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import RevenueChart from './RevenueChart';
import AnalyticsSkeleton from './AnalyticsSkeleton';

async function AnalyticsData({ range, days }: { range: string; days: number }) {
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);
  startDate.setHours(0, 0, 0, 0);

  const [
    totalOrdersCount,
    totalCustomersCount,
    ordersInRange,
    orderItemsInRange,
    inventoryData
  ] = await Promise.all([
    prisma.order.count(),
    prisma.user.count({ where: { role: 'CUSTOMER' } }),
    prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        status: { not: 'CANCELLED' }
      },
      select: { total: true, createdAt: true }
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          createdAt: { gte: startDate },
          status: { not: 'CANCELLED' }
        }
      },
      select: {
        quantity: true,
        total: true,
        productId: true,
        name: true,
        product: { select: { categorySlug: true } }
      }
    }),
    prisma.inventory.findMany({
      select: { stockQuantity: true, lowStockThreshold: true }
    })
  ]);

  const totalRevenue = ordersInRange.reduce((sum, order) => sum + order.total, 0);
  const totalProductsSold = orderItemsInRange.reduce((sum, item) => sum + item.quantity, 0);

  const productSales: Record<string, { name: string; quantity: number }> = {};
  orderItemsInRange.forEach(item => {
    if (!productSales[item.productId]) {
      productSales[item.productId] = { name: item.name, quantity: 0 };
    }
    productSales[item.productId].quantity += item.quantity;
  });
  const topProducts = Object.values(productSales)
    .sort((a, b) => b.quantity - a.quantity)
    .slice(0, 5);

  const revenueByCategory: Record<string, number> = {};
  orderItemsInRange.forEach(item => {
    const cat = item.product?.categorySlug || 'Khác';
    revenueByCategory[cat] = (revenueByCategory[cat] || 0) + item.total;
  });

  const lowStockCount = inventoryData.filter(inv => inv.stockQuantity <= inv.lowStockThreshold && inv.stockQuantity > 0).length;
  const outOfStockCount = inventoryData.filter(inv => inv.stockQuantity === 0).length;

  const hasData = totalOrdersCount > 0 || totalCustomersCount > 0;

  if (!hasData) {
    return (
      <div style={{ padding: 'var(--space-xxl)', textAlign: 'center', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <h3 style={{ fontSize: 'var(--text-lead-size)', marginBottom: 'var(--space-md)' }}>Chưa có dữ liệu</h3>
        <p style={{ color: 'var(--color-ink-muted-80)' }}>Hệ thống chưa có đủ dữ liệu đơn hàng và khách hàng để thống kê.</p>
      </div>
    );
  }

  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Tổng doanh thu ({days} ngày)</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalRevenue.toLocaleString()} ₫</div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Số đơn hàng ({days} ngày)</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{ordersInRange.length}</div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Sản phẩm đã bán ({days} ngày)</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalProductsSold}</div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Tổng khách hàng</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{totalCustomersCount}</div>
        </div>
      </div>

      <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <RevenueChart orders={ordersInRange.map(o => ({ total: o.total, dateStr: o.createdAt.toISOString() }))} days={days} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <h3 style={{ fontSize: 'var(--text-base-size)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Top sản phẩm bán chạy</h3>
          {topProducts.length === 0 ? (
            <div style={{ color: 'var(--color-ink-muted-80)' }}>Chưa có dữ liệu</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {topProducts.map((p, i) => (
                <li key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-surface-pearl)', paddingBottom: 8 }}>
                  <span style={{ flex: 1, paddingRight: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
                  <span style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{p.quantity} đã bán</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <h3 style={{ fontSize: 'var(--text-base-size)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Doanh thu theo danh mục</h3>
          {Object.keys(revenueByCategory).length === 0 ? (
            <div style={{ color: 'var(--color-ink-muted-80)' }}>Chưa có dữ liệu</div>
          ) : (
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Object.entries(revenueByCategory).sort((a,b)=>b[1]-a[1]).map(([cat, rev]) => (
                <li key={cat} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--color-surface-pearl)', paddingBottom: 8 }}>
                  <span style={{ textTransform: 'capitalize' }}>{cat.replace(/-/g, ' ')}</span>
                  <span style={{ fontWeight: 600 }}>{rev.toLocaleString()} ₫</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
          <h3 style={{ fontSize: 'var(--text-base-size)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>Tình trạng tồn kho</h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 16 }}>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-surface-pearl)' }}>
              <span>Sắp hết hàng</span>
              <span style={{ fontWeight: 600, color: 'var(--color-warning)' }}>{lowStockCount} SKU</span>
            </li>
            <li style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: 8, borderBottom: '1px solid var(--color-surface-pearl)' }}>
              <span>Hết hàng</span>
              <span style={{ fontWeight: 600, color: 'var(--color-danger)' }}>{outOfStockCount} SKU</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

export default async function AnalyticsPage(props: { searchParams: Promise<{ range?: string }> }) {
  const session = await verifySession();
  if (!session || session.role !== 'ADMIN') {
    redirect('/login?error=auth_required&redirect=/admin/analytics');
  }

  const searchParams = await props.searchParams;
  const range = searchParams.range || '7';
  const days = parseInt(range, 10);
  
  if (![7, 30, 90, 365].includes(days)) {
    redirect('/admin/analytics?range=7');
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Analytics</h2>
        <div style={{ display: 'flex', gap: 'var(--space-sm)' }}>
          {[7, 30, 90, 365].map(d => (
            <Link 
              key={d} 
              href={`/admin/analytics?range=${d}`}
              style={{
                padding: '8px 16px',
                borderRadius: 'var(--rounded-md)',
                backgroundColor: days === d ? 'var(--color-primary)' : '#fff',
                color: days === d ? '#fff' : 'var(--color-ink)',
                textDecoration: 'none',
                fontWeight: 500,
                fontSize: 'var(--text-small-size)',
                border: '1px solid var(--color-hairline)'
              }}
            >
              {d === 365 ? '1 năm' : `${d} ngày`}
            </Link>
          ))}
        </div>
      </div>

      <Suspense key={days} fallback={<AnalyticsSkeleton />}>
        <AnalyticsData range={range} days={days} />
      </Suspense>
    </div>
  );
}
