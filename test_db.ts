import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const pCount = await prisma.product.count();
    console.log('Product count:', pCount);

    const rCount = await prisma.review.count();
    console.log('Review count:', rCount);

    const oCount = await prisma.order.count();
    console.log('Order count:', oCount);

    const uCount = await prisma.user.count();
    console.log('User count:', uCount);

    const specificProduct = await prisma.product.findUnique({
      where: { id: 'cmt8g1kzt00obnbmok3gbg0t2' }
    });
    console.log('Specific Product exists:', !!specificProduct);
  } catch (e) {
    console.error('Error:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
