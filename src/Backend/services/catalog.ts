import { ProductFilters, SortOption } from '@/Shared/types';
import { prisma } from '@/Backend/database/prisma';
import { Prisma } from '@prisma/client';
import { products as mockProducts } from '@/Backend/database/data/products';
import { unstable_cache } from 'next/cache';

/* ── Available filter values ── */

export const getAvailableFilters = unstable_cache(
  async (whereClause?: Prisma.ProductWhereInput) => {
    try {
      // We ignore the whereClause for filters to avoid calculating it on every search/filter
      // We also removed color, size, and price queries as they are not used in the UI sidebar
      const [categories, subcategories, brands] = await Promise.all([
        prisma.product.findMany({ select: { categorySlug: true }, distinct: ['categorySlug'] }),
        prisma.product.findMany({ select: { subcategorySlug: true }, distinct: ['subcategorySlug'] }),
        prisma.product.findMany({ select: { brand: true }, distinct: ['brand'] }),
      ]);

      return {
        categories: categories.map(c => c.categorySlug).filter(Boolean).sort(),
        subcategories: subcategories.map(s => s.subcategorySlug).filter(Boolean) as string[],
        brands: brands.map(b => b.brand).filter(Boolean).sort(),
        colors: [], // Not used in UI
        sizes: [], // Not used in UI
        priceRange: { min: 0, max: 10000000 }, // Inputs are uncontrolled in UI
      };
    } catch (e) {
      console.warn("Prisma getAvailableFilters failed, returning mock empty filters", e);
      return {
        categories: [],
        subcategories: [],
        brands: [],
        colors: [],
        sizes: [],
        priceRange: { min: 0, max: 10000000 },
      };
    }
  },
  ['global-available-filters'],
  { revalidate: 3600 } // Cache for 1 hour
);

/* ── Main query function ── */

