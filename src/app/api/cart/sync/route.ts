import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/Backend/auth/session';
import { prisma } from '@/Backend/database/prisma';
import { CartItem } from '@/Shared/types';

export async function POST(request: NextRequest) {
  try {
    const session = await verifySession();
    const body = await request.json();
    const localItems: CartItem[] = body.items || [];

    // Filter and validate items against DB
    const validItems: CartItem[] = [];
    const removedItems: string[] = [];
    
    // We fetch all products at once or one by one. One by one is fine for small carts
    for (const item of localItems) {
      if (!item.productId) continue;
      
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        include: {
          variants: true,
          inventory: true
        }
      });
      
      if (!product) {
        removedItems.push(item.name || item.productId);
        continue;
      }
      
      let variant = null;
      let inventory = null;
      
      if (item.variantId) {
        variant = product.variants.find(v => v.id === item.variantId);
        if (!variant) {
          removedItems.push(`${item.name} (${item.variant})`);
          continue;
        }
        inventory = product.inventory.find(i => i.variantId === item.variantId);
      } else {
        inventory = product.inventory.find(i => i.variantId === null);
      }
      
      // If product exists but no inventory record, we assume it's out of stock or valid with 0 stock
      const maxStock = inventory ? inventory.stockQuantity : 0;
      
      if (maxStock <= 0) {
        removedItems.push(`${item.name} ${item.variant ? `(${item.variant})` : ''} (Hết hàng)`);
        continue;
      }
      
      const price = variant?.price ?? product.price;
      const quantity = Math.min(item.quantity, maxStock);
      
      validItems.push({
        productId: product.id,
        variantId: variant?.id,
        name: product.name,
        price,
        quantity,
        thumbnail: product.thumbnail,
        imageUrl: product.imageUrl || undefined,
        imageAlt: product.imageAlt || undefined,
        imageSourceUrl: product.imageSourceUrl || undefined,
        variant: variant?.name,
        maxStock
      });
    }

    // If user is logged in, sync with database Cart
    if (session?.userId) {
      const userCart = await prisma.cart.findUnique({
        where: { userId: session.userId },
        include: { items: true }
      });
      
      if (userCart) {
        // We will just overwrite the DB cart with the local valid items
        // First delete old items
        await prisma.cartItem.deleteMany({
          where: { cartId: userCart.id }
        });
        
        // Then create new items
        if (validItems.length > 0) {
          await prisma.cartItem.createMany({
            data: validItems.map(item => ({
              cartId: userCart.id,
              productId: item.productId,
              variantId: item.variantId,
              quantity: item.quantity
            }))
          });
        }
      } else {
        // Create new cart for user
        await prisma.cart.create({
          data: {
            userId: session.userId,
            items: {
              create: validItems.map(item => ({
                productId: item.productId,
                variantId: item.variantId,
                quantity: item.quantity
              }))
            }
          }
        });
      }
    }

    return NextResponse.json({
      success: true,
      items: validItems,
      removedItems
    });

  } catch (error) {
    console.error('Cart Sync Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
