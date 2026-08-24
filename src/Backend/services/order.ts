import {
  OrderStatus,
  ShippingAddress,
  PaymentMethod,
  DeliveryMethod,
  CartItem,
  VALID_STATUS_TRANSITIONS,
} from '@/Shared/types';
import { prisma } from '@/Backend/database/prisma';
import { calculatePricingSummary } from '@/Backend/services/pricing';

export interface CreateOrderInput {
  items: CartItem[];
  customer: ShippingAddress;
  paymentMethod: PaymentMethod;
  deliveryMethod: DeliveryMethod;
}

export interface CreateOrderResult {
  success: boolean;
  order?: any;
  error?: {
    code: string;
    message: string;
  };
}

export async function createOrder(input: CreateOrderInput, userId: string): Promise<CreateOrderResult> {
  const { items, customer, paymentMethod, deliveryMethod } = input;

  if (!items || items.length === 0) {
    return { success: false, error: { code: 'EMPTY_CART', message: 'Cart is empty' } };
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      const orderItemsData = [];
      let subtotal = 0;

      for (const item of items) {
        // Fetch product and its inventory
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { 
            variants: true,
            inventory: {
              where: { variantId: item.variantId || undefined } // undefined searches for null variantId? No, Prisma uses null.
            }
          }
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        const inv = item.variantId 
          ? product.inventory.find(i => i.variantId === item.variantId)
          : product.inventory.find(i => i.variantId === null);

        if (!inv || inv.stockQuantity < item.quantity) {
          throw new Error(`Not enough stock for ${product.name}`);
        }

        // Deduct stock
        await tx.inventory.update({
          where: { id: inv.id },
          data: { 
            stockQuantity: { decrement: item.quantity },
            soldQuantity: { increment: item.quantity }
          }
        });

        // Create InventoryLog
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            variantId: item.variantId,
            type: 'SALE',
            quantityChange: -item.quantity,
            stockBefore: inv.stockQuantity,
            stockAfter: inv.stockQuantity - item.quantity,
            reason: 'Order placed by customer',
            createdBy: userId,
          }
        });

        const serverPrice = item.variantId
          ? product.variants.find(v => v.id === item.variantId)?.price ?? product.price
          : product.price;
          
        const variantName = item.variantId
          ? product.variants.find(v => v.id === item.variantId)?.name
          : undefined;

        orderItemsData.push({
          productId: product.id,
          variantId: item.variantId,
          name: product.name,
          thumbnail: product.thumbnail,
          imageUrl: product.imageUrl,
          imageAlt: product.imageAlt,
          imageSourceUrl: product.imageSourceUrl,
          variantName: variantName,
          quantity: item.quantity,
          unitPrice: serverPrice,
          total: serverPrice * item.quantity,
        });
      }

      // Calculate pricing
      const pricing = calculatePricingSummary(
        orderItemsData as any, 
        deliveryMethod
      );

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          userId,
          subtotal: pricing.subtotal,
          shippingFee: pricing.shippingFee,
          discount: pricing.discount,
          total: pricing.total,
          deliveryMethod,
          paymentMethod,
          paymentStatus: paymentMethod === 'MOCK_CARD' ? 'PAID' : 'PENDING',
          status: 'PENDING',
          shippingData: JSON.stringify(customer),
          items: {
            create: orderItemsData
          }
        },
        include: { items: true }
      });

      return newOrder;
    });

    return { success: true, order };
  } catch (error: any) {
    console.error('Order creation failed:', error);
    return { success: false, error: { code: 'ORDER_FAILED', message: error.message } };
  }
}
