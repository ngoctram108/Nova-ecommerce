const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCounts() {
  try {
    const users = await prisma.user.count();
    const customers = await prisma.user.count({ where: { role: 'CUSTOMER' } });
    const admins = await prisma.user.count({ where: { role: 'ADMIN' } });
    const products = await prisma.product.count();
    const variants = await prisma.productVariant.count();
    const inventory = await prisma.inventory.count();
    const orders = await prisma.order.count();
    const orderItems = await prisma.orderItem.count();

    console.log('--- DATABASE COUNTS ---');
    console.log(`Users: ${users} (Customers: ${customers}, Admins: ${admins})`);
    console.log(`Products: ${products}`);
    console.log(`Variants: ${variants}`);
    console.log(`Inventory: ${inventory}`);
    console.log(`Orders: ${orders}`);
    console.log(`OrderItems: ${orderItems}`);
    
    // Check an admin user
    const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' }, select: { id: true, email: true, role: true } });
    console.log('--- ADMIN CHECK ---');
    console.log(adminUser);

  } catch (error) {
    console.error('Error connecting to database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkCounts();
