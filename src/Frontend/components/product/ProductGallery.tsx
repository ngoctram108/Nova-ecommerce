'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Badge } from '@/Frontend/components/ui';
import { Product } from '@/Shared/types';
import { useProductImage } from '@/Frontend/hooks/useProductImage';
import styles from './ProductGallery.module.css';

export default function ProductGallery({
  product,
}: {
  product: Product;
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const { imageUrl, imageAlt } = useProductImage(product);
  
  // Combine dynamic image with existing images
  const allImages = [imageUrl || product.thumbnail, ...product.images.filter(img => img !== product.thumbnail)];
  const currentImageAlt = activeIndex === 0 ? imageAlt : `Product Image ${activeIndex + 1}`;

  return (
    <div className={styles.galleryContainer}>
      {/* Main Image */}
      <div className={styles.mainImageWrapper}>
        {product.badge && (
          <div className={styles.badgeContainer}>
            <Badge type={product.badge} />
          </div>
        )}
        {product.stock === 0 && (
          <div className={styles.badgeContainer}>
            <Badge type="SOLD_OUT" />
          </div>
        )}
        <Image
          src={allImages[activeIndex]}
          alt={currentImageAlt}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          style={{ objectFit: 'cover' }}
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (target.src !== product.thumbnail && target.src !== 'https://placehold.co/800') {
               target.src = product.thumbnail || 'https://placehold.co/800';
               target.srcset = '';
            }
          }}
        />
      </div>

      {/* Thumbnails */}
      {allImages.length > 1 && (
        <div className={styles.thumbnailsContainer}>
          {allImages.map((img, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`${styles.thumbnailBtn} ${activeIndex === index ? styles.thumbnailBtnActive : ''}`}
              aria-label={`View image ${index + 1}`}
            >
              <Image
                src={img}
                alt={`Thumbnail ${index + 1}`}
                fill
                sizes="80px"
                style={{ objectFit: 'cover' }}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
