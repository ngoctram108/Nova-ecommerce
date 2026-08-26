import { NextResponse } from 'next/server';
import { prisma } from '@/Backend/database/prisma';

export async function GET() {
  const results: Record<string, any> = {
    env_db_url: process.env.POSTGRES_URL_NON_POOLING ? 'SET (hidden)' : 'NOT SET',
    env_db_url_pooling: process.env.POSTGRES_URL ? 'SET (hidden)' : 'NOT SET',
    node_env: process.env.NODE_ENV,
  };

  try {
    // Test raw connection
    const rawResult = await prisma.$queryRaw`SELECT 1 as test`;
    results.connection = 'OK';
    results.rawQuery = rawResult;
  } catch (err: any) {
    results.connection = 'FAILED';
    results.connectionError = err.message;
    return NextResponse.json(results, { status: 500 });
  }

  try {
    const userCount = await prisma.user.count();
    results.userCount = userCount;
  } catch (err: any) {
    results.userCountError = err.message;
  }

  try {
    const productCount = await prisma.product.count();
    results.productCount = productCount;
  } catch (err: any) {
    results.productCountError = err.message;
  }

  try {
    const orderCount = await prisma.order.count();
    results.orderCount = orderCount;
  } catch (err: any) {
    results.orderCountError = err.message;
  }

  try {
    const inventoryCount = await prisma.inventory.count();
    results.inventoryCount = inventoryCount;
  } catch (err: any) {
    results.inventoryCountError = err.message;
  }

  return NextResponse.json(results);
}
