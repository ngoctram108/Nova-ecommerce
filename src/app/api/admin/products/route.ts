import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const q = searchParams.get('q') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'updated_desc';

    const where: any = {};

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { brand: { contains: q, mode: 'insensitive' } },
        { slug: { contains: q, mode: 'insensitive' } },
      ];
    }

    if (category) {
      where.categorySlug = category;
    }

    let orderBy: any = { updatedAt: 'desc' };
    switch (sort) {
      case 'name_asc': orderBy = { name: 'asc' }; break;
      case 'name_desc': orderBy = { name: 'desc' }; break;
      case 'price_asc': orderBy = { price: 'asc' }; break;
      case 'price_desc': orderBy = { price: 'desc' }; break;
      case 'created_desc': orderBy = { createdAt: 'desc' }; break;
      case 'updated_desc': orderBy = { updatedAt: 'desc' }; break;
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          variants: { select: { id: true, name: true, sku: true, price: true } },
          inventory: { select: { stockQuantity: true, soldQuantity: true } },
          _count: { select: { orderItems: true, reviews: true } },
        },
      }),
      prisma.product.count({ where }),
    ]);

    // Get unique categories for filter dropdown
    const categories = await prisma.product.findMany({
      select: { categorySlug: true },
      distinct: ['categorySlug'],
      orderBy: { categorySlug: 'asc' },
    });

    return NextResponse.json({
      success: true,
      data: products.map(p => ({
        id: p.id,
        slug: p.slug,
        name: p.name,
        brand: p.brand,
        category: p.categorySlug,
        price: p.price,
        compareAt: p.compareAt,
        thumbnail: p.thumbnail,
        imageUrl: p.imageUrl,
        badge: p.badge,
        featured: p.featured,
        rating: p.rating,
        reviewCount: p.reviewCount,
        variantCount: p.variants.length,
        variants: p.variants,
        totalStock: p.inventory.reduce((s, inv) => s + inv.stockQuantity, 0),
        totalSold: p.inventory.reduce((s, inv) => s + inv.soldQuantity, 0),
        orderCount: p._count.orderItems,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
      })),
      categories: categories.map(c => c.categorySlug),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Products API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const {
      name, slug, brand, description, price, compareAt, categorySlug,
      subcategorySlug, thumbnail, images, imageUrl, imageAlt, imageSourceUrl, badge, featured, tags, specs,
      variants, colors, sizes
    } = body;

    if (!name || !slug || !brand || !price || !categorySlug) {
      return NextResponse.json({ error: 'Missing required fields: name, slug, brand, price, categorySlug' }, { status: 400 });
    }

    const product = await prisma.$transaction(async (tx) => {
      const newProduct = await tx.product.create({
        data: {
          name,
          slug,
          brand,
          description: description || '',
          price,
          compareAt: compareAt || null,
          categorySlug,
          subcategorySlug: subcategorySlug || null,
          thumbnail: thumbnail || 'https://placehold.co/800',
          images: JSON.stringify(images || []),
          imageUrl: imageUrl || null,
          imageAlt: imageAlt || null,
          imageSourceUrl: imageSourceUrl || null,
          badge: badge || null,
          featured: featured || false,
          tags: tags ? JSON.stringify(tags) : null,
          specs: specs ? JSON.stringify(specs) : null,
        },
      });

      // Create variants and their inventory
      if (variants && variants.length > 0) {
        for (const v of variants) {
          const variant = await tx.productVariant.create({
            data: {
              productId: newProduct.id,
              name: v.name,
              sku: v.sku,
              price: v.price || null,
              attributes: JSON.stringify(v.attributes || {}),
            },
          });

          await tx.inventory.create({
            data: {
              productId: newProduct.id,
              variantId: variant.id,
              stockQuantity: v.stock || 0,
              lowStockThreshold: v.lowStockThreshold || 5,
            },
          });
        }
      } else {
        // Create default inventory for product without variants
        await tx.inventory.create({
          data: {
            productId: newProduct.id,
            stockQuantity: body.stock || 0,
            lowStockThreshold: body.lowStockThreshold || 5,
          },
        });
      }

      // Create colors
      if (colors && colors.length > 0) {
        await tx.productColor.createMany({
          data: colors.map((c: any) => ({
            productId: newProduct.id,
            name: c.name,
            hex: c.hex,
            swatch: c.swatch || null,
          })),
        });
      }

      // Create sizes
      if (sizes && sizes.length > 0) {
        await tx.productSize.createMany({
          data: sizes.map((s: any) => ({
            productId: newProduct.id,
            name: s.name || s,
          })),
        });
      }

      return newProduct;
    });

    return NextResponse.json({ success: true, data: product }, { status: 201 });
  } catch (error: any) {
    console.error('Admin Products POST error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug or SKU already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
