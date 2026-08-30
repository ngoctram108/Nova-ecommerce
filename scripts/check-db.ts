import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });

async function checkDb() {
  try {
    const productCount = await prisma.product.count();
    const categoryCount = await prisma.product.groupBy({ by: ['categorySlug'] }).then(res => res.length);
    const variantCount = await prisma.productVariant.count();
    const inventoryCount = await prisma.inventory.count();

    console.log('--- DATABASE STATS ---');
    console.log('Product count =', productCount);
    console.log('Category count =', categoryCount);
    console.log('Variant count =', variantCount);
    console.log('Inventory count =', inventoryCount);

    const sampleProducts = await prisma.product.findMany({ take: 5, select: { id: true, name: true, slug: true, categorySlug: true, price: true, featured: true, imageUrl: true, createdAt: true } });
    console.log('\n--- SAMPLE PRODUCTS ---');
    console.log(JSON.stringify(sampleProducts, null, 2));

  } catch (err) {
    console.error('DB Error:', err);
  } finally {
    await prisma.$disconnect();
  }
}
checkDb();
