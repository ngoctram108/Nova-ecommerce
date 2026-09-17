'use client';

import React from 'react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';
import { getLocalizedName, getLocalizedDescription, LocalizableProduct } from '@/Shared/utils/localize';
import styles from './ProductDetail.module.css';

export function LocalizedProductName({ product }: { product: LocalizableProduct }) {
  const { locale } = useLocale();
  return <>{getLocalizedName(product, locale)}</>;
}

export function LocalizedProductDescription({ product }: { product: LocalizableProduct }) {
  const { locale } = useLocale();
  return <>{getLocalizedDescription(product, locale)}</>;
}

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
