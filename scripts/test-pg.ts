import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const products = await prisma.product.findMany();
  console.log(`Total products in Postgres: ${products.length}`);
  for (const p of products) {
    console.log(`- ${p.name}:`);
    console.log(`  imageUrl: ${p.imageUrl}`);
    console.log(`  thumbnail: ${p.thumbnail}`);
    console.log(`  images: ${p.images}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
