const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
prisma.product.count().then(c => {
  console.log('Products:', c);
  return prisma.inventory.count();
}).then(c => {
  console.log('Inventory:', c);
  return prisma.order.count();
}).then(c => {
  console.log('Orders:', c);
  prisma.$disconnect();
}).catch(console.error);
