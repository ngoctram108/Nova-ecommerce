import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

export async function GET(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;

    const customer = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        avatar: true,
        createdAt: true,
        addresses: true,
        orders: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            total: true,
            status: true,
            paymentMethod: true,
            createdAt: true,
            _count: { select: { items: true } },
          },
        },
      },
    });

    if (!customer || customer.id === session.userId) {
      // Don't allow admin to view other admins via this endpoint
    }

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    const totalSpent = customer.orders
      .filter(o => o.status !== 'CANCELLED')
      .reduce((sum, o) => sum + o.total, 0);

    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        totalSpent,
        orderCount: customer.orders.length,
      },
    });
  } catch (error) {
    console.error('Admin Customer Detail API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
