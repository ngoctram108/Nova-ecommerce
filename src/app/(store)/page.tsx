import React from 'react';
import { queryProducts } from '@/Backend/services/catalog';
import HomeContent from './HomeContent';

export default async function HomePage() {
  // Fetch mock data for the carousels
  const [featured, newArrivals, onSale] = (await Promise.all([
    queryProducts({ sort: 'recommended', limit: 8 }),
    queryProducts({ sort: 'newest', limit: 8 }),
    queryProducts({ badge: 'SALE', limit: 8 })
  ])).map(res => res.data);

  return (
    <HomeContent
      featured={featured}
      newArrivals={newArrivals}
      onSale={onSale}
    />
  );
}
