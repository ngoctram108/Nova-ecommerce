'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Button } from '@/Frontend/components/ui';
import OrderStatusSelect from '@/Frontend/components/admin/OrderStatusSelect';
import { Search, Filter, ExternalLink } from 'lucide-react';

interface OrderRow {
  id: string;
  customer: string;
  customerEmail: string | null;
  total: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  itemCount: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Chờ xử lý',
  CONFIRMED: 'Đã xác nhận',
  PROCESSING: 'Đang xử lý',
  SHIPPING: 'Đang giao',
  DELIVERED: 'Đã giao',
  CANCELLED: 'Đã huỷ',
};

const STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  PENDING: { bg: 'rgba(255,160,0,0.1)', text: 'var(--color-warning)' },
  CONFIRMED: { bg: 'rgba(0,102,204,0.1)', text: 'var(--color-primary)' },
  PROCESSING: { bg: 'rgba(0,102,204,0.1)', text: 'var(--color-primary)' },
  SHIPPING: { bg: 'rgba(42,157,143,0.1)', text: 'var(--color-success)' },
  DELIVERED: { bg: 'rgba(42,157,143,0.1)', text: 'var(--color-success)' },
  CANCELLED: { bg: 'rgba(230,57,70,0.1)', text: 'var(--color-danger)' },
};

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(s));

export default function AdminOrders() {
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        q: search,
        status: statusFilter,
        sort,
      });
      const res = await fetch(`/api/admin/orders?${params}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.data);
        setStatusCounts(data.statusCounts || {});
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, sort]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(debouncedSearch);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [debouncedSearch]);

  const allStatuses = ['PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPING', 'DELIVERED', 'CANCELLED'];
  const totalAll = Object.values(statusCounts).reduce((s, c) => s + c, 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Quản lý đơn hàng</h2>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>{pagination.total} đơn hàng</div>
      </div>

      {/* Status filter tabs */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <button
          onClick={() => { setStatusFilter(''); setPage(1); }}
          style={{
            padding: '8px 16px', borderRadius: 'var(--rounded-pill)',
            border: '1px solid var(--color-hairline)',
            backgroundColor: !statusFilter ? 'var(--color-ink)' : '#fff',
            color: !statusFilter ? '#fff' : 'var(--color-ink)',
            fontWeight: 500, fontSize: 13, cursor: 'pointer',
          }}
        >
          Tất cả ({totalAll})
        </button>
        {allStatuses.map(s => {
          const count = statusCounts[s] || 0;
          const isActive = statusFilter === s;
          const sc = STATUS_COLORS[s];
          return (
            <button
              key={s}
              onClick={() => { setStatusFilter(isActive ? '' : s); setPage(1); }}
              style={{
                padding: '8px 16px', borderRadius: 'var(--rounded-pill)',
                border: `1px solid ${isActive ? sc.text : 'var(--color-hairline)'}`,
                backgroundColor: isActive ? sc.bg : '#fff',
                color: isActive ? sc.text : 'var(--color-ink-muted-80)',
                fontWeight: 500, fontSize: 13, cursor: 'pointer',
              }}
            >
              {STATUS_LABELS[s]} ({count})
            </button>
          );
        })}
      </div>

      {/* Search + Sort */}
      <div style={{ 
        display: 'flex', gap: 12, flexWrap: 'wrap',
        padding: 'var(--space-md) var(--space-lg)',
        backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', 
        border: '1px solid var(--color-hairline)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 250, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-sm)', padding: '0 12px' }}>
          <Search size={18} color="var(--color-ink-muted-80)" />
          <input
            type="text"
            placeholder="Tìm mã đơn hàng, tên khách hàng..."
            value={debouncedSearch}
            onChange={e => setDebouncedSearch(e.target.value)}
            style={{ border: 'none', padding: '10px', width: '100%', outline: 'none', backgroundColor: 'transparent' }}
          />
        </div>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          style={{ padding: '10px 16px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', backgroundColor: '#fff' }}
        >
          <option value="newest">Mới nhất</option>
          <option value="oldest">Cũ nhất</option>
          <option value="total_desc">Giá trị cao nhất</option>
          <option value="total_asc">Giá trị thấp nhất</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Mã đơn hàng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Khách hàng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Ngày đặt</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Thanh toán</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Tổng tiền</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Đang tải...</td>
                </tr>
              ) : orders.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Không có đơn hàng phù hợp.</td>
                </tr>
              ) : orders.map(order => {
                const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 600, fontSize: 14, fontFamily: 'monospace' }}>
                        {order.id.slice(-8).toUpperCase()}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)' }}>{order.itemCount} sản phẩm</div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontWeight: 500, fontSize: 14 }}>{order.customer}</div>
                      {order.customerEmail && (
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)' }}>{order.customerEmail}</div>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                      {formatDate(order.createdAt)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <div style={{ maxWidth: 180, margin: '0 auto' }}>
                        <OrderStatusSelect orderId={order.id} currentStatus={order.status} compact onStatusChange={fetchOrders} />
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <span style={{ 
                        padding: '3px 10px', borderRadius: 100, fontSize: 12, fontWeight: 600,
                        backgroundColor: order.paymentStatus === 'PAID' ? 'rgba(42,157,143,0.1)' : 'rgba(255,160,0,0.1)',
                        color: order.paymentStatus === 'PAID' ? 'var(--color-success)' : 'var(--color-warning)'
                      }}>
                        {order.paymentStatus === 'PAID' ? 'Đã TT' : order.paymentMethod}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                      {formatCurrency(order.total)}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <Link
                        href={`/admin/orders/${order.id}`}
                        style={{ 
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          padding: '6px 12px', borderRadius: 6,
                          border: '1px solid var(--color-hairline)',
                          color: 'var(--color-primary)', fontSize: 13, fontWeight: 500,
                          textDecoration: 'none', backgroundColor: '#fff',
                        }}
                      >
                        Chi tiết <ExternalLink size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Trước
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14, fontWeight: 500 }}>
              Trang {page} / {pagination.totalPages}
            </div>
            <Button variant="outline" size="sm" disabled={page === pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
