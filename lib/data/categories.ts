// ─────────────────────────────────────────────
// NORA E-Commerce — Categories Mock Data
// 6 categories as per IMPLEMENT.md §9.2
// ─────────────────────────────────────────────

import { Category } from '@/lib/types';

export const categories: Category[] = [
  {
    id: 'cat_01',
    name: 'New Arrivals',
    slug: 'new-arrivals',
    description: 'Discover the latest additions to our curated collection.',
    image: '/images/categories/new-arrivals.jpg',
    productCount: 12,
  },
  {
    id: 'cat_02',
    name: 'Clothing',
    slug: 'clothing',
    description: 'Premium essentials crafted for modern living.',
    image: '/images/categories/clothing.jpg',
    productCount: 15,
  },
  {
    id: 'cat_03',
    name: 'Shoes',
    slug: 'shoes',
    description: 'From everyday comfort to statement pieces.',
    image: '/images/categories/shoes.jpg',
    productCount: 10,
  },
  {
    id: 'cat_04',
    name: 'Bags',
    slug: 'bags',
    description: 'Carry your essentials in refined style.',
    image: '/images/categories/bags.jpg',
    productCount: 8,
  },
  {
    id: 'cat_05',
    name: 'Accessories',
    slug: 'accessories',
    description: 'The finishing touches that define your look.',
    image: '/images/categories/accessories.jpg',
    productCount: 10,
  },
  {
    id: 'cat_06',
    name: 'Lifestyle',
    slug: 'lifestyle',
    description: 'Elevated everyday objects for your space.',
    image: '/images/categories/lifestyle.jpg',
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
