const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Updating database branding...');
  
  // Update Products where brand contains NORDLY
  const products = await prisma.product.findMany({
    where: { brand: { contains: 'NORDLY' } }
  });
  
  for (const p of products) {
    await prisma.product.update({
      where: { id: p.id },
      data: { brand: p.brand.replace(/NORDLY/g, 'NORA') }
    });
  }
  
  // Update users
  const admin = await prisma.user.findFirst({
    where: { email: 'admin@nordly.com' }
  });
  if (admin) {
    await prisma.user.update({
      where: { id: admin.id },
      data: { email: 'admin@nora.com', name: 'Admin Nora' }
    });
  }
  
  const customer = await prisma.user.findFirst({
    where: { email: 'customer@nordly.com' }
  });
  if (customer) {
    await prisma.user.update({
      where: { id: customer.id },
      data: { email: 'customer@nora.com' }
    });
  }

  console.log('Database updated successfully.');
}

main()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
