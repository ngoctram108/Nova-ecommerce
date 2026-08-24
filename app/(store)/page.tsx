import React from 'react';
import HeroSection from '@/components/sections/HeroSection';
import CategorySection from '@/components/sections/CategorySection';
import ProductCarousel from '@/components/sections/ProductCarousel';
import ValueProposition from '@/components/sections/ValueProposition';
import { queryProducts } from '@/lib/services/catalog';

export default async function HomePage() {
  // Fetch mock data for the carousels
  const [featured, newArrivals, onSale] = (await Promise.all([
    queryProducts({ sort: 'recommended', limit: 8 }),
    queryProducts({ sort: 'newest', limit: 8 }),
    queryProducts({ badge: 'SALE', limit: 8 })
  ])).map(res => res.data);

  return (
    <div>
      <HeroSection />
      
      <CategorySection />
      
      <ProductCarousel
        title="Sản phẩm nổi bật"
        products={featured}
        viewAllLink="/products?sort=recommended"
      />
      
      <ProductCarousel
        title="Hàng mới về"
        products={newArrivals}
        viewAllLink="/products?sort=newest"
        backgroundColor="var(--color-surface-pearl)"
      />
      
      <ProductCarousel
        title="Ưu đãi đặc biệt"
        products={onSale}
        viewAllLink="/products?badge=SALE"
      />
      
      <ValueProposition />
    </div>
  );
}
