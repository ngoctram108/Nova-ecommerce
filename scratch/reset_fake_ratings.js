/**
 * One-time script: Reset fake seeded rating/reviewCount in Product table
 * to match actual Review table data.
 * 
 * For products WITH reviews: computes live AVG + COUNT from Review table.
 * For products WITHOUT reviews: sets rating=0, reviewCount=0.
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Resetting fake ratings to match actual Review data...\n');

  const products = await prisma.product.findMany({
    select: { id: true, name: true, rating: true, reviewCount: true }
  });

  let fixed = 0;
  let alreadyCorrect = 0;

  for (const p of products) {
    const agg = await prisma.review.aggregate({
      where: { productId: p.id },
      _avg: { rating: true },
      _count: true,
    });

    const actualRating = agg._avg.rating ? Math.round(agg._avg.rating * 10) / 10 : 0;
    const actualCount = agg._count;

    if (p.rating !== actualRating || p.reviewCount !== actualCount) {
      await prisma.product.update({
        where: { id: p.id },
        data: {
          rating: actualRating,
          reviewCount: actualCount,
        }
      });
      console.log(`FIXED: ${p.name} | ${p.rating}/${p.reviewCount} -> ${actualRating}/${actualCount}`);
      fixed++;
    } else {
      alreadyCorrect++;
    }
  }

  console.log(`\nDone. Fixed: ${fixed}, Already correct: ${alreadyCorrect}, Total: ${products.length}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
