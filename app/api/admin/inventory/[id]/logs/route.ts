import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/lib/auth/session';
import { prisma } from '@/lib/prisma';

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

    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    // Inventory Log is linked to variantId and productId.
    // If variantId is null (default variant), we fetch by productId and variantId = null.
    const logs = await prisma.inventoryLog.findMany({
      where: {
        productId: inventory.productId,
        variantId: inventory.variantId,
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Populate createdBy name if possible
    const userIds = Array.from(new Set(logs.map(l => l.createdBy).filter(Boolean))) as string[];
    const users = await prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, name: true, role: true }
    });
    
    const userMap = new Map(users.map(u => [u.id, u.name]));

    const enrichedLogs = logs.map(l => ({
      ...l,
      createdByName: l.createdBy ? userMap.get(l.createdBy) || l.createdBy : 'System',
    }));

    return NextResponse.json({ success: true, data: enrichedLogs });
  } catch (error) {
    console.error('API Error /api/admin/inventory/[id]/logs:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
