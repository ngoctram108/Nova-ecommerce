import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';
import { revalidatePath } from 'next/cache';

// DELETE — Admin delete any review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id } = await params;

    const review = await prisma.review.findUnique({ where: { id } });
    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    const productId = review.productId;

    // Delete and recalculate in transaction
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });

      const productReviews = await tx.review.findMany({
        where: { productId },
        select: { rating: true },
      });

      const totalReviews = productReviews.length;
      const averageRating = totalReviews > 0
        ? productReviews.reduce((acc, curr) => acc + curr.rating, 0) / totalReviews
        : 0;

      await tx.product.update({
        where: { id: productId },
        data: { rating: averageRating, reviewCount: totalReviews },
      });
    });

    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting review (admin):', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
