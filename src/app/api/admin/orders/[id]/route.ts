export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

const VALID_TRANSITIONS: Record<string, string[]> = {
  'PENDING': ['CONFIRMED', 'CANCELLED'],
  'CONFIRMED': ['PROCESSING', 'CANCELLED'],
  'PROCESSING': ['SHIPPING', 'CANCELLED'],
  'SHIPPING': ['DELIVERED'],
  'DELIVERED': [],
  'CANCELLED': []
};

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

    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { select: { imageUrl: true } } } },
        user: { select: { name: true, email: true, phone: true } },
        statusHistory: { orderBy: { createdAt: 'desc' } },
      },
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error('Admin Order GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}


export async function PATCH(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;
    const body = await request.json();
    const { status, note } = body;

    if (!status || typeof status !== 'string') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({ where: { id } });
    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const currentStatus = order.status;
    
    if (currentStatus === status) {
      return NextResponse.json({ success: true, data: order });
    }

    const allowedNext = VALID_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(status)) {
      return NextResponse.json(
        { error: `Không thể chuyển trạng thái từ ${currentStatus} sang ${status}` },
        { status: 400 }
      );
    }

    // Determine payment status update if needed
    let paymentStatus = order.paymentStatus;
    if ((status === 'CONFIRMED' || status === 'DELIVERED') && order.paymentMethod !== 'COD') {
      paymentStatus = 'PAID';
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id },
        data: {
          status,
          paymentStatus,
        }
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: id,
          oldStatus: currentStatus,
          newStatus: status,
          changedBy: session.userId,
          note: note || '',
        }
      });

      return updatedOrder;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error /api/admin/orders/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
