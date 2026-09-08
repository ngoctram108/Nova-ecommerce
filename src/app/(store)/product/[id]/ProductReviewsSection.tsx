import React from 'react';
import { getProductReviews } from '@/Backend/services/catalog';

export default async function ProductReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);

  return (
    <div style={{ marginTop: 40 }}>
      <h2 style={{ fontSize: 'var(--text-display-sm-size)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-hairline)', paddingBottom: 'var(--space-sm)' }}>
        Đánh giá từ khách hàng ({reviews.length || 0})
      </h2>
      
      {reviews.length > 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {reviews.map((review: any) => (
            <div key={review.id} style={{ display: 'flex', flexDirection: 'column', gap: 8, padding: 'var(--space-md)', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-hairline)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-body-strong-size)' }}>
                    {review.author}
                    {review.verified && <span style={{ marginLeft: 8, fontSize: 'var(--text-caption-size)', color: 'var(--color-success)', backgroundColor: 'rgba(0,200,83,0.1)', padding: '2px 6px', borderRadius: 12 }}>Đã mua hàng</span>}
                  </div>
                  <div style={{ color: '#ffb400', fontSize: 14, marginTop: 4 }}>
                    {'★'.repeat(review.rating)}
                    <span style={{ color: 'var(--color-hairline)' }}>{'★'.repeat(5 - review.rating)}</span>
                  </div>
                </div>
                <div style={{ color: 'var(--color-ink-muted-48)', fontSize: 'var(--text-caption-size)' }}>
                  {new Intl.DateTimeFormat('vi-VN', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(review.date))}
                </div>
              </div>
              <p style={{ color: 'var(--color-ink-muted-80)', lineHeight: 1.5, margin: 0, whiteSpace: 'pre-line' }}>{review.comment}</p>
            </div>
          ))}
        </div>
      ) : (
        <div style={{ padding: 'var(--space-xl)', textAlign: 'center', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-md)', border: '1px dashed var(--color-hairline)', color: 'var(--color-ink-muted-48)' }}>
          Chưa có đánh giá nào cho sản phẩm này. Hãy là người đầu tiên trải nghiệm!
        </div>
      )}
    </div>
  );
}
