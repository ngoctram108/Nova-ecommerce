/**
 * Data Fix Script: Create missing Default Variant for existing products
 * that have Inventory with variantId = null.
 * 
 * This fixes the "Test" product (cmtyev9pe0000k204q95ud9p5) which was
 * created before the fix and has Inventory without a linked variant.
 * 
 * SAFE: Does NOT delete, reset, or modify any existing data.
 * Only ADDS missing variant records and UPDATES FK links.
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Find all inventory records with variantId = null
  const orphanInventory = await prisma.inventory.findMany({
    where: { variantId: null },
    include: { 
      product: { select: { id: true, name: true, slug: true } } 
    },
  });

  if (orphanInventory.length === 0) {
    console.log('✅ No orphan inventory records found. Nothing to fix.');
    return;
  }

  console.log(`Found ${orphanInventory.length} inventory record(s) with variantId = null:`);
  
  for (const inv of orphanInventory) {
    console.log(`\n--- Fixing: "${inv.product.name}" (Product: ${inv.product.id}) ---`);
    console.log(`  Inventory ID: ${inv.id}, stock: ${inv.stockQuantity}`);
    
    const defaultSku = `${inv.product.slug.toUpperCase()}-DEFAULT`;
    
    // Check if a variant with this SKU already exists
    const existingVariant = await prisma.productVariant.findUnique({
      where: { sku: defaultSku },
    });
    
    if (existingVariant) {
      console.log(`  ⚠️ Variant with SKU "${defaultSku}" already exists (${existingVariant.id}). Linking inventory to it.`);
      await prisma.inventory.update({
        where: { id: inv.id },
        data: { variantId: existingVariant.id },
      });
      console.log(`  ✅ Updated inventory ${inv.id} → variantId = ${existingVariant.id}`);
    } else {
      // Create default variant and link
      const result = await prisma.$transaction(async (tx) => {
        const newVariant = await tx.productVariant.create({
          data: {
            productId: inv.product.id,
            name: 'Default',
            sku: defaultSku,
            price: null,
            attributes: JSON.stringify({}),
          },
        });
        
        const updatedInv = await tx.inventory.update({
          where: { id: inv.id },
          data: { variantId: newVariant.id },
        });
        
        return { newVariant, updatedInv };
      });
      
      console.log(`  ✅ Created Default Variant: ${result.newVariant.id} (SKU: ${defaultSku})`);
      console.log(`  ✅ Updated inventory ${inv.id} → variantId = ${result.newVariant.id}`);
    }
  }

  // Verify
  console.log('\n=== VERIFICATION ===');
  const remaining = await prisma.inventory.count({ where: { variantId: null } });
  console.log(`Remaining inventory records with variantId = null: ${remaining}`);
  if (remaining === 0) {
    console.log('✅ All inventory records now have a linked variant.');
  } else {
    console.log('❌ Some inventory records still have no variant!');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
