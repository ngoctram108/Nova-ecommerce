'use client';

import React, { useState, useEffect } from 'react';
import { Button, Input } from '@/Frontend/components/ui';

interface ExistingReview {
  id: string;
  rating: number;
  comment: string;
}

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: string;
  orderItemId: string;
  productName: string;
  onSuccess: () => void;
  existingReview?: ExistingReview | null;
}

export default function ReviewModal({
  isOpen,
  onClose,
  productId,
  orderItemId,
  productName,
  onSuccess,
  existingReview
}: ReviewModalProps) {
  const isEditMode = !!existingReview;
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Pre-fill form when editing
  useEffect(() => {
    if (isOpen && existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment);
    } else if (isOpen && !existingReview) {
      setRating(0);
      setComment('');
    }
    setError('');
    setSuccessMsg('');
  }, [isOpen, existingReview]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (rating === 0) {
      setError('Vui lòng chọn số sao đánh giá');
      return;
    }

    setLoading(true);

    try {
      let res: Response;

      if (isEditMode) {
        // PATCH existing review
        res = await fetch(`/api/reviews/${existingReview.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ rating, comment }),
        });
      } else {
        // POST new review
        res = await fetch('/api/reviews', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ productId, orderItemId, rating, comment }),
        });
      }

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Đã có lỗi xảy ra. Vui lòng thử lại.');
      } else {
        setSuccessMsg(isEditMode ? 'Đã cập nhật đánh giá!' : 'Cảm ơn bạn đã đánh giá sản phẩm!');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1200);
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    if (!confirm('Bạn có chắc muốn xóa đánh giá này?')) return;

    setDeleteLoading(true);
    setError('');

    try {
      const res = await fetch(`/api/reviews/${existingReview.id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Không thể xóa đánh giá.');
      } else {
        setSuccessMsg('Đã xóa đánh giá.');
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 1200);
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại sau.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleClose = () => {
    setRating(0);
    setHoverRating(0);
    setComment('');
    setError('');
    setSuccessMsg('');
    onClose();
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
      padding: 'var(--space-md)'
    }}>
      <div className="tile-light" style={{
        width: '100%',
        maxWidth: 500,
        padding: 'var(--space-xl)',
        borderRadius: 'var(--rounded-lg)',
        position: 'relative'
      }}>
        <button 
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 24,
            lineHeight: 1,
            color: 'var(--color-ink-muted-48)'
          }}
        >
          &times;
        </button>

        <h2 style={{ fontSize: 'var(--text-title-size)', marginBottom: 'var(--space-md)' }}>
          {isEditMode ? 'Chỉnh sửa đánh giá' : 'Đánh giá sản phẩm'}
        </h2>
        
        <div style={{ marginBottom: 'var(--space-lg)', fontWeight: 600 }}>
          {productName}
        </div>

        {successMsg ? (
          <div style={{ padding: 16, backgroundColor: '#dcfce7', color: '#15803d', borderRadius: 8, textAlign: 'center' }}>
            {successMsg}
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 'var(--text-caption-strong-size)', fontWeight: 500 }}>
                Chất lượng sản phẩm
              </label>
              <div style={{ display: 'flex', gap: 4, cursor: 'pointer', fontSize: 32 }}>
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    onMouseEnter={() => setHoverRating(star)}
                    onMouseLeave={() => setHoverRating(0)}
                    onClick={() => setRating(star)}
                    style={{
                      color: star <= (hoverRating || rating) ? '#ffb400' : 'var(--color-hairline)',
                      transition: 'color 0.15s ease',
                    }}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: 8, fontSize: 'var(--text-caption-strong-size)', fontWeight: 500 }}>
                Nhận xét (Tùy chọn)
              </label>
              <textarea 
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Hãy chia sẻ nhận xét của bạn về sản phẩm này nhé..."
                style={{
                  width: '100%',
                  minHeight: 100,
                  padding: 12,
                  borderRadius: 'var(--rounded-md)',
                  border: '1px solid var(--color-hairline)',
                  resize: 'vertical',
                  fontFamily: 'inherit'
                }}
                maxLength={500}
              />
            </div>

            {error && (
              <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--rounded-sm)', fontSize: 'var(--text-body-size)' }}>
                {error}
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 }}>
              <div>
                {isEditMode && (
                  <Button 
                    variant="ghost" 
                    type="button" 
                    onClick={handleDelete} 
                    loading={deleteLoading}
                    style={{ color: 'var(--color-danger)' }}
                  >
                    Xóa đánh giá
                  </Button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <Button variant="outline" type="button" onClick={handleClose}>
                  Hủy
                </Button>
                <Button variant="primary" type="submit" loading={loading}>
                  {isEditMode ? 'Cập nhật' : 'Gửi đánh giá'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
