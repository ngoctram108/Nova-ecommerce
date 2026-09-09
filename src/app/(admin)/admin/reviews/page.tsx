'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/Frontend/components/ui';
import { Trash2, Star, ExternalLink } from 'lucide-react';

interface Review {
  id: string;
  rating: number;
  comment: string;
  verified: boolean;
  createdAt: string;
  customerName: string;
  customerEmail: string;
  productName: string;
  productThumbnail: string;
  productId: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [filterRating, setFilterRating] = useState('');
  const [deletingId, setDeletingId] = useState('');

  const fetchReviews = async (page = 1) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterRating) params.set('rating', filterRating);

      const res = await fetch(`/api/admin/reviews?${params}`);
      const data = await res.json();

      if (res.ok) {
        setReviews(data.reviews);
        setPagination(data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch reviews:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [filterRating]);

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Bạn có chắc muốn xóa đánh giá này? Thao tác này không thể hoàn tác.')) return;

    setDeletingId(reviewId);
    try {
      const res = await fetch(`/api/admin/reviews/${reviewId}`, { method: 'DELETE' });
      if (res.ok) {
        fetchReviews(pagination.page);
      } else {
        const data = await res.json();
        alert(data.error || 'Lỗi khi xóa đánh giá');
      }
    } catch (err) {
      alert('Lỗi kết nối');
    } finally {
      setDeletingId('');
    }
  };

  const renderStars = (rating: number) => (
    <span style={{ color: '#ffb400', fontSize: 14 }}>
      {'★'.repeat(rating)}
      <span style={{ color: 'var(--color-hairline)' }}>{'★'.repeat(5 - rating)}</span>
    </span>
  );

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 700, marginBottom: 4 }}>
            Reviews
          </h1>
          <p style={{ color: 'var(--color-ink-muted-80)', fontSize: 'var(--text-caption-size)' }}>
            {pagination.total} đánh giá
          </p>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <label style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Lọc:</label>
          <select
            value={filterRating}
            onChange={(e) => setFilterRating(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: 'var(--rounded-sm)',
              border: '1px solid var(--color-hairline)',
              fontSize: 'var(--text-caption-size)',
              backgroundColor: '#fff',
            }}
          >
            <option value="">Tất cả sao</option>
            <option value="5">5 sao</option>
            <option value="4">4 sao</option>
            <option value="3">3 sao</option>
            <option value="2">2 sao</option>
            <option value="1">1 sao</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-ink-muted-48)' }}>Đang tải...</div>
      ) : reviews.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--color-ink-muted-48)', backgroundColor: '#fff', borderRadius: 'var(--rounded-md)', border: '1px dashed var(--color-hairline)' }}>
          Chưa có đánh giá nào.
        </div>
      ) : (
        <>
          <div style={{ backgroundColor: '#fff', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-hairline)' }}>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>Sản phẩm</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>Khách hàng</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>Đánh giá</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>Nhận xét</th>
                  <th style={{ padding: '12px 16px', textAlign: 'left', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}>Ngày</th>
                  <th style={{ padding: '12px 16px', textAlign: 'center', fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, color: 'var(--color-ink-muted-80)' }}></th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr key={review.id} style={{ borderBottom: '1px solid var(--color-hairline)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 'var(--rounded-xs)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-canvas-parchment)' }}>
                          <Image src={review.productThumbnail} alt={review.productName} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <Link
                          href={`/product/${review.productId}`}
                          target="_blank"
                          style={{ fontSize: 'var(--text-caption-size)', fontWeight: 600, color: 'var(--color-primary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          {review.productName.length > 25 ? review.productName.slice(0, 25) + '…' : review.productName}
                          <ExternalLink size={12} />
                        </Link>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 'var(--text-caption-size)', fontWeight: 500 }}>{review.customerName}</div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      {renderStars(review.rating)}
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', maxWidth: 250, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {review.comment || '—'}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-48)' }}>
                        {new Intl.DateTimeFormat('vi-VN').format(new Date(review.createdAt))}
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'center' }}>
                      <button
                        onClick={() => handleDelete(review.id)}
                        disabled={deletingId === review.id}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: deletingId === review.id ? 'not-allowed' : 'pointer',
                          color: 'var(--color-danger)',
                          opacity: deletingId === review.id ? 0.4 : 0.6,
                          transition: 'opacity 0.2s',
                          padding: 4,
                        }}
                        onMouseOver={(e) => { if (deletingId !== review.id) e.currentTarget.style.opacity = '1'; }}
                        onMouseOut={(e) => { if (deletingId !== review.id) e.currentTarget.style.opacity = '0.6'; }}
                        title="Xóa đánh giá"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviews(pagination.page - 1)}
                disabled={pagination.page <= 1}
              >
                ← Trước
              </Button>
              <span style={{ display: 'flex', alignItems: 'center', fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', padding: '0 12px' }}>
                {pagination.page} / {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchReviews(pagination.page + 1)}
                disabled={pagination.page >= pagination.totalPages}
              >
                Tiếp →
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
