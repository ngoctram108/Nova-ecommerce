import fs from 'fs/promises';
import path from 'path';

export interface CachedImage {
  imageUrl: string;
  imageAlt: string;
  imageSourceUrl: string;
  timestamp: number;
}

const CACHE_FILE_PATH = path.join(process.cwd(), 'lib/data/image-cache.json');

let memoryCache: Record<string, CachedImage> = {};
let isCacheLoaded = false;

export async function loadCache(): Promise<Record<string, CachedImage>> {
  if (isCacheLoaded) return memoryCache;
  try {
    const data = await fs.readFile(CACHE_FILE_PATH, 'utf-8');
    memoryCache = JSON.parse(data);
    isCacheLoaded = true;
  } catch (error) {
    // File might not exist or be invalid, fallback to empty cache
    memoryCache = {};
    isCacheLoaded = true;
  }
  return memoryCache;
}

export async function saveCache(): Promise<void> {
  // In production (Vercel), file system is read-only.
  // We'll only attempt to write if we are in development mode.
  if (process.env.NODE_ENV === 'development') {
    try {
      await fs.writeFile(CACHE_FILE_PATH, JSON.stringify(memoryCache, null, 2), 'utf-8');
    } catch (error) {
      console.error('Failed to save image cache:', error);
    }
  }
}

export async function getCachedImage(productId: string): Promise<CachedImage | null> {
  await loadCache();
  return memoryCache[productId] || null;
}

export async function setCachedImage(productId: string, image: CachedImage): Promise<void> {
  await loadCache();
  memoryCache[productId] = image;
  await saveCache();
}
