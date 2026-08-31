export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';
import { Prisma } from '@prisma/client';

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
    const status = searchParams.get('status');
    const category = searchParams.get('category');
    const sort = searchParams.get('sort'); // stock_asc, stock_desc, sold_desc

    const skip = (page - 1) * limit;

    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'stock_asc') orderBy = { stockQuantity: 'asc' };
    else if (sort === 'stock_desc') orderBy = { stockQuantity: 'desc' };
    else if (sort === 'sold_desc') orderBy = { soldQuantity: 'desc' };

    // Fetch all inventory to calculate stats and do precise JS filtering for status
    const allInventory = await prisma.inventory.findMany({
      orderBy,
      include: {
        product: {
          select: { name: true, imageUrl: true, thumbnail: true, categorySlug: true, price: true }
        },
        variant: {
          select: { name: true, sku: true, price: true }
        }
      }
    });

    let totalSKU = allInventory.length;
    let totalStock = 0;
    let inStock = 0;
    let lowStock = 0;
    let outOfStock = 0;
    let totalValue = 0;

    const filteredInventory = [];

    for (const inv of allInventory) {
      totalStock += inv.stockQuantity;
      
      const price = inv.variant?.price ?? inv.product.price;
      totalValue += inv.stockQuantity * price;

      if (inv.stockQuantity === 0) {
        outOfStock++;
      } else if (inv.stockQuantity <= inv.lowStockThreshold) {
        lowStock++;
      } else {
        inStock++;
      }

      // Apply Search Filter
      if (q) {
        const query = q.toLowerCase();
        const matchName = inv.product.name.toLowerCase().includes(query);
        const matchSku = inv.variant?.sku?.toLowerCase().includes(query);
        if (!matchName && !matchSku) continue;
      }

      // Apply Category Filter
      if (category && inv.product.categorySlug !== category) continue;

      // Apply Status Filter
      if (status === 'IN_STOCK' && inv.stockQuantity <= inv.lowStockThreshold) continue;
      if (status === 'LOW_STOCK' && (inv.stockQuantity === 0 || inv.stockQuantity > inv.lowStockThreshold)) continue;
      if (status === 'OUT_OF_STOCK' && inv.stockQuantity > 0) continue;

      filteredInventory.push(inv);
    }

    const total = filteredInventory.length;
    const paginatedInventory = filteredInventory.slice(skip, skip + limit);

    return NextResponse.json({
      success: true,
      data: paginatedInventory,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      stats: {
        totalSKU,
        totalStock,
        inStock,
        lowStock,
        outOfStock,
        totalValue
      }
    });
  } catch (error) {
    console.error('API Error /api/admin/inventory:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
