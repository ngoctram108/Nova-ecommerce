'use client';

import React from 'react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';
import styles from './ProductDetail.module.css';

export function ProductDetailReviews({ rating, count }: { rating: number; count: number }) {
  const { t } = useLocale();
  
  if (count > 0) {
    return (
      <span className={styles.reviewCount}>
        {rating.toFixed(1)}/5 ({count} {t.productDetail.reviews})
      </span>
    );
  }
  
  return (
    <span className={styles.reviewCount}>
      ({t.productDetail.noReviews})
    </span>
  );
}

export function ProductAdditionalInfo() {
  const { t } = useLocale();
  
  return (
    <div className={styles.additionalInfo}>
      <div className={styles.infoRow}>
        <span>🚚</span>
        <span>{t.productDetail.freeShipping}</span>
      </div>
      <div className={styles.infoRow}>
        <span>🔄</span>
        <span>{t.productDetail.easyReturns}</span>
      </div>
    </div>
  );
}
