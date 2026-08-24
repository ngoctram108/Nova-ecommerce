'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { Product } from '@/lib/types';
import Badge from './Badge';
import Button from './Button';
import { useProductImage } from '@/hooks/useProductImage';

/* ── Generic Card ── */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  theme?: 'light' | 'parchment' | 'dark';
}

export function Card({
  children,
  padding = 'md',
  theme = 'light',
  className,
  ...props
}: CardProps) {
  const paddingMap = {
    none: '0',
    sm: '16px',
    md: '24px',
    lg: '32px',
  };

  const themeClass =
    theme === 'light' ? 'tile-light' : theme === 'parchment' ? 'tile-parchment' : 'tile-dark';

  return (
    <div
      className={cn(themeClass, className)}
      style={{
        padding: paddingMap[padding],
        borderRadius: 'var(--rounded-lg)',
        boxShadow: 'var(--shadow-none)', // Flat design per Apple
        border: theme === 'light' ? '1px solid var(--color-hairline)' : 'none',
      }}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── Product Card ── */

export interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  priority?: boolean;
}

export function ProductCard({ product, onAddToCart, priority = false }: ProductCardProps) {
  const { imageUrl, imageAlt } = useProductImage(product);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        position: 'relative',
      }}
      className="group"
    >
      {/* Thumbnail */}
      <Link href={`/product/${product.id}`} style={{ display: 'block' }}>
        <div
          style={{
            position: 'relative',
            aspectRatio: '1/1',
            backgroundColor: 'var(--color-canvas-parchment)',
            borderRadius: 'var(--rounded-lg)',
            overflow: 'hidden',
          }}
        >
          {product.badge && (
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
              <Badge type={product.badge} />
            </div>
          )}
          {product.stock === 0 && (
            <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 10 }}>
              <Badge type="SOLD_OUT" />
            </div>
          )}
          <Image
            src={imageUrl || product.thumbnail}
            alt={imageAlt || product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1068px) 50vw, 33vw"
            priority={priority}
            style={{
              objectFit: 'cover',
              transition: 'transform var(--transition-slow)',
            }}
            className="group-hover:scale-105"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (target.src !== product.thumbnail && target.src !== 'https://placehold.co/800') {
                 target.src = product.thumbnail || 'https://placehold.co/800';
                 target.srcset = '';
              }
            }}
          />
        </div>
      </Link>

      {/* Info */}
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%', position: 'relative' }}>
        <div
          style={{
            fontSize: 'var(--text-fine-print-size)',
            color: 'var(--color-ink-muted-48)',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            fontWeight: 600,
          }}
        >
          {product.brand}
        </div>
        <Link href={`/product/${product.id}`}>
          <h3
            style={{
              fontSize: 'var(--text-body-size)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              letterSpacing: 'var(--text-body-ls)',
              lineHeight: 1.3,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.name}
          </h3>
        </Link>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: 4,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span
              style={{
                fontSize: 'var(--text-body-strong-size)',
                fontWeight: 600,
                color: 'var(--color-ink)',
              }}
            >
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                product.price
              )}
            </span>
            {product.compareAt && (
              <span
                style={{
                  fontSize: 'var(--text-caption-size)',
                  color: 'var(--color-ink-muted-48)',
                  textDecoration: 'line-through',
                }}
              >
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  product.compareAt
                )}
              </span>
            )}
          </div>
        </div>

        {/* Action (Optional Add to Cart on hover for desktop) */}
        {onAddToCart && product.stock > 0 && (
          <div style={{ marginTop: 12 }}>
            <Button
              variant="pearl"
              fullWidth
              size="sm"
              onClick={(e) => {
                e.preventDefault();
                onAddToCart(product);
              }}
            >
              Thêm vào giỏ
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
