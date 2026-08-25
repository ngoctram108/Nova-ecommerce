import { PrismaClient } from '@prisma/client';
import { searchProductImage, validateAndExtractImage } from '../src/Backend/services/image-search';

const prisma = new PrismaClient();

async function checkUrl(url: string | null): Promise<'valid' | 'invalid' | 'missing' | 'broken' | 'placeholder'> {
  if (!url) return 'missing';
  try {
    if (!url.startsWith('http')) return 'invalid';
    if (url.includes('picsum.photos')) return 'placeholder';
    
    const res = await fetch(url, { 
      method: 'GET',
      headers: { 'User-Agent': 'Mozilla/5.0' },
      signal: AbortSignal.timeout(5000)
    });
    
    if (res.ok && (res.headers.get('content-type') || '').startsWith('image/')) {
      return 'valid';
    }
    return 'broken';
  } catch (e) {
    return 'broken';
  }
}

async function main() {
  console.log('Starting fix for images in PostgreSQL production...');
  const products = await prisma.product.findMany();
  
  let fixedCount = 0;
  let failedCount = 0;
  let skippedCount = 0;
  
  for (const p of products) {
    const urlToCheck = p.imageUrl || p.thumbnail;
    const status = await checkUrl(urlToCheck);
    
    if (status === 'valid') {
      // If thumbnail is valid but imageUrl is missing, we might want to populate it?
      // Actually, let's only fix if status is NOT valid.
      skippedCount++;
      continue;
    }
    
    console.log(`Fixing [${status}] ${p.name}...`);
    
    try {
      const query = `${p.name} ${p.brand || ''} ${p.categorySlug || ''}`.trim();
      const newImage = await searchProductImage(query);
      
      if (newImage && newImage.imageUrl) {
        // Double check validity
        const finalStatus = await checkUrl(newImage.imageUrl);
        if (finalStatus === 'valid') {
          await prisma.product.update({
            where: { id: p.id },
            data: {
              imageUrl: newImage.imageUrl,
              imageAlt: newImage.imageAlt,
              imageSourceUrl: newImage.imageSourceUrl,
            }
          });
          console.log(`  -> Fixed: ${newImage.imageUrl}`);
          fixedCount++;
        } else {
          console.log(`  -> Found image but it was invalid: ${newImage.imageUrl}`);
          failedCount++;
        }
      } else {
        console.log(`  -> No valid image found.`);
        failedCount++;
      }
    } catch (e) {
      console.error(`  -> Error fixing ${p.name}:`, e);
      failedCount++;
    }
  }
  
  console.log('\n--- Fix Summary ---');
  console.log(`Fixed images: ${fixedCount}`);
  console.log(`Failed to fix: ${failedCount}`);
  console.log(`Skipped (already valid): ${skippedCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
