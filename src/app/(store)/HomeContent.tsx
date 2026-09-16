'use client';

import React from 'react';
import { Product } from '@/Shared/types';
import HeroSection from '@/Frontend/components/sections/HeroSection';
import CategorySection from '@/Frontend/components/sections/CategorySection';
import ProductCarousel from '@/Frontend/components/sections/ProductCarousel';
import ValueProposition from '@/Frontend/components/sections/ValueProposition';
import { useLocale } from '@/Frontend/contexts/LocaleContext';

interface HomeContentProps {
  featured: Product[];
  newArrivals: Product[];
  onSale: Product[];
}

export default function HomeContent({ featured, newArrivals, onSale }: HomeContentProps) {
  const { t } = useLocale();

  return (
    <div>
      <HeroSection />
      
      <CategorySection />
      
      <ProductCarousel
        title={t.home.featuredProducts}
        products={featured}
        viewAllLink="/products?sort=recommended"
      />
      
      <ProductCarousel
        title={t.home.newArrivals}
        products={newArrivals}
        viewAllLink="/products?sort=newest"
        backgroundColor="var(--color-surface-pearl)"
      />
      
      <ProductCarousel
        title={t.home.specialOffers}
        products={onSale}
        viewAllLink="/products?badge=SALE"
      />
      
      <ValueProposition />
    </div>
  );
}
