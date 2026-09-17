import React from 'react';
import { cookies } from 'next/headers';
import { queryProducts } from '@/Backend/services/catalog';
import HomeContent from './HomeContent';

export default async function HomePage() {
  const cookieStore = await cookies();
  const locale = (cookieStore.get('NEXT_LOCALE')?.value || 'vi') as 'vi' | 'en';

  // Fetch mock data for the carousels
  const [featured, newArrivals, onSale] = (await Promise.all([
    queryProducts({ sort: 'recommended', limit: 8, locale }),
    queryProducts({ sort: 'newest', limit: 8, locale }),
    queryProducts({ badge: 'SALE', limit: 8, locale })
  ])).map(res => res.data);

  return (
    <HomeContent
      featured={featured}
      newArrivals={newArrivals}
      onSale={onSale}
    />
  );
}
