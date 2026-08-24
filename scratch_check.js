const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
  const p = await prisma.product.findFirst({ where: { name: { contains: 'Pijama' } } });
  console.log(p);
  const cache = await prisma.$queryRaw`SELECT * FROM ImageCache WHERE productId = ${p.id}`.catch(e => console.log('No ImageCache table?'));
}
run().catch(console.error).finally(()=>prisma.$disconnect());
