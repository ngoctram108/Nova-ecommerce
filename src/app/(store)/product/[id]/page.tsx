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
              <LocalizedProductName product={product} />
            </h1>
            
            <div className={styles.ratingContainer}>
              <div className={styles.stars}>
                {'★'.repeat(Math.floor(product.rating))}
                <span className={styles.emptyStars}>
                  {'★'.repeat(5 - Math.floor(product.rating))}
                </span>
              </div>
              {/* ProductDetailReviews Client Component */}
              <ProductDetailReviews rating={product.rating} count={product.reviewCount} />
            </div>
          </div>

          {/* Description */}
          <div className={styles.description}>
            <LocalizedProductDescription product={product} />
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
          <ProductAdditionalInfo />
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

import { ProductDetailReviews, ProductAdditionalInfo, LocalizedProductName, LocalizedProductDescription } from './ProductDetailI18n';
