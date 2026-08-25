'use client';

import { useState, useEffect } from 'react';
import { Product } from '@/Shared/types';
import { CachedImage } from '@/Backend/services/image-cache';

const PLACEHOLDER_IMAGE = 'https://picsum.photos/seed/placeholder/800/800';

interface UseProductImageResult {
  imageUrl: string;
  imageAlt: string;
  isLoading: boolean;
  error: Error | null;
}

export function useProductImage(product: Partial<Product>): UseProductImageResult {
  // If product already has an explicitly set imageUrl, use it.
  // Otherwise, use thumbnail as a fallback while loading.
  const [imageUrl, setImageUrl] = useState<string>(product.imageUrl || product.thumbnail || PLACEHOLDER_IMAGE);
  const [imageAlt, setImageAlt] = useState<string>(product.imageAlt || product.name || 'Product image');
  const [isLoading, setIsLoading] = useState<boolean>(!product.imageUrl && !product.thumbnail);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (product.imageUrl || product.thumbnail) {
      setImageUrl(product.imageUrl || product.thumbnail || PLACEHOLDER_IMAGE);
      setImageAlt(product.imageAlt || product.name || 'Product image');
      setIsLoading(false);
      return;
    }

    if (!product.id || !product.name) {
      setIsLoading(false);
      return;
    }

    let isMounted = true;

    async function fetchImage() {
      try {
        const query = `${product.name} ${product.brand || ''} ${product.category || ''}`.trim();
        const response = await fetch('/api/images/search', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId: product.id,
            query: query,
          }),
        });

        if (!response.ok) {
          throw new Error('Failed to fetch image');
        }

        const result = await response.json();
        if (result.success && result.data) {
          const cachedImage: CachedImage = result.data;
          if (isMounted) {
            setImageUrl(cachedImage.imageUrl);
            setImageAlt(cachedImage.imageAlt);
            setError(null);
          }
        } else {
           throw new Error(result.error || 'Failed to fetch image');
        }
      } catch (err) {
        if (isMounted) {
          setError(err instanceof Error ? err : new Error('Unknown error'));
          // fallback to thumbnail or placeholder if fetch fails
          setImageUrl(product.thumbnail || PLACEHOLDER_IMAGE);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    fetchImage();

    return () => {
      isMounted = false;
    };
  }, [product.id, product.name, product.brand, product.category, product.imageUrl, product.thumbnail, product.imageAlt]);

  return { imageUrl, imageAlt, isLoading, error };
}
