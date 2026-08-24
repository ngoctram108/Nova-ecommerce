import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getProductDetails } from '@/Backend/services/catalog';
import ProductGallery from '@/Frontend/components/product/ProductGallery';
import AddToCartForm from '@/Frontend/components/product/AddToCartForm';
import styles from './ProductDetail.module.css';

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
              <span className={styles.reviewCount}>
                ({product.reviewCount} đánh giá)
              </span>
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
    </div>
  );
}
