import { PrismaClient } from '@prisma/client';
import { products } from '../src/Backend/database/data/products';
import { slugify } from '../src/Shared/utils';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Hash password function
const hashPassword = (password: string) => {
  return bcrypt.hashSync(password, 10);
};

async function main() {
  console.log('Seeding database...');

  // 1. Create Default Users
  const adminPassword = hashPassword('admin123456');
  const customerPassword = hashPassword('123456');

  const admin = await prisma.user.upsert({
    where: { email: 'admin@nora.com' },
    update: {
      password: adminPassword,
    },
    create: {
      email: 'admin@nora.com',
      name: 'Admin',
      password: adminPassword,
      role: 'ADMIN',
    },
  });
  console.log(`Created admin: ${admin.email}`);

  const customer = await prisma.user.upsert({
    where: { email: 'customer@nora.com' },
    update: {
      password: customerPassword,
    },
    create: {
      email: 'customer@nora.com',
      name: 'Customer',
      password: customerPassword,
      role: 'CUSTOMER',
    },
  });

  console.log(`Created customer: ${customer.email}`);

  // 2. Create Products
  for (const p of products) {
    console.log(`Seeding product: ${p.name}`);

    // Create the product
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        brand: p.brand || 'NORA',
        description: p.description,
        price: p.price,
        compareAt: p.compareAt,
        currency: p.currency || 'VND',
        rating: p.rating || 0,
        reviewCount: p.reviewCount || 0,
        thumbnail: p.thumbnail,
        images: JSON.stringify(p.images),
        badge: p.badge,
        featured: p.featured || false,
        categorySlug: p.categorySlug || slugify(p.category || ''),
        subcategorySlug: p.subcategorySlug,
        tags: p.tags ? JSON.stringify(p.tags) : null,
        specs: p.specs ? JSON.stringify(p.specs) : null,
        
        imageUrl: p.imageUrl,
        imageAlt: p.imageAlt,
        imageSourceUrl: p.imageSourceUrl,
      },
    });

    // Create Colors
    if (p.colors && p.colors.length > 0) {
      for (const color of p.colors) {
        await prisma.productColor.create({
          data: {
            productId: product.id,
            name: color.name,
            hex: color.hex,
          }
        });
      }
    }

    // Create Sizes
    if (p.sizes && p.sizes.length > 0) {
      for (const size of p.sizes) {
        await prisma.productSize.create({
          data: {
            productId: product.id,
            name: size,
          }
        });
      }
    }

    // Create Variants and Inventory
    if (p.colors && p.colors.length > 0 && p.sizes && p.sizes.length > 0) {
      for (const color of p.colors) {
        for (const size of p.sizes) {
          const variant = await prisma.productVariant.create({
            data: {
              productId: product.id,
              name: `${color.name} / ${size}`,
              sku: `${p.id}-${color.name.toUpperCase()}-${size.toUpperCase()}`.replace(/\s+/g, ''),
              attributes: JSON.stringify({ color: color.name, size: size }),
              price: p.price,
            }
          });

          // Some variants are out of stock, some low stock to test
          let stockQuantity = p.stock || 50;
          if (product.name.includes('Pijama') && color.name === 'Beige' && size === 'L') stockQuantity = 0;
          else if (product.name.includes('Pijama') && color.name === 'Beige' && size === 'M') stockQuantity = 7;
          else if (product.name.includes('Pijama') && color.name === 'Beige' && size === 'S') stockQuantity = 10;
          else if (product.name.includes('Pijama') && color.name === 'Black' && size === 'S') stockQuantity = 5;

          const inv = await prisma.inventory.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              stockQuantity: stockQuantity,
              lowStockThreshold: 5,
            }
          });

          await prisma.inventoryLog.create({
            data: {
              productId: product.id,
              variantId: variant.id,
              type: 'IMPORT',
              quantityChange: stockQuantity,
              stockBefore: 0,
              stockAfter: stockQuantity,
              reason: 'Initial seed import',
              createdBy: admin.id,
            }
          });
        }
      }
    } else {
      // Create a default Variant and Inventory
      const variant = await prisma.productVariant.create({
        data: {
          productId: product.id,
          name: 'Default',
          sku: `${p.id}-DEFAULT`,
          attributes: JSON.stringify({}),
          price: p.price,
        }
      });

      const stockQuantity = p.stock || 50;

      await prisma.inventory.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          stockQuantity: stockQuantity,
          lowStockThreshold: 5,
        }
      });

      await prisma.inventoryLog.create({
        data: {
          productId: product.id,
          variantId: variant.id,
          type: 'IMPORT',
          quantityChange: stockQuantity,
          stockBefore: 0,
          stockAfter: stockQuantity,
          reason: 'Initial seed import',
          createdBy: admin.id,
        }
      });
    }
  }

  // 3. Create Sample Orders
  console.log('Seeding sample orders...');
  const allProducts = await prisma.product.findMany({
    include: { variants: true }
  });

  const pijamaProduct = allProducts.find(p => p.name.includes('Pijama'));
  
  if (pijamaProduct && pijamaProduct.variants.length > 0) {
    const variantBeigeS = pijamaProduct.variants.find(v => v.name === 'Beige / S');
    const variantBlackS = pijamaProduct.variants.find(v => v.name === 'Black / S');
    
    if (variantBeigeS && variantBlackS) {
      const order = await prisma.order.create({
        data: {
          userId: customer.id,
          subtotal: variantBeigeS.price! * 2 + variantBlackS.price! * 1,
          shippingFee: 0,
          discount: 0,
          total: variantBeigeS.price! * 2 + variantBlackS.price! * 1,
          deliveryMethod: 'STANDARD',
          paymentMethod: 'COD',
          paymentStatus: 'PENDING',
          status: 'CONFIRMED',
          shippingData: JSON.stringify({
            fullName: 'Customer Test',
            phone: '0123456789',
            email: 'customer@nora.com',
            address: '123 Test St',
            city: 'HCM',
          }),
          items: {
            create: [
              {
                productId: pijamaProduct.id,
                variantId: variantBeigeS.id,
                name: pijamaProduct.name,
                thumbnail: pijamaProduct.thumbnail,
                variantName: variantBeigeS.name,
                quantity: 2,
                unitPrice: variantBeigeS.price!,
                total: variantBeigeS.price! * 2,
              },
              {
                productId: pijamaProduct.id,
                variantId: variantBlackS.id,
                name: pijamaProduct.name,
                thumbnail: pijamaProduct.thumbnail,
                variantName: variantBlackS.name,
                quantity: 1,
                unitPrice: variantBlackS.price!,
                total: variantBlackS.price! * 1,
              }
            ]
          }
        }
      });
      console.log(`Created sample order: ${order.id}`);

      // Manually increment soldQuantity in Inventory for the seed
      await prisma.inventory.update({
        where: { variantId: variantBeigeS.id },
        data: { soldQuantity: { increment: 2 } }
      });
      await prisma.inventory.update({
        where: { variantId: variantBlackS.id },
        data: { soldQuantity: { increment: 1 } }
      });
    }
  }

  console.log('Seeding completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
