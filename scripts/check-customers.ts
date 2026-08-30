import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });
async function check() {
  const users = await prisma.user.findMany({
    where: { role: 'CUSTOMER' },
    include: {
        _count: { select: { orders: true } },
        orders: { select: { total: true, status: true } }
    }
  });
  console.log(JSON.stringify(users, null, 2));
}
check();
