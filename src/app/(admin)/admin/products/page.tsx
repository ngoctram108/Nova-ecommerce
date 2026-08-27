'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Button, Input } from '@/Frontend/components/ui';
import { useToast } from '@/Frontend/components/ui/Toast';
import { Search, Plus, Edit3, Trash2, ChevronDown, X } from 'lucide-react';

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand: string;
  category: string;
  price: number;
  compareAt: number | null;
  thumbnail: string;
  imageUrl: string | null;
  badge: string | null;
  featured: boolean;
  variantCount: number;
  totalStock: number;
  totalSold: number;
  orderCount: number;
  createdAt: string;
  updatedAt: string;
}

const formatCurrency = (n: number) =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n);

export default function AdminProducts() {
  const [products, setProducts] = useState<ProductRow[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, limit: 20, total: 0, totalPages: 0 });

  // Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('updated_desc');
  const [page, setPage] = useState(1);

  // Edit modal
  const [editingProduct, setEditingProduct] = useState<ProductRow | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  // Delete
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { success, error: showError } = useToast();

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        q: search,
        category,
        sort,
      });
      const res = await fetch(`/api/admin/products?${params}`);
      const data = await res.json();
      if (data.success) {
        setProducts(data.data);
        setCategories(data.categories || []);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Debounced search
  const [debouncedSearch, setDebouncedSearch] = useState('');
  useEffect(() => {
    const t = setTimeout(() => {
      setSearch(debouncedSearch);
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [debouncedSearch]);

  const openEdit = (product: ProductRow) => {
    setEditingProduct(product);
    setEditForm({
      name: product.name,
      brand: product.brand,
      price: product.price,
      compareAt: product.compareAt || '',
      badge: product.badge || '',
      featured: product.featured,
    });
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/admin/products/${editingProduct.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editForm.name,
          brand: editForm.brand,
          price: parseFloat(editForm.price),
          compareAt: editForm.compareAt ? parseFloat(editForm.compareAt) : null,
          badge: editForm.badge || null,
          featured: editForm.featured,
        }),
      });
      const data = await res.json();
      if (data.success) {
        success('Cập nhật sản phẩm thành công!');
        setEditingProduct(null);
        fetchProducts();
      } else {
        showError(data.error || 'Cập nhật thất bại');
      }
    } catch {
      showError('Lỗi kết nối');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa sản phẩm này? Hành động này không thể hoàn tác.')) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/products/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        success('Đã xóa sản phẩm');
        fetchProducts();
      } else {
        showError(data.error || 'Xóa thất bại');
      }
    } catch {
      showError('Lỗi kết nối');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Quản lý sản phẩm</h2>
        <div style={{ fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
          {pagination.total} sản phẩm
        </div>
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
            placeholder="Tìm sản phẩm, thương hiệu..."
            value={debouncedSearch}
            onChange={e => setDebouncedSearch(e.target.value)}
            style={{ border: 'none', padding: '10px', width: '100%', outline: 'none', backgroundColor: 'transparent' }}
          />
        </div>
        <select
          value={category}
          onChange={e => { setCategory(e.target.value); setPage(1); }}
          style={{ padding: '10px 16px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', backgroundColor: '#fff' }}
        >
          <option value="">Tất cả danh mục</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat.replace(/-/g, ' ')}</option>
          ))}
        </select>
        <select
          value={sort}
          onChange={e => { setSort(e.target.value); setPage(1); }}
          style={{ padding: '10px 16px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', backgroundColor: '#fff' }}
        >
          <option value="updated_desc">Mới cập nhật</option>
          <option value="created_desc">Mới tạo</option>
          <option value="name_asc">Tên A-Z</option>
          <option value="name_desc">Tên Z-A</option>
          <option value="price_asc">Giá tăng dần</option>
          <option value="price_desc">Giá giảm dần</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: 900 }}>
            <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
              <tr>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Sản phẩm</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13 }}>Danh mục</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Giá</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Tồn kho</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Đã bán</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'center' }}>Variants</th>
                <th style={{ padding: '12px 16px', fontWeight: 600, fontSize: 13, textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {loading && products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Đang tải...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: 40, textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>Không tìm thấy sản phẩm.</td>
                </tr>
              ) : products.map(product => (
                <tr key={product.id} style={{ borderBottom: '1px solid var(--color-divider-soft)', transition: 'background 0.15s' }}>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 48, height: 48, position: 'relative', borderRadius: 6, overflow: 'hidden', backgroundColor: 'var(--color-surface-pearl)', flexShrink: 0 }}>
                        <Image
                          src={product.imageUrl || product.thumbnail || 'https://placehold.co/96'}
                          alt={product.name}
                          fill
                          style={{ objectFit: 'cover' }}
                          onError={(e) => { (e.target as HTMLImageElement).src = 'https://placehold.co/96'; }}
                        />
                      </div>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 600, fontSize: 14, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 220 }}>{product.name}</div>
                        <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)' }}>{product.brand}</div>
                      </div>
                      {product.badge && (
                        <span style={{ padding: '2px 8px', borderRadius: 100, backgroundColor: product.badge === 'SALE' ? 'rgba(230,57,70,0.1)' : 'rgba(0,102,204,0.1)', color: product.badge === 'SALE' ? 'var(--color-danger)' : 'var(--color-primary)', fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
                          {product.badge}
                        </span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 13, textTransform: 'capitalize' }}>{product.category.replace(/-/g, ' ')}</span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{formatCurrency(product.price)}</div>
                    {product.compareAt && (
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', textDecoration: 'line-through' }}>{formatCurrency(product.compareAt)}</div>
                    )}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                    <span style={{ 
                      fontWeight: 600, fontSize: 14,
                      color: product.totalStock === 0 ? 'var(--color-danger)' : product.totalStock <= 5 ? 'var(--color-warning)' : 'var(--color-ink)'
                    }}>
                      {product.totalStock}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                    {product.totalSold}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'center', fontSize: 14, color: 'var(--color-ink-muted-80)' }}>
                    {product.variantCount}
                  </td>
                  <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => openEdit(product)}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--color-hairline)', backgroundColor: '#fff', cursor: 'pointer', color: 'var(--color-ink-muted-80)' }}
                        title="Chỉnh sửa"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        disabled={deletingId === product.id}
                        style={{ width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 6, border: '1px solid var(--color-hairline)', backgroundColor: '#fff', cursor: 'pointer', color: 'var(--color-danger)', opacity: deletingId === product.id ? 0.5 : 1 }}
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
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

      {/* Edit Modal */}
      {editingProduct && (
        <div style={{ 
          position: 'fixed', inset: 0, zIndex: 1000, 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(4px)',
        }}
        onClick={() => setEditingProduct(null)}
        >
          <div 
            style={{ 
              backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)', padding: 'var(--space-xl)',
              width: 520, maxHeight: '80vh', overflowY: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.15)'
            }}
            onClick={e => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-lg)' }}>
              <h3 style={{ fontSize: 18, fontWeight: 600 }}>Chỉnh sửa sản phẩm</h3>
              <button onClick={() => setEditingProduct(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                <X size={20} color="var(--color-ink-muted-80)" />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Tên sản phẩm</label>
                <input
                  value={editForm.name || ''}
                  onChange={e => setEditForm(f => ({ ...f, name: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Thương hiệu</label>
                <input
                  value={editForm.brand || ''}
                  onChange={e => setEditForm(f => ({ ...f, brand: e.target.value }))}
                  style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: 14 }}
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Giá (VND)</label>
                  <input
                    type="number"
                    value={editForm.price || ''}
                    onChange={e => setEditForm(f => ({ ...f, price: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: 14 }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Giá so sánh (VND)</label>
                  <input
                    type="number"
                    value={editForm.compareAt || ''}
                    onChange={e => setEditForm(f => ({ ...f, compareAt: e.target.value }))}
                    placeholder="Để trống nếu không có"
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: 14 }}
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Badge</label>
                  <select
                    value={editForm.badge || ''}
                    onChange={e => setEditForm(f => ({ ...f, badge: e.target.value }))}
                    style={{ width: '100%', padding: '10px 14px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)', outline: 'none', fontSize: 14, backgroundColor: '#fff' }}
                  >
                    <option value="">Không có</option>
                    <option value="NEW">NEW</option>
                    <option value="SALE">SALE</option>
                    <option value="FEATURED">FEATURED</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, display: 'block', color: 'var(--color-ink-muted-80)' }}>Nổi bật</label>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 0' }}>
                    <input
                      type="checkbox"
                      checked={editForm.featured || false}
                      onChange={e => setEditForm(f => ({ ...f, featured: e.target.checked }))}
                      style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
                    />
                    <span style={{ fontSize: 14 }}>Sản phẩm nổi bật</span>
                  </div>
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 'var(--space-xl)', paddingTop: 'var(--space-lg)', borderTop: '1px solid var(--color-divider-soft)' }}>
              <Button variant="outline" onClick={() => setEditingProduct(null)}>Huỷ</Button>
              <Button onClick={handleSave} loading={saving}>Lưu thay đổi</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
