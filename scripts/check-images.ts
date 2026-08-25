import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkUrl(url: string | null): Promise<'valid' | 'invalid' | 'missing' | 'broken'> {
  if (!url) return 'missing';
  try {
    if (!url.startsWith('http')) return 'invalid';
    
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
  console.log('Checking images in PostgreSQL production...');
  const products = await prisma.product.findMany();
  
  let validCount = 0;
  let missingCount = 0;
  let brokenCount = 0;
  let invalidCount = 0;
  
  for (const p of products) {
    // If imageUrl exists, check it. Otherwise check thumbnail.
    const urlToCheck = p.imageUrl || p.thumbnail;
    const status = await checkUrl(urlToCheck);
    
    if (status === 'valid') validCount++;
    else if (status === 'missing') missingCount++;
    else if (status === 'broken') brokenCount++;
    else if (status === 'invalid') invalidCount++;
    
    if (status !== 'valid') {
      console.log(`- [${status.toUpperCase()}] ${p.name}: ${urlToCheck}`);
    }
  }
  
  console.log('\n--- Summary ---');
  console.log(`Total products: ${products.length}`);
  console.log(`Valid images: ${validCount}`);
  console.log(`Missing images: ${missingCount}`);
  console.log(`Broken images: ${brokenCount}`);
  console.log(`Invalid image URLs: ${invalidCount}`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
