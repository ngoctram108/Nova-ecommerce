import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';
import { revalidatePath } from 'next/cache';

// Helper: recalculate product rating after review change
async function recalculateProductRating(tx: any, productId: string) {
  const productReviews = await tx.review.findMany({
    where: { productId },
    select: { rating: true },
  });

  const totalReviews = productReviews.length;
  const averageRating = totalReviews > 0
    ? productReviews.reduce((acc: number, curr: any) => acc + curr.rating, 0) / totalReviews
    : 0;

  await tx.product.update({
    where: { id: productId },
    data: {
      rating: averageRating,
      reviewCount: totalReviews,
    },
  });
}

// PATCH — Edit own review (rating + comment only)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { rating, comment } = body;

    if (rating !== undefined && (rating < 1 || rating > 5)) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    if (review.userId !== session.userId) {
      return NextResponse.json({ error: 'You can only edit your own reviews' }, { status: 403 });
    }

    // Update in transaction to keep product stats consistent
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.review.update({
        where: { id },
        data: {
          ...(rating !== undefined && { rating }),
          ...(comment !== undefined && { comment }),
        },
      });

      await recalculateProductRating(tx, review.productId);

      return updated;
    });

    revalidatePath(`/product/${review.productId}`);

    return NextResponse.json(result);
  } catch (error: any) {
    console.error('Error updating review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// DELETE — Delete own review
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Find the review and verify ownership
    const review = await prisma.review.findUnique({ where: { id } });

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 });
    }

    // Allow owner OR admin to delete
    if (review.userId !== session.userId) {
      const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
      if (user?.role !== 'ADMIN') {
        return NextResponse.json({ error: 'You can only delete your own reviews' }, { status: 403 });
      }
    }

    // Delete in transaction to keep product stats consistent
    await prisma.$transaction(async (tx) => {
      await tx.review.delete({ where: { id } });
      await recalculateProductRating(tx, review.productId);
    });

    revalidatePath(`/product/${review.productId}`);

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error deleting review:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
