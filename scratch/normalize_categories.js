const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== STARTING NORMALIZATION ===');

  // Update men -> nam
  const updateMen = await prisma.product.updateMany({
    where: { categorySlug: 'men' },
    data: { categorySlug: 'nam' },
  });
  console.log(`Updated ${updateMen.count} products from 'men' to 'nam'`);

  // Update women -> nu
  const updateWomen = await prisma.product.updateMany({
    where: { categorySlug: 'women' },
    data: { categorySlug: 'nu' },
  });
  console.log(`Updated ${updateWomen.count} products from 'women' to 'nu'`);

  // Update NAM -> nam (if any)
  const updateNAM = await prisma.product.updateMany({
    where: { categorySlug: 'NAM' },
    data: { categorySlug: 'nam' },
  });
  console.log(`Updated ${updateNAM.count} products from 'NAM' to 'nam'`);

  // Update NU -> nu (if any)
  const updateNU = await prisma.product.updateMany({
    where: { categorySlug: 'NU' },
    data: { categorySlug: 'nu' },
  });
  console.log(`Updated ${updateNU.count} products from 'NU' to 'nu'`);

  console.log('=== NORMALIZATION COMPLETE ===');
  
  // Verify
  const categories = await prisma.product.groupBy({
    by: ['categorySlug'],
    _count: { id: true },
    orderBy: { categorySlug: 'asc' },
  });
  
  console.log('\n=== CURRENT categorySlug VALUES IN DATABASE ===');
  categories.forEach(c => {
    console.log(`  "${c.categorySlug}" → ${c._count.id} products`);
  });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
