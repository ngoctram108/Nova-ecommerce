'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Input } from '@/Frontend/components/ui';
import { Package, Search, Filter, AlertCircle, RefreshCw } from 'lucide-react';
import InventoryAdjustmentModal from '@/Frontend/components/admin/InventoryAdjustmentModal';
import InventoryLogDrawer from '@/Frontend/components/admin/InventoryLogDrawer';

export default function AdminInventory() {
  const [data, setData] = useState<{data: any[], stats: any, pagination: any} | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [sort, setSort] = useState('updated_desc');
  const [page, setPage] = useState(1);
  const limit = 20;

  // Modals
  const [adjustmentInventory, setAdjustmentInventory] = useState<any>(null);
  const [logInventory, setLogInventory] = useState<any>(null);

  const fetchInventory = async () => {
    setLoading(true);
    try {
      const query = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        q,
        status,
        sort,
      });
      const res = await fetch(`/api/admin/inventory?${query.toString()}`);
      const resData = await res.json();
      if (res.ok && resData.success) {
        setData(resData);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, [page, status, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchInventory();
    }, 500);
    return () => clearTimeout(timer);
  }, [q]);

  const stats = data?.stats;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Modals */}
      <InventoryAdjustmentModal
        isOpen={!!adjustmentInventory}
        inventory={adjustmentInventory}
        onClose={() => setAdjustmentInventory(null)}
        onSuccess={fetchInventory}
      />
      
      <InventoryLogDrawer
        isOpen={!!logInventory}
        inventory={logInventory}
        onClose={() => setLogInventory(null)}
      />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Quản lý Tồn Kho</h2>
        <Button variant="outline" onClick={fetchInventory} disabled={loading}>
          <RefreshCw size={16} style={{ marginRight: 8, animation: loading ? 'spin 1s linear infinite' : 'none' }} />
          Làm mới
        </Button>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', borderLeft: '4px solid var(--color-ink)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Tổng số SKU</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats?.totalSKU || 0}</div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', borderLeft: '4px solid var(--color-success)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Đang còn hàng</div>
          <div style={{ fontSize: '24px', fontWeight: 700 }}>{stats?.inStock || 0} <span style={{fontSize: 14, fontWeight: 400, color: 'var(--color-ink-muted-80)'}}>SKU</span></div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', borderLeft: '4px solid var(--color-warning)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Sắp hết hàng</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-warning)' }}>{stats?.lowStock || 0} <span style={{fontSize: 14, fontWeight: 400, color: 'var(--color-ink-muted-80)'}}>SKU</span></div>
        </div>
        <div style={{ padding: 'var(--space-lg)', backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', borderLeft: '4px solid var(--color-danger)' }}>
          <div style={{ fontSize: 'var(--text-small-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>Hết hàng</div>
          <div style={{ fontSize: '24px', fontWeight: 700, color: 'var(--color-danger)' }}>{stats?.outOfStock || 0} <span style={{fontSize: 14, fontWeight: 400, color: 'var(--color-ink-muted-80)'}}>SKU</span></div>
        </div>
      </div>

      {/* Main Table Area */}
      <div className="tile-light" style={{ borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden', backgroundColor: '#fff' }}>
        
        {/* Filters bar */}
        <div style={{ padding: 'var(--space-md) var(--space-lg)', borderBottom: '1px solid var(--color-divider-soft)', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: 250, border: '1px solid var(--color-hairline)', borderRadius: 'var(--rounded-sm)', padding: '0 12px' }}>
            <Search size={18} color="var(--color-ink-muted-80)" />
            <input 
              type="text" 
              placeholder="Tìm kiếm sản phẩm, SKU..." 
              value={q}
              onChange={e => setQ(e.target.value)}
              style={{ border: 'none', padding: '10px', width: '100%', outline: 'none', backgroundColor: 'transparent' }}
            />
          </div>
          <select 
            value={status} 
            onChange={e => { setStatus(e.target.value); setPage(1); }}
            style={{ padding: '10px 16px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', backgroundColor: '#fff' }}
          >
            <option value="">Tất cả trạng thái</option>
            <option value="IN_STOCK">Còn hàng</option>
            <option value="LOW_STOCK">Sắp hết hàng</option>
            <option value="OUT_OF_STOCK">Hết hàng</option>
          </select>
          <select 
            value={sort} 
            onChange={e => { setSort(e.target.value); setPage(1); }}
            style={{ padding: '10px 16px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', backgroundColor: '#fff' }}
          >
            <option value="updated_desc">Mới cập nhật</option>
            <option value="stock_asc">Tồn kho tăng dần</option>
            <option value="stock_desc">Tồn kho giảm dần</option>
            <option value="sold_desc">Bán chạy nhất</option>
          </select>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 800 }}>
            <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Sản phẩm</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14 }}>Phân loại (SKU)</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>Tồn kho</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>Đã bán</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, textAlign: 'center' }}>Trạng thái</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 14, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && !data ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Đang tải...</td>
                </tr>
              ) : data?.data.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Không tìm thấy dữ liệu phù hợp.</td>
                </tr>
              ) : data?.data.map(inv => {
                const stock = inv.stockQuantity;
                const isOutOfStock = stock === 0;
                const isLowStock = stock > 0 && stock <= inv.lowStockThreshold;

                return (
                  <tr key={inv.id} style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                    <td style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, position: 'relative', borderRadius: 4, overflow: 'hidden', backgroundColor: 'var(--color-surface-pearl)', flexShrink: 0 }}>
                        <Image src={inv.product.imageUrl || inv.product.thumbnail} alt={inv.product.name} fill style={{ objectFit: 'cover' }} />
                      </div>
                      <div style={{ fontWeight: 500, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {inv.product.name}
                      </div>
                    </td>
                    <td style={{ padding: '16px' }}>
                      <div style={{ fontWeight: 500 }}>{inv.variant?.name || 'Default'}</div>
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)' }}>{inv.variant?.sku}</div>
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', fontWeight: 600 }}>
                      {stock}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right', color: 'var(--color-ink-muted-80)' }}>
                      {inv.soldQuantity}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'center' }}>
                      {isOutOfStock ? (
                        <span style={{ padding: '4px 8px', borderRadius: 100, backgroundColor: 'rgba(230,57,70,0.1)', color: 'var(--color-danger)', fontSize: 12, fontWeight: 600 }}>Hết hàng</span>
                      ) : isLowStock ? (
                        <span style={{ padding: '4px 8px', borderRadius: 100, backgroundColor: 'rgba(255,160,0,0.1)', color: 'var(--color-warning)', fontSize: 12, fontWeight: 600 }}>Sắp hết ({inv.lowStockThreshold})</span>
                      ) : (
                        <span style={{ padding: '4px 8px', borderRadius: 100, backgroundColor: 'rgba(42,157,143,0.1)', color: 'var(--color-success)', fontSize: 12, fontWeight: 600 }}>Còn hàng</span>
                      )}
                    </td>
                    <td style={{ padding: '16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                        <Button variant="outline" size="sm" onClick={() => setLogInventory(inv)}>
                          Lịch sử
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => setAdjustmentInventory(inv)}>
                          Điều chỉnh
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data && data.pagination.totalPages > 1 && (
          <div style={{ padding: '16px', borderTop: '1px solid var(--color-divider-soft)', display: 'flex', justifyContent: 'center', gap: 8 }}>
            <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage(p => p - 1)}>
              Trước
            </Button>
            <div style={{ display: 'flex', alignItems: 'center', padding: '0 12px', fontSize: 14, fontWeight: 500 }}>
              Trang {page} / {data.pagination.totalPages}
            </div>
            <Button variant="outline" size="sm" disabled={page === data.pagination.totalPages} onClick={() => setPage(p => p + 1)}>
              Sau
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
