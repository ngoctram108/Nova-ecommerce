const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.product.findFirst({ 
  select: { id: true, name: true, nameVi: true, nameEn: true, descriptionVi: true, descriptionEn: true } 
}).then(r => { 
  console.log(JSON.stringify(r, null, 2)); 
  return p.$disconnect(); 
});
