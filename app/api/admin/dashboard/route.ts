import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const orders = await prisma.order.findMany({
      include: { items: true, user: true },
      orderBy: { createdAt: 'desc' }
    });

    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50 // Limit to 50 for admin UI to avoid large payload
    });

    // Calculate stats
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
    
    // Get unique customers (users with orders)
    const uniqueUserIds = new Set(orders.map(o => o.userId).filter(Boolean));
    const totalCustomers = uniqueUserIds.size;

    return NextResponse.json({
      stats: { totalOrders, totalRevenue, totalCustomers },
      orders,
      products
    });
  } catch (error) {
    console.error('Admin API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
