const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const res = await fetch('http://localhost:3000/api/images/search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      productId: 'cmt451j1n00exnbngh3i56xnv',
      query: 'Set Đồ Ngủ Lụa Pijama Ligne Pure nu o-ngu',
      force: true
    })
  });
  const data = await res.json();
  console.log('POST Response:', res.status, data);
}

run().finally(() => prisma.$disconnect());
