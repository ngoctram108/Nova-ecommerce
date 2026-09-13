const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Get all distinct categorySlug values with counts
  const categories = await prisma.product.groupBy({
    by: ['categorySlug'],
    _count: { id: true },
    orderBy: { categorySlug: 'asc' },
  });
  
  console.log('=== ALL categorySlug VALUES IN DATABASE ===');
  categories.forEach(c => {
    console.log(`  "${c.categorySlug}" → ${c._count.id} products`);
  });

  // 2. Get all distinct subcategorySlug values
  const subcategories = await prisma.product.groupBy({
    by: ['subcategorySlug'],
    _count: { id: true },
    orderBy: { subcategorySlug: 'asc' },
  });
  
  console.log('\n=== ALL subcategorySlug VALUES ===');
  subcategories.forEach(s => {
    console.log(`  "${s.subcategorySlug}" → ${s._count.id} products`);
  });

  // 3. Show products with potentially problematic categories
  console.log('\n=== PRODUCTS BY CATEGORY ===');
  for (const cat of categories) {
    const products = await prisma.product.findMany({
      where: { categorySlug: cat.categorySlug },
      select: { id: true, name: true, categorySlug: true, subcategorySlug: true },
      take: 5,
    });
    console.log(`\nCategory "${cat.categorySlug}" (${cat._count.id} total):`);
    products.forEach(p => {
      console.log(`  [${p.id}] ${p.name} | sub: ${p.subcategorySlug}`);
    });
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
