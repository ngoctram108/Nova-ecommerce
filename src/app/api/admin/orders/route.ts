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
    const status = searchParams.get('status') || '';
    const q = searchParams.get('q') || '';
    const sort = searchParams.get('sort') || 'newest';

    const where: any = {};

    if (status) {
      where.status = status;
    }

    if (q) {
      where.OR = [
        { id: { contains: q, mode: 'insensitive' } },
        { user: { name: { contains: q, mode: 'insensitive' } } },
        { user: { email: { contains: q, mode: 'insensitive' } } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'total_desc': orderBy = { total: 'desc' }; break;
      case 'total_asc': orderBy = { total: 'asc' }; break;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: { select: { name: true, email: true } },
          _count: { select: { items: true } },
        },
      }),
      prisma.order.count({ where }),
    ]);

    // Status counts for filter badges
    const statusCounts = await prisma.order.groupBy({
      by: ['status'],
      _count: true,
    });

    return NextResponse.json({
      success: true,
      data: orders.map(order => ({
        id: order.id,
        customer: order.user?.name || order.user?.email || 'Guest',
        customerEmail: order.user?.email,
        total: order.total,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        itemCount: order._count.items,
        createdAt: order.createdAt,
      })),
      statusCounts: statusCounts.reduce((acc, sc) => {
        acc[sc.status] = sc._count;
        return acc;
      }, {} as Record<string, number>),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Orders API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
