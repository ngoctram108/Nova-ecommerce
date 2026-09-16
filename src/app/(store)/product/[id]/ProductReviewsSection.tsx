import React from 'react';
import { getProductReviews } from '@/Backend/services/catalog';
import { ProductReviewsList } from './ProductReviewsI18n';

export default async function ProductReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);

  return (
    <div style={{ marginTop: 40 }}>
      <ProductReviewsList reviews={reviews} />
    </div>
  );
}
