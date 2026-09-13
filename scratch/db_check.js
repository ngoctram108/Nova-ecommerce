const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // 1. Get all products ordered by creation date
  const products = await prisma.product.findMany({
    orderBy: { createdAt: 'asc' },
    select: { id: true, name: true, slug: true, createdAt: true },
  });
  
  console.log('=== ALL PRODUCTS ===');
  products.forEach((p, i) => {
    console.log(`${i+1}. [${p.id}] ${p.name} | slug: ${p.slug} | created: ${p.createdAt.toISOString()}`);
  });

  // 2. Pick oldest product (should work) and newest product (likely broken)
  const oldProduct = products[0];
  const newProduct = products[products.length - 1];
  
  console.log('\n=== OLD PRODUCT (should work) ===');
  console.log('Product:', oldProduct);
  
  // Get variants for old product
  const oldVariants = await prisma.productVariant.findMany({
    where: { productId: oldProduct.id },
    select: { id: true, name: true, sku: true, productId: true },
  });
  console.log('Variants:', JSON.stringify(oldVariants, null, 2));
  
  // Get inventory for old product
  const oldInventory = await prisma.inventory.findMany({
    where: { productId: oldProduct.id },
    select: { id: true, productId: true, variantId: true, stockQuantity: true, soldQuantity: true, lowStockThreshold: true },
  });
  console.log('Inventory:', JSON.stringify(oldInventory, null, 2));
  
  // Get inventory logs for old product
  const oldLogs = await prisma.inventoryLog.findMany({
    where: { productId: oldProduct.id },
    select: { id: true, productId: true, variantId: true, type: true, quantityChange: true, stockBefore: true, stockAfter: true, reason: true, createdAt: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  console.log('InventoryLogs:', JSON.stringify(oldLogs, null, 2));
  
  console.log('\n=== NEW PRODUCT (likely broken) ===');
  console.log('Product:', newProduct);
  
  // Get variants for new product
  const newVariants = await prisma.productVariant.findMany({
    where: { productId: newProduct.id },
    select: { id: true, name: true, sku: true, productId: true },
  });
  console.log('Variants:', JSON.stringify(newVariants, null, 2));
  
  // Get inventory for new product
  const newInventory = await prisma.inventory.findMany({
    where: { productId: newProduct.id },
    select: { id: true, productId: true, variantId: true, stockQuantity: true, soldQuantity: true, lowStockThreshold: true },
  });
  console.log('Inventory:', JSON.stringify(newInventory, null, 2));
  
  // Get inventory logs for new product
  const newLogs = await prisma.inventoryLog.findMany({
    where: { productId: newProduct.id },
    select: { id: true, productId: true, variantId: true, type: true, quantityChange: true, stockBefore: true, stockAfter: true, reason: true, createdAt: true },
    take: 5,
    orderBy: { createdAt: 'desc' },
  });
  console.log('InventoryLogs:', JSON.stringify(newLogs, null, 2));
  
  // 3. Diagnostic: Find ALL products that have Inventory WITHOUT a variant link
  console.log('\n=== DIAGNOSTIC: Products with inventory but NO variantId ===');
  const inventoryNoVariant = await prisma.inventory.findMany({
    where: { variantId: null },
    include: { product: { select: { name: true } } },
  });
  console.log(`Found ${inventoryNoVariant.length} inventory records with variantId = null:`);
  inventoryNoVariant.forEach(inv => {
    console.log(`  - Inventory [${inv.id}] -> Product "${inv.product.name}" | stock: ${inv.stockQuantity}`);
  });
  
  // 4. Diagnostic: Find ALL products that have variants BUT no matching inventory
  console.log('\n=== DIAGNOSTIC: Variants WITHOUT matching inventory ===');
  const allVariants = await prisma.productVariant.findMany({
    include: { 
      inventory: true,
      product: { select: { name: true } }
    },
  });
  const orphanVariants = allVariants.filter(v => !v.inventory);
  console.log(`Found ${orphanVariants.length} variants without inventory:`);
  orphanVariants.forEach(v => {
    console.log(`  - Variant [${v.id}] "${v.name}" SKU:${v.sku} -> Product "${v.product.name}" | NO INVENTORY`);
  });
  
  // 5. All products with their counts
  console.log('\n=== PRODUCT vs VARIANT vs INVENTORY COMPARISON ===');
  for (const p of products) {
    const vc = await prisma.productVariant.count({ where: { productId: p.id } });
    const ic = await prisma.inventory.count({ where: { productId: p.id } });
    const lc = await prisma.inventoryLog.count({ where: { productId: p.id } });
    const mismatch = (vc > 0 && ic < vc) || (vc === 0 && ic === 0);
    console.log(`${mismatch ? 'MISMATCH' : 'OK'} [${p.id}] ${p.name} | Variants: ${vc} | Inventory: ${ic} | Logs: ${lc}`);
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
