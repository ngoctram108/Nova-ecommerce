import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';

// GET — List all reviews (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await verifySession();
    if (!session?.userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({ where: { id: session.userId }, select: { role: true } });
    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const rating = searchParams.get('rating');

    const where: any = {};
    if (rating) {
      where.rating = parseInt(rating);
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { name: true, thumbnail: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.review.count({ where }),
    ]);

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        verified: r.verified,
        createdAt: r.createdAt.toISOString(),
        customerName: r.user.name,
        customerEmail: r.user.email,
        productName: r.product.name,
        productThumbnail: r.product.thumbnail,
        productId: r.productId,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching admin reviews:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
