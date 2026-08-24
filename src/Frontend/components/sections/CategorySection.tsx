'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { categories } from '@/Backend/database/data/categories';

export default function CategorySection() {
  // Only show first 4 categories
  const featuredCategories = categories.slice(0, 4);

  return (
    <section className="section container">
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
          Danh mục nổi bật
        </h2>
        <Link
          href="/products"
          style={{
            fontSize: 'var(--text-body-strong-size)',
            fontWeight: 600,
            color: 'var(--color-primary)',
            display: 'flex',
            alignItems: 'center',
            gap: 4,
          }}
          className="hover:underline"
        >
          Xem tất cả <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: 'var(--space-lg)',
        }}
      >
        {featuredCategories.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.slug}`}
            style={{ display: 'block', position: 'relative' }}
            className="group"
          >
            <div
              style={{
                position: 'relative',
                aspectRatio: '4/5',
                borderRadius: 'var(--rounded-lg)',
                overflow: 'hidden',
                backgroundColor: 'var(--color-canvas-parchment)',
              }}
            >
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0, 0, 0, 0.2)',
                  zIndex: 1,
                  transition: 'background-color var(--transition-normal)',
                }}
                className="group-hover:bg-black/30"
              />
              {category.image && (
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1068px) 50vw, 25vw"
                  style={{
                    objectFit: 'cover',
                    transition: 'transform var(--transition-slow)',
                  }}
                  className="group-hover:scale-105"
                />
              )}
              <div
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: 'var(--space-lg)',
                  zIndex: 2,
                  color: 'var(--color-on-dark)',
                }}
              >
                <h3
                  style={{
                    fontSize: 'var(--text-lead-size)',
                    fontWeight: 600,
                    letterSpacing: 'var(--text-lead-ls)',
                    marginBottom: 4,
                  }}
                >
                  {category.name}
                </h3>
                <p style={{ fontSize: 'var(--text-caption-size)', opacity: 0.9 }}>
                  Khám phá ngay
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
