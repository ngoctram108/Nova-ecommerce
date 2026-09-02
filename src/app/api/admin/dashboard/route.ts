export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const [
      totalOrders,
      totalRevenue,
      totalCustomers,
      totalProducts,
      totalStockAgg,
      lowStockCount,
      outOfStockCount,
      recentOrders,
      topSellingItems,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.aggregate({
        _sum: { total: true },
        where: { status: { not: 'CANCELLED' } }
      }),
      prisma.user.count({ where: { role: 'CUSTOMER' } }),
      prisma.product.count(),
      prisma.inventory.aggregate({ _sum: { stockQuantity: true } }),
      prisma.inventory.count({ where: { stockQuantity: { gt: 0, lte: 5 } } }),
      prisma.inventory.count({ where: { stockQuantity: 0 } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { name: true, email: true } },
          items: { select: { name: true, quantity: true } }
        }
      }),
      prisma.orderItem.groupBy({
        by: ['productId', 'name'],
        _sum: { quantity: true },
        orderBy: { _sum: { quantity: 'desc' } },
        take: 5,
      }),
    ]);

    const totalStock = totalStockAgg._sum.stockQuantity || 0;

    return NextResponse.json({
      stats: {
        totalOrders,
        totalRevenue: totalRevenue._sum.total || 0,
        totalCustomers,
        totalProducts,
        totalStock,
        lowStockCount,
        outOfStockCount,
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        customer: order.user?.name || order.user?.email || 'Guest',
        total: order.total,
        status: order.status,
        itemCount: order.items.reduce((sum, item) => sum + item.quantity, 0),
        createdAt: order.createdAt,
      })),
      topProducts: topSellingItems.map(item => ({
        productId: item.productId,
        name: item.name,
        totalSold: item._sum.quantity || 0,
      })),
    });
  } catch (error) {
    console.error('Admin Dashboard API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
