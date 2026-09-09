import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { productId, orderItemId, rating, comment } = body;

    if (!productId || !orderItemId || rating === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 });
    }

    // Check if the order item belongs to the user and order is delivered
    const orderItem = await prisma.orderItem.findUnique({
      where: { id: orderItemId },
      include: { order: true },
    });

    if (!orderItem) {
      return NextResponse.json({ error: 'Order item not found' }, { status: 404 });
    }

    if (orderItem.order.userId !== session.userId) {
      return NextResponse.json({ error: 'Unauthorized order' }, { status: 403 });
    }

    if (orderItem.order.status !== 'DELIVERED') {
      return NextResponse.json({ error: 'Cannot review an item before delivery' }, { status: 403 });
    }

    if (orderItem.productId !== productId) {
      return NextResponse.json({ error: 'Product mismatch' }, { status: 400 });
    }

    // Check if the review already exists
    const existingReview = await prisma.review.findUnique({
      where: {
        userId_orderItemId: {
          userId: session.userId,
          orderItemId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 409 });
    }

    // Run within a transaction to ensure product rating stats are consistent
    const result = await prisma.$transaction(async (tx) => {
      const review = await tx.review.create({
        data: {
          userId: session.userId,
          productId,
          orderId: orderItem.orderId,
          orderItemId,
          rating,
          comment: comment || '',
          verified: true, // Auto verified because it comes from a completed order
        },
      });

      // Update product rating and review count
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
        data: {
          rating: averageRating,
          reviewCount: totalReviews,
        },
      });

      return review;
    });

    revalidatePath(`/product/${productId}`);

    return NextResponse.json(result, { status: 201 });
  } catch (error: any) {
    console.error('Error creating review:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'You have already reviewed this item' }, { status: 409 });
    }
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
