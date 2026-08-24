const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const res = await fetch('http://localhost:3000/api/images/search', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'cmt451j1n00exnbngh3i56xnv',
      imageUrl: 'https://picsum.photos/800/800'
    })
  });
  const data = await res.json();
  console.log('PUT Response:', res.status, data);
  
  const updatedProduct = await prisma.product.findUnique({ where: { id: 'cmt451j1n00exnbngh3i56xnv' } });
  console.log('Updated in Prisma:', updatedProduct.imageUrl);
}

run().finally(() => prisma.$disconnect());
