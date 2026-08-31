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
      inventoryStats,
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
      prisma.inventory.findMany({
        select: { stockQuantity: true, lowStockThreshold: true }
      }),
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

    const totalStock = inventoryStats.reduce((sum, inv) => sum + inv.stockQuantity, 0);
    const lowStockCount = inventoryStats.filter(inv => inv.stockQuantity > 0 && inv.stockQuantity <= inv.lowStockThreshold).length;
    const outOfStockCount = inventoryStats.filter(inv => inv.stockQuantity === 0).length;

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
