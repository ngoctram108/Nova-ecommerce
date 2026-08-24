'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import { Product } from '@/Shared/types';
import { ProductCard } from '@/Frontend/components/ui';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface ProductCarouselProps {
  title: string;
  products: Product[];
  viewAllLink?: string;
  backgroundColor?: string;
}

export default function ProductCarousel({
  title,
  products,
  viewAllLink,
  backgroundColor = 'transparent',
}: ProductCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo =
        direction === 'left' ? scrollLeft - clientWidth + 100 : scrollLeft + clientWidth - 100;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!products || products.length === 0) return null;

  return (
    <section className="section" style={{ backgroundColor }}>
      <div className="container">
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-display-md-size)',
              fontWeight: 600,
              color: 'var(--color-ink)',
              letterSpacing: 'var(--text-display-md-ls)',
            }}
          >
            {title}
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            {viewAllLink && (
              <Link
                href={viewAllLink}
                style={{
                  fontSize: 'var(--text-body-strong-size)',
                  fontWeight: 600,
                  color: 'var(--color-primary)',
                }}
                className="hover:underline hidden sm:block"
              >
                Xem tất cả
              </Link>
            )}
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={() => scroll('left')}
                aria-label="Cuộn trái"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--rounded-full)',
                  border: '1px solid var(--color-hairline)',
                  backgroundColor: 'var(--color-canvas)',
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
                className="hover:bg-gray-50"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll('right')}
                aria-label="Cuộn phải"
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 'var(--rounded-full)',
                  border: '1px solid var(--color-hairline)',
                  backgroundColor: 'var(--color-canvas)',
                  color: 'var(--color-ink)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'background-color var(--transition-fast)',
                }}
                className="hover:bg-gray-50"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div
          style={{
            position: 'relative',
            margin: '0 calc(-1 * var(--container-padding))',
            padding: '0 var(--container-padding)',
          }}
        >
          <div
            ref={scrollRef}
            style={{
              display: 'flex',
              gap: 'var(--space-lg)',
              overflowX: 'auto',
              scrollSnapType: 'x mandatory',
              scrollBehavior: 'smooth',
              paddingBottom: 24, // Space for shadow/hover
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'none', // Firefox
              msOverflowStyle: 'none', // IE/Edge
            }}
            className="hide-scrollbar"
          >
            {/* Inject a style tag to hide webkit scrollbar specifically for this element */}
            <style dangerouslySetInnerHTML={{ __html: `.hide-scrollbar::-webkit-scrollbar { display: none; }` }} />
            
            {products.map((product) => (
              <div
                key={product.id}
                style={{
                  flex: '0 0 auto',
                  width: 'calc(80vw - 32px)',
                  maxWidth: 320,
                  scrollSnapAlign: 'start',
                }}
              >
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        </div>
        
        {viewAllLink && (
          <div style={{ marginTop: 16, textAlign: 'center' }} className="sm:hidden">
            <Link
              href={viewAllLink}
              style={{
                fontSize: 'var(--text-body-strong-size)',
                fontWeight: 600,
                color: 'var(--color-primary)',
              }}
              className="hover:underline"
            >
              Xem tất cả
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}
