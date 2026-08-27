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

    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        variants: true,
        colors: true,
        sizes: true,
        inventory: { include: { variant: true } },
        _count: { select: { orderItems: true, reviews: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data: product });
  } catch (error) {
    console.error('Admin Product GET error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(
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

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const updateData: any = {};
    const allowedFields = [
      'name', 'slug', 'brand', 'description', 'price', 'compareAt',
      'categorySlug', 'subcategorySlug', 'thumbnail', 'imageUrl', 'imageAlt',
      'badge', 'featured', 'rating', 'reviewCount'
    ];

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    if (body.images !== undefined) {
      updateData.images = typeof body.images === 'string' ? body.images : JSON.stringify(body.images);
    }
    if (body.tags !== undefined) {
      updateData.tags = typeof body.tags === 'string' ? body.tags : JSON.stringify(body.tags);
    }
    if (body.specs !== undefined) {
      updateData.specs = typeof body.specs === 'string' ? body.specs : JSON.stringify(body.specs);
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ success: true, data: product });
  } catch (error: any) {
    console.error('Admin Product PUT error:', error);
    if (error.code === 'P2002') {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  props: { params: Promise<{ id: string }> }
) {
  try {
    const session = await verifySession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { id } = await props.params;

    const existing = await prisma.product.findUnique({
      where: { id },
      include: { _count: { select: { orderItems: true } } },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (existing._count.orderItems > 0) {
      return NextResponse.json(
        { error: 'Cannot delete product with existing orders. Consider archiving instead.' },
        { status: 400 }
      );
    }

    await prisma.product.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Admin Product DELETE error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
