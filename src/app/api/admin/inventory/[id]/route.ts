export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

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
    const { type, quantityChange, reason, newThreshold } = body;

    const inventory = await prisma.inventory.findUnique({ where: { id } });
    if (!inventory) {
      return NextResponse.json({ error: 'Inventory not found' }, { status: 404 });
    }

    // If only threshold update
    if (newThreshold !== undefined && type === undefined) {
      const updated = await prisma.inventory.update({
        where: { id },
        data: { lowStockThreshold: newThreshold }
      });
      return NextResponse.json({ success: true, data: updated });
    }

    if (!type || typeof quantityChange !== 'number') {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const stockBefore = inventory.stockQuantity;
    const stockAfter = stockBefore + quantityChange;

    if (stockAfter < 0) {
      return NextResponse.json({ error: 'Số lượng tồn không thể nhỏ hơn 0' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const updatedInv = await tx.inventory.update({
        where: { id },
        data: {
          stockQuantity: stockAfter
        }
      });

      await tx.inventoryLog.create({
        data: {
          productId: inventory.productId,
          variantId: inventory.variantId,
          type: type, // "IMPORT", "ADJUSTMENT", "RETURN"
          quantityChange: quantityChange,
          stockBefore,
          stockAfter,
          reason,
          createdBy: session.userId,
        }
      });

      return updatedInv;
    });

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('API Error /api/admin/inventory/[id]:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
