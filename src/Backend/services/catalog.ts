import { ProductFilters, SortOption } from '@/Shared/types';
import { prisma } from '@/Backend/database/prisma';
import { Prisma } from '@prisma/client';

/* ── Available filter values ── */

export async function getAvailableFilters(whereClause: Prisma.ProductWhereInput) {
  // To get available filters accurately, we need to know what exists in the CURRENT filtered subset.
  // For simplicity and performance, we'll fetch distinct values for categories and brands.
  
  const [categories, subcategories, brands, maxPriceAgg, colors, sizes] = await Promise.all([
    prisma.product.findMany({ where: whereClause, select: { categorySlug: true }, distinct: ['categorySlug'] }),
    prisma.product.findMany({ where: whereClause, select: { subcategorySlug: true }, distinct: ['subcategorySlug'] }),
    prisma.product.findMany({ where: whereClause, select: { brand: true }, distinct: ['brand'] }),
    prisma.product.aggregate({ where: whereClause, _max: { price: true }, _min: { price: true } }),
    prisma.productColor.findMany({ 
      where: { product: whereClause }, 
      select: { name: true }, 
      distinct: ['name'] 
    }),
    prisma.productSize.findMany({ 
      where: { product: whereClause }, 
      select: { name: true }, 
      distinct: ['name'] 
    })
  ]);

  return {
    categories: categories.map(c => c.categorySlug).filter(Boolean).sort(),
    subcategories: subcategories.map(s => s.subcategorySlug).filter(Boolean) as string[],
    brands: brands.map(b => b.brand).filter(Boolean).sort(),
    colors: colors.map(c => c.name).sort(),
    sizes: sizes.map(s => s.name).sort(),
    priceRange: { 
      min: maxPriceAgg._min.price || 0, 
      max: maxPriceAgg._max.price || 0 
    },
  };
}

/* ── Main query function ── */

export async function queryProducts(filters: ProductFilters = {}) {
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 24;
  const sort = filters.sort ?? 'recommended';

  // Build Prisma Where Clause
  const where: Prisma.ProductWhereInput = {};

  if (filters.q) {
    where.OR = [
      { name: { contains: filters.q } },
      { description: { contains: filters.q } },
      { brand: { contains: filters.q } },
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

  // Fetch Available Filters based on current where clause (before pagination)
  const availableFilters = await getAvailableFilters(where);

  // Total count
  const total = await prisma.product.count({ where });

  // Fetch paginated data
  const rawProducts = await prisma.product.findMany({
    where,
    orderBy,
    skip: (page - 1) * limit,
    take: limit,
    include: {
      colors: true,
      sizes: true,
      inventory: true
    }
  });

  // Map to frontend Product type
  const data = rawProducts.map(p => ({
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
    stock: p.inventory.reduce((sum, inv) => sum + inv.stockQuantity, 0)
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
}

export async function getProductDetails(id: string) {
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
}

