import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetails, getProductMeta } from '@/Backend/services/catalog';
import ProductGallery from '@/Frontend/components/product/ProductGallery';
import AddToCartForm from '@/Frontend/components/product/AddToCartForm';
import ProductReviewsSection from './ProductReviewsSection';
import styles from './ProductDetail.module.css';

export const revalidate = 60;

// Generate metadata for SEO
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const productMeta = await getProductMeta(id);
  
  if (!productMeta) {
    return { title: 'Product Not Found | NORA' };
  }
  
  return {
    title: `${productMeta.name} | NORA`,
    description: productMeta.description,
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

      {/* Reviews Section with Suspense */}
      <Suspense fallback={<ReviewsSkeleton />}>
        <ProductReviewsSection productId={product.id} />
      </Suspense>
    </div>
  );
}

function ReviewsSkeleton() {
  return (
    <div style={{ marginTop: 40 }}>
      <div style={{ width: 250, height: 32, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginBottom: 'var(--space-xl)', borderBottom: '1px solid var(--color-hairline)' }} />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ padding: 'var(--space-md)', backgroundColor: 'var(--color-canvas)', borderRadius: 'var(--rounded-md)', border: '1px solid var(--color-hairline)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <div>
                <div style={{ width: 120, height: 20, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginBottom: 8 }} />
                <div style={{ width: 80, height: 16, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
              </div>
              <div style={{ width: 100, height: 16, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
            </div>
            <div style={{ width: '100%', height: 16, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginBottom: 8 }} />
            <div style={{ width: '80%', height: 16, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
          </div>
        ))}
      </div>
    </div>
  );
}
