// ─────────────────────────────────────────────
// NORA E-Commerce — Categories Mock Data
// 6 categories as per IMPLEMENT.md §9.2
// ─────────────────────────────────────────────

import { Category } from '@/Shared/types';

export const categories: Category[] = [
  {
    id: 'cat_01',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Discover the latest additions to our curated collection.',
    image: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?w=800&q=80',
    productCount: 12,
  },
  {
    id: 'cat_02',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Premium essentials crafted for modern living.',
    image: 'https://images.unsplash.com/photo-1434389678369-182cb139e210?w=800&q=80',
    productCount: 15,
  },
  {
    id: 'cat_03',
    name: 'Shoes',
    slug: 'shoes',
    description: 'From everyday comfort to statement pieces.',
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80',
    productCount: 10,
  },
  {
    id: 'cat_04',
    name: 'Bags',
    slug: 'bags',
    description: 'Carry your essentials in refined style.',
    image: 'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?w=800&q=80',
    productCount: 8,
  },
  {
    id: 'cat_05',
    name: 'Accessories',
    slug: 'accessories',
    description: 'The finishing touches that define your look.',
    image: 'https://images.unsplash.com/photo-1509319117193-57bab727e09d?w=800&q=80',
    productCount: 10,
  },
  {
    id: 'cat_06',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Elevated everyday objects for your space.',
    image: 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&q=80',
    productCount: 7,
  },
];

export const brands = [
  'NORA',
  'Atelier Gris',
  'Maison Koel',
  'Studio Mørk',
  'Fjord & Co',
  'Ligne Pure',
  'Vide Studio',
  'Ren Collective',
];

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}

export function getCategoryById(id: string): Category | undefined {
  return categories.find((c) => c.id === id);
}
