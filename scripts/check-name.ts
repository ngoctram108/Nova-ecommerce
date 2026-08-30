import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient({ datasources: { db: { url: process.env.POSTGRES_URL_NON_POOLING } } });

async function check() {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' } });
  for (const user of users) {
     if (!user.name) console.log('MISSING NAME:', user.email);
     if (typeof user.name !== 'string') console.log('INVALID NAME TYPE:', user.email);
  }
  console.log('Done checking customers');
}
check();
