import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getCachedImage, setCachedImage, CachedImage } from '@/Backend/services/image-cache';
import { searchProductImage, validateAndExtractImage } from '@/Backend/services/image-search';
import { prisma } from '@/Backend/database/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { productId, query, force } = body;

    if (!productId || !query) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or query' },
        { status: 400 }
      );
    }

    if (!force) {
      const cached = await getCachedImage(productId);
      if (cached) {
        return NextResponse.json({ success: true, data: cached });
      }
    }

    // Fetch new image
    const searchResult = await searchProductImage(query);
    
    if (!searchResult) {
      return NextResponse.json(
        { success: false, error: 'Không tìm được ảnh hợp lệ' },
        { status: 404 }
      );
    }
    
    const newImage: CachedImage = {
      ...searchResult,
      timestamp: Date.now(),
    };

    // Save to cache
    await setCachedImage(productId, newImage);
    
    // Update Prisma
    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: newImage.imageUrl,
        imageAlt: newImage.imageAlt,
        imageSourceUrl: newImage.imageSourceUrl,
      }
    });

    revalidatePath('/products');
    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true, data: newImage });

  } catch (error) {
    console.error('API Error /api/images/search:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process image search' },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { productId, imageUrl, imageAlt, imageSourceUrl } = body;

    if (!productId || !imageUrl) {
      return NextResponse.json(
        { success: false, error: 'Missing productId or imageUrl' },
        { status: 400 }
      );
    }

    // Validate the image URL manually
    const validUrl = await validateAndExtractImage(imageUrl);

    if (!validUrl) {
      return NextResponse.json(
        { success: false, error: 'URL không hợp lệ hoặc không phải là file ảnh (cần hỗ trợ định dạng ảnh).' },
        { status: 400 }
      );
    }

    const newImage: CachedImage = {
      imageUrl: validUrl,
      imageAlt: imageAlt || 'Custom Image',
      imageSourceUrl: imageSourceUrl || imageUrl,
      timestamp: Date.now(),
    };

    // Save to cache
    await setCachedImage(productId, newImage);
    
    // Update Prisma
    await prisma.product.update({
      where: { id: productId },
      data: {
        imageUrl: newImage.imageUrl,
        imageAlt: newImage.imageAlt,
        imageSourceUrl: newImage.imageSourceUrl,
      }
    });

    revalidatePath('/products');
    revalidatePath(`/product/${productId}`);

    return NextResponse.json({ success: true, data: newImage });
  } catch (error) {
    console.error('API Error /api/images/search PUT:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update image' },
      { status: 500 }
    );
  }
}
