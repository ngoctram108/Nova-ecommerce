'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/Frontend/components/ui';
import ReviewModal from './ReviewModal';
import { useRouter } from 'next/navigation';

interface OrderItem {
  id: string;
  productId: string;
  name: string;
  thumbnail: string;
  imageUrl?: string | null;
  imageAlt?: string | null;
  variantName?: string | null;
  quantity: number;
  unitPrice: number;
  reviews?: { id: string; rating: number; comment: string }[];
}

interface OrderItemsListProps {
  items: OrderItem[];
  orderStatus: string;
}

export default function OrderItemsList({ items, orderStatus }: OrderItemsListProps) {
  const router = useRouter();
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewProductId, setReviewProductId] = useState('');
  const [reviewOrderItemId, setReviewOrderItemId] = useState('');
  const [reviewProductName, setReviewProductName] = useState('');
  const [reviewExisting, setReviewExisting] = useState<{ id: string; rating: number; comment: string } | null>(null);

  const openReviewModal = (productId: string, orderItemId: string, productName: string, existing?: { id: string; rating: number; comment: string } | null) => {
    setReviewProductId(productId);
    setReviewOrderItemId(orderItemId);
    setReviewProductName(productName);
    setReviewExisting(existing || null);
    setReviewModalOpen(true);
  };

  return (
    <>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600 }}>
          Sản phẩm ({items.length})
        </h3>
        {items.map((item, index) => {
          const hasReviewed = item.reviews && item.reviews.length > 0;
          return (
            <div key={index} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <div
                style={{
                  position: 'relative',
                  width: 64,
                  height: 64,
                  borderRadius: 'var(--rounded-xs)',
                  overflow: 'hidden',
                  flexShrink: 0,
                  backgroundColor: 'var(--color-canvas-parchment)',
                }}
              >
                <Image src={item.imageUrl || item.thumbnail} alt={item.imageAlt || item.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                {item.variantName && <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-80)' }}>{item.variantName}</div>}
                <div style={{ fontSize: 'var(--text-caption-size)' }}>
                  {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                </div>
              </div>
              {orderStatus === 'DELIVERED' && (
                <div>
                  {hasReviewed ? (
                    <button 
                      onClick={() => openReviewModal(item.productId, item.id, item.name, item.reviews![0])}
                      style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-success)', fontWeight: 500, padding: '4px 8px', backgroundColor: 'rgba(0, 200, 83, 0.1)', borderRadius: 4, border: 'none', cursor: 'pointer', transition: 'opacity 0.2s' }}
                      onMouseOver={(e) => (e.currentTarget.style.opacity = '0.7')}
                      onMouseOut={(e) => (e.currentTarget.style.opacity = '1')}
                    >
                      ★ Đã đánh giá · Sửa
                    </button>
                  ) : (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => openReviewModal(item.productId, item.id, item.name)}
                    >
                      Đánh giá sản phẩm
                    </Button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      <ReviewModal
        isOpen={reviewModalOpen}
        onClose={() => setReviewModalOpen(false)}
        productId={reviewProductId}
        orderItemId={reviewOrderItemId}
        productName={reviewProductName}
        onSuccess={() => router.refresh()}
        existingReview={reviewExisting}
      />
    </>
  );
}