export async function queryProducts(filters: ProductFilters = {}) {
  try {
    const page = filters.page ?? 1;
    const limit = filters.limit ?? 24;
    const sort = filters.sort ?? 'recommended';

    // Build Prisma Where Clause
    const where: Prisma.ProductWhereInput = {};

    if (filters.q) {
      where.OR = [
        { name: { contains: filters.q, mode: 'insensitive' } },
        { description: { contains: filters.q, mode: 'insensitive' } },
        { brand: { contains: filters.q, mode: 'insensitive' } },
      ];
    }

    if (filters.category) {
      where.categorySlug = filters.category;
    }

    if (filters.subcategory) {
      where.subcategorySlug = filters.subcategory;
    }

    if (filters.brand) {
      const brands = filters.brand.split(',').map(b => b.trim());
      where.brand = { in: brands };
    }

    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) where.price.gte = filters.minPrice;
      if (filters.maxPrice !== undefined) where.price.lte = filters.maxPrice;
    }

    if (filters.rating !== undefined) {
      where.rating = { gte: filters.rating };
    }

    if (filters.color) {
      where.colors = {
        some: {
          name: { equals: filters.color } // Case-sensitive might be an issue depending on DB collation, sqlite is usually case-insensitive for LIKE, but equals is exact. We'll leave exact for now.
        }
      };
    }

    if (filters.size) {
      where.sizes = {
        some: {
          name: { equals: filters.size }
        }
      };
    }

    if (filters.badge) {
      where.badge = filters.badge;
    }

    if (filters.inStock) {
      where.inventory = {
        some: {
          stockQuantity: { gt: 0 }
        }
      };
    }

    // Sorting
    let orderBy: Prisma.ProductOrderByWithRelationInput | Prisma.ProductOrderByWithRelationInput[] = {};
    switch (sort) {
      case 'newest':
        orderBy = { createdAt: 'desc' };
        break;
      case 'rating':
        orderBy = { rating: 'desc' };
        break;
      case 'price-asc':
        orderBy = { price: 'asc' };
        break;
      case 'price-desc':
        orderBy = { price: 'desc' };
        break;
      case 'recommended':
      default:
        orderBy = [
          { featured: 'desc' },
          { rating: 'desc' },
          { createdAt: 'desc' },
        ];
        break;
    }

    // Run filters, count, and product queries in parallel (independent queries)
    const [availableFilters, total, rawProducts] = await Promise.all([
      getAvailableFilters(where),
      prisma.product.count({ where }),
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        // Select only fields needed by ProductCard — omit description, images,
        // tags, specs, colors, sizes to reduce query time and response size
        select: {
          id: true,
          slug: true,
          name: true,
          brand: true,
          price: true,
          compareAt: true,
          currency: true,
          rating: true,
          reviewCount: true,
          thumbnail: true,
          imageUrl: true,
          imageAlt: true,
          imageSourceUrl: true,
          badge: true,
          featured: true,
          categorySlug: true,
          subcategorySlug: true,
          // Only fetch stockQuantity from inventory — not full relation
          inventory: { select: { stockQuantity: true } },
        },
      }),
    ]);

    // Map to frontend Product type — lean mapping since we only selected needed fields
    const data = rawProducts.map(p => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      price: p.price,
      compareAt: p.compareAt || undefined,
      currency: p.currency as 'VND',
      rating: p.rating,
      reviewCount: p.reviewCount,
      thumbnail: p.thumbnail,
      imageUrl: p.imageUrl || undefined,
      imageAlt: p.imageAlt || undefined,
      imageSourceUrl: p.imageSourceUrl || undefined,
      badge: (p.badge as any) || undefined,
      featured: p.featured,
      category: p.categorySlug === 'nam' ? 'Nam' : p.categorySlug === 'nu' ? 'Nữ' : p.categorySlug,
      categorySlug: p.categorySlug,
      subcategory: p.subcategorySlug || undefined,
      subcategorySlug: p.subcategorySlug || undefined,
      // Defaults for fields not fetched in listing (needed by Product type)
      description: '',
      images: [p.thumbnail],
      tags: [] as string[],
      specs: {} as Record<string, string>,
      colors: [] as { name: string; hex: string }[],
      sizes: [] as string[],
      stock: p.inventory.reduce((sum, inv) => sum + inv.stockQuantity, 0),
      createdAt: '',
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages,
      },
      filters: availableFilters,
    };
  } catch (e) {
    console.warn("Prisma queryProducts failed, falling back to mock data", e);
    
    let data = [...mockProducts];
    if (filters.category) data = data.filter(p => p.categorySlug === filters.category);
    if (filters.badge) data = data.filter(p => p.badge === filters.badge);
    if (filters.sort === 'newest') data.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    else if (filters.sort === 'price-asc') data.sort((a, b) => a.price - b.price);
    else if (filters.sort === 'price-desc') data.sort((a, b) => b.price - a.price);
    else if (filters.sort === 'rating') data.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const page = filters.page ?? 1;
    const limit = filters.limit ?? 24;
    const total = data.length;
    
    return {
      data: data.slice((page - 1) * limit, page * limit),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: { categories: [], subcategories: [], brands: [], colors: [], sizes: [], priceRange: { min: 0, max: 10000000 } }
    };
  }
}

export async function getProductDetails(id: string) {
  try {
    const p = await prisma.product.findUnique({
      where: { id },
      include: {
        colors: true,
        sizes: true,
        inventory: true,
        variants: true,
      }
    });

    if (!p) return null;

    return {
      ...p,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      currency: p.currency as 'VND',
      compareAt: p.compareAt || undefined,
      imageUrl: p.imageUrl || undefined,
      imageAlt: p.imageAlt || undefined,
      imageSourceUrl: p.imageSourceUrl || undefined,
      badge: (p.badge as any) || undefined,
      category: p.categorySlug === 'nam' ? 'Nam' : p.categorySlug === 'nu' ? 'Nữ' : p.categorySlug,
      categorySlug: p.categorySlug,
      subcategory: p.subcategorySlug || undefined,
      subcategorySlug: p.subcategorySlug || undefined,
      images: JSON.parse(p.images) as string[],
      tags: p.tags ? JSON.parse(p.tags) as string[] : [],
      specs: p.specs ? JSON.parse(p.specs) as Record<string, string> : {},
      colors: p.colors.map(c => ({ name: c.name, hex: c.hex })),
      sizes: p.sizes.map(s => s.name),
      variants: p.variants.map(v => ({
        ...v,
        attributes: v.attributes ? JSON.parse(v.attributes) as Record<string, string> : {},
        price: v.price || p.price,
        stock: p.inventory.find(i => i.variantId === v.id)?.stockQuantity || 0
      })),
      stock: p.inventory.reduce((sum, inv) => sum + inv.stockQuantity, 0)
    };
  } catch (e) {
    console.warn("Prisma getProductDetails failed, falling back to mock data", e);
    const mockProduct = mockProducts.find((p: any) => p.id === id || p.slug === id);
    return mockProduct || null;
  }
}

