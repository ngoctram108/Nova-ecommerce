'use client';

import React from 'react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';

export function ProductsPageTitle({ category }: { category?: string }) {
  const { t } = useLocale();
  
  const getCategoryLabel = (cat: string) => {
    return (t.categories as Record<string, string>)[cat] || cat;
  };

  return (
    <h1 className="text-display-lg">
      {category ? getCategoryLabel(category) : t.products.title}
    </h1>
  );
}

export function ProductsResultCount({ shown, total }: { shown: number; total: number }) {
  const { t } = useLocale();
  return (
    <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', marginBottom: 'var(--space-lg)', textAlign: 'right', marginTop: '-60px' }}>
      {t.products.showing} {shown} {t.products.of} {total} {t.products.productsLabel}
    </div>
  );
}

export function ProductsEmptyState() {
  const { t } = useLocale();
  return (
    <div style={{ paddingTop: 'var(--space-xl)', textAlign: 'center' }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <h3 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 8 }}>{t.products.noProducts}</h3>
      <p style={{ color: 'var(--color-ink-muted-80)' }}>{t.products.noProductsDesc}</p>
    </div>
  );
}
