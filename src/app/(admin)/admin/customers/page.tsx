'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/Frontend/components/ui';
import { Search, User, ShoppingBag, ChevronRight, X, Mail, Phone, Calendar, MapPin } from 'lucide-react';

interface CustomerRow {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  orderCount: number;
  totalSpent: number;
  createdAt: string;
}

interface CustomerDetail {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatar: string | null;
  createdAt: string;
  totalSpent: number;
  orderCount: number;
  addresses: Array<{
    id: string;
    fullName: string;
    phone: string;
    address: string;
    city: string;
    district: string | null;
    isDefault: boolean;
  }>;
  orders: Array<{
    id: string;
    total: number;
    status: string;
    paymentMethod: string;
    createdAt: string;
    _count: { items: number };
  }>;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

const formatDate = (s: string) =>
  new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' }).format(new Date(s));

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

export default function AdminCustomers() {
  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);

  // Customer detail drawer
  const [selectedCustomer, setSelectedCustomer] = useState<CustomerDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        q: search,
        sort,
      });
      const res = await fetch(`/api/admin/customers?${params}`);
      const data = await res.json();
      if (data.success) {
        setCustomers(data.data);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, sort]);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(debouncedSearch);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [debouncedSearch]);

  const openDetail = async (customerId: string) => {
    setLoadingDetail(true);
    try {
      const res = await fetch(`/api/admin/customers/${customerId}`);
      const data = await res.json();
      if (data.success) {
        setSelectedCustomer(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Quản lý khách hàng</h2>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>{pagination.total} khách hàng</div>
      </div>

      {/* Filters */}
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
            placeholder="Tìm tên, email, số điện thoại..."
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
          <option value="name_asc">Tên A-Z</option>
          <option value="name_desc">Tên Z-A</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 700 }}>
            <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Khách hàng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Email</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Điện thoại</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Đơn hàng</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Tổng chi tiêu</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Ngày đăng ký</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}></th>
              </tr>
            </thead>
            <tbody>
              {loading && customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Đang tải...</td>
                </tr>
              ) : customers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Không tìm thấy khách hàng.</td>
                </tr>
              ) : customers.map(customer => (
                <tr key={customer.id} style={{ borderBottom: '1px solid var(--color-divider-soft)', cursor: 'pointer' }} onClick={() => openDetail(customer.id)}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: '50%', 
                        backgroundColor: 'var(--color-surface-pearl)', 
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--color-ink-muted-80)', fontSize: 14, fontWeight: 600,
                        flexShrink: 0, overflow: 'hidden',
                      }}>
                        {customer.avatar ? (
                          <img src={customer.avatar} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                          customer.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <span style={{ fontWeight: 500, fontSize: 14 }}>{customer.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted-80)' }}>{customer.email}</td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted-80)' }}>{customer.phone || '—'}</td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      padding: '3px 10px', borderRadius: 100, fontSize: 13, fontWeight: 600,
                      backgroundColor: customer.orderCount > 0 ? 'rgba(0,102,204,0.08)' : 'var(--color-surface-pearl)',
                      color: customer.orderCount > 0 ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
                    }}>
                      {customer.orderCount}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right', fontWeight: 600, fontSize: 14 }}>
                    {formatCurrency(customer.totalSpent)}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                    {formatDate(customer.createdAt)}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <ChevronRight size={16} color="var(--color-ink-muted-80)" />
                  </td>
                </tr>
              ))}
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

      {/* Customer Detail Drawer */}
      {(selectedCustomer || loadingDetail) && (
        <div
          style={{ position: 'fixed', inset: 0, zIndex: 1000, display: 'flex', justifyContent: 'flex-end', backgroundColor: 'rgba(0,0,0,0.3)' }}
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            style={{ 
              width: 480, maxWidth: '100vw', height: '100vh', backgroundColor: '#fff', 
              overflowY: 'auto', boxShadow: '-10px 0 40px rgba(0,0,0,0.1)',
              animation: 'slideInRight 0.25s ease-out',
            }}
            onClick={e => e.stopPropagation()}
          >
            {loadingDetail ? (
              <div style={{ padding: 'var(--space-xxl)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Đang tải...</div>
            ) : selectedCustomer && (
              <div style={{ padding: 'var(--space-xl)' }}>
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-xl)' }}>
                  <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                    <div style={{ 
                      width: 56, height: 56, borderRadius: '50%', 
                      backgroundColor: 'var(--color-surface-pearl)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 22, fontWeight: 700, color: 'var(--color-primary)',
                    }}>
                      {selectedCustomer.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 4 }}>{selectedCustomer.name}</h3>
                      <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>Khách hàng từ {formatDate(selectedCustomer.createdAt)}</div>
                    </div>
                  </div>
                  <button onClick={() => setSelectedCustomer(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                    <X size={20} color="var(--color-ink-muted-80)" />
                  </button>
                </div>

                {/* Contact info */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 'var(--space-xl)', padding: 'var(--space-lg)', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 'var(--rounded-sm)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                    <Mail size={15} color="var(--color-ink-muted-80)" />
                    {selectedCustomer.email}
                  </div>
                  {selectedCustomer.phone && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14 }}>
                      <Phone size={15} color="var(--color-ink-muted-80)" />
                      {selectedCustomer.phone}
                    </div>
                  )}
                </div>

                {/* Summary cards */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 'var(--space-xl)' }}>
                  <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--color-primary)' }}>{selectedCustomer.orderCount}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 4 }}>Đơn hàng</div>
                  </div>
                  <div style={{ padding: 'var(--space-md)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-sm)', textAlign: 'center' }}>
                    <div style={{ fontSize: 18, fontWeight: 700 }}>{formatCurrency(selectedCustomer.totalSpent)}</div>
                    <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 4 }}>Tổng chi tiêu</div>
                  </div>
                </div>

                {/* Addresses */}
                {selectedCustomer.addresses.length > 0 && (
                  <div style={{ marginBottom: 'var(--space-xl)' }}>
                    <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Địa chỉ giao hàng</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedCustomer.addresses.map(addr => (
                        <div key={addr.id} style={{ 
                          padding: 12, borderRadius: 'var(--rounded-xs)', 
                          border: '1px solid var(--color-hairline)', fontSize: 13,
                          backgroundColor: addr.isDefault ? 'rgba(0,102,204,0.03)' : '#fff',
                        }}>
                          <div style={{ fontWeight: 500 }}>{addr.fullName} — {addr.phone}</div>
                          <div style={{ color: 'var(--color-ink-muted-80)', marginTop: 4 }}>
                            {addr.address}{addr.district ? `, ${addr.district}` : ''}, {addr.city}
                          </div>
                          {addr.isDefault && (
                            <span style={{ fontSize: 11, color: 'var(--color-primary)', fontWeight: 600, marginTop: 4, display: 'inline-block' }}>Mặc định</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Order history */}
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: 14, marginBottom: 12 }}>Lịch sử đơn hàng</h4>
                  {selectedCustomer.orders.length === 0 ? (
                    <div style={{ padding: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-ink-muted-80)', border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-sm)' }}>
                      Chưa có đơn hàng
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {selectedCustomer.orders.map(order => {
                        const sc = STATUS_COLORS[order.status] || STATUS_COLORS.PENDING;
                        return (
                          <div key={order.id} style={{ 
                            padding: 12, borderRadius: 'var(--rounded-xs)',
                            border: '1px solid var(--color-hairline)',
                            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                          }}>
                            <div>
                              <div style={{ fontWeight: 600, fontSize: 13, fontFamily: 'monospace' }}>
                                {order.id.slice(-8).toUpperCase()}
                              </div>
                              <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 2 }}>
                                {formatDate(order.createdAt)} · {order._count.items} SP
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 4 }}>
                                {formatCurrency(order.total)}
                              </div>
                              <span style={{ padding: '2px 8px', borderRadius: 100, fontSize: 11, fontWeight: 600, backgroundColor: sc.bg, color: sc.text }}>
                                {STATUS_LABELS[order.status] || order.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Slide-in animation */}
      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
