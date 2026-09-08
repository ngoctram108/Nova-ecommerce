import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetails } from '@/Backend/services/catalog';
import ProductGallery from '@/Frontend/components/product/ProductGallery';
import AddToCartForm from '@/Frontend/components/product/AddToCartForm';
import styles from './ProductDetail.module.css';

export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = await getProductDetails(id);
  
  if (!product) {
    return { title: 'Product Not Found | NORA' };
  }
  
  return {
    title: `${product.name} | NORA`,
    description: product.description,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProductDetails(id);

  if (!product) {
    notFound();
  }

  return (
    <div className="container section">
      <div className={styles.productDetailContainer}>
        {/* Left: Gallery */}
        <div className={styles.galleryColumn}>
          <ProductGallery product={product} />
        </div>

        {/* Right: Info & Actions */}
        <div className={styles.infoColumn}>
          {/* Header */}
          <div>
            <div className={styles.brandLabel}>
              {product.brand}
            </div>
            <h1 className={styles.productName}>
              {product.name}
            </h1>
            
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {'★'.repeat(Math.floor(product.rating))}
                <span className={styles.emptyStars}>
                  {'★'.repeat(5 - Math.floor(product.rating))}
                </span>
              </div>
              {product.reviewCount > 0 ? (
                <span className={styles.reviewCount}>
                  {product.rating.toFixed(1)}/5 ({product.reviewCount} đánh giá)
                </span>
              ) : (
                <span className={styles.reviewCount}>
                  (Chưa có đánh giá)
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <div className={styles.description}>
            {product.description}
          </div>

          {/* Specs */}
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className={styles.specsContainer}>
              {Object.entries(product.specs).map(([key, value]) => (
                <div key={key} className={styles.specRow}>
                  <span className={styles.specKey}>{key}</span>
                  <span className={styles.specValue}>{value}</span>
                </div>
              ))}
            </div>
          )}

          <hr className={styles.divider} />

          {/* Add to Cart Form */}
          <AddToCartForm product={product} />

          {/* Additional info */}
          <div className={styles.additionalInfo}>
            <div className={styles.infoRow}>
              <span>🚚</span>
              <span>Miễn phí giao hàng cho đơn từ 1.000.000đ</span>
            </div>
            <div className={styles.infoRow}>
              <span>🔄</span>
              <span>Đổi trả miễn phí trong 30 ngày</span>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div style={{ marginTop: 40 }}>
        <h2 style={{ fontSize: 'var(--text-display-sm-size)', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-hairline)', paddingBottom: 'var(--space-sm)' }}>
          Đánh giá từ khách hàng ({product.reviews?.length || 0})
        </h2>
        
        {product.reviews && product.reviews.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
            {product.reviews.map((review: any) => (
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
    </div>
  );
}
