const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Check product rating/reviewCount stored in Product table
  const product = await prisma.product.findUnique({
    where: { id: 'cmt8g1t7r00v2nbmorrsknwby' },
    select: { id: true, name: true, rating: true, reviewCount: true }
  });
  console.log('=== PRODUCT TABLE ===');
  console.log(JSON.stringify(product, null, 2));

  // 2. Count actual reviews in Review table
  const reviewCount = await prisma.review.count({
    where: { productId: 'cmt8g1t7r00v2nbmorrsknwby' }
  });
  console.log('\n=== ACTUAL REVIEW COUNT ===');
  console.log(reviewCount);

  // 3. List actual reviews
  const reviews = await prisma.review.findMany({
    where: { productId: 'cmt8g1t7r00v2nbmorrsknwby' },
    include: { user: { select: { name: true } } }
  });
  console.log('\n=== REVIEWS ===');
  console.log(JSON.stringify(reviews, null, 2));

  // 4. Aggregate
  const agg = await prisma.review.aggregate({
    where: { productId: 'cmt8g1t7r00v2nbmorrsknwby' },
    _avg: { rating: true },
    _count: true
  });
  console.log('\n=== AGGREGATE ===');
  console.log(JSON.stringify(agg, null, 2));

  // 5. Check a few more products for consistency
  console.log('\n=== SAMPLE PRODUCTS CONSISTENCY CHECK ===');
  const products = await prisma.product.findMany({
    take: 10,
    select: { id: true, name: true, rating: true, reviewCount: true }
  });
  
  for (const p of products) {
    const actualCount = await prisma.review.count({ where: { productId: p.id } });
    const actualAvg = await prisma.review.aggregate({
      where: { productId: p.id },
      _avg: { rating: true }
    });
    const match = p.reviewCount === actualCount ? 'OK' : 'MISMATCH';
    console.log(`${match} | ${p.name} | stored: rating=${p.rating} count=${p.reviewCount} | actual: count=${actualCount} avg=${actualAvg._avg.rating}`);
  }

  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
