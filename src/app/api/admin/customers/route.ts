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
    const sort = searchParams.get('sort') || 'newest';

    const where: any = { role: 'CUSTOMER' };

    if (q) {
      where.OR = [
        { name: { contains: q, mode: 'insensitive' } },
        { email: { contains: q, mode: 'insensitive' } },
        { phone: { contains: q, mode: 'insensitive' } },
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    switch (sort) {
      case 'oldest': orderBy = { createdAt: 'asc' }; break;
      case 'name_asc': orderBy = { name: 'asc' }; break;
      case 'name_desc': orderBy = { name: 'desc' }; break;
    }

    const [customers, total] = await Promise.all([
      prisma.user.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          avatar: true,
          createdAt: true,
          _count: { select: { orders: true } },
          orders: {
            select: { total: true, status: true },
          },
        },
      }),
      prisma.user.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: customers.map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        phone: c.phone,
        avatar: c.avatar,
        orderCount: c._count.orders,
        totalSpent: c.orders
          .filter(o => o.status !== 'CANCELLED')
          .reduce((sum, o) => sum + o.total, 0),
        createdAt: c.createdAt,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Admin Customers API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
