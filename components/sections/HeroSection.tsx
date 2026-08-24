'use client';

import React from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui';
import Image from 'next/image';

export default function HeroSection() {
  return (
    <section
      style={{
        position: 'relative',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        backgroundColor: 'var(--color-surface-tile-1)',
      }}
    >
      {/* Background Image (Using placeholder for demo) */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0 }}>
        <div
          style={{
            position: 'absolute',
            inset: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            zIndex: 1,
          }}
        />
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80"
          alt="NORA Fall Collection"
          fill
          priority
          style={{ objectFit: 'cover', objectPosition: 'center' }}
        />
      </div>

      {/* Content */}
      <div
        className="container"
        style={{
          position: 'relative',
          zIndex: 2,
          color: 'var(--color-on-dark)',
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 'var(--space-md)',
        }}
      >
        <div
          style={{
            fontSize: 'var(--text-caption-strong-size)',
            textTransform: 'uppercase',
            letterSpacing: '2px',
            animation: 'fadeInUp 0.8s ease-out',
          }}
        >
          Bộ sưu tập Thu Đông 2026
        </div>
        
        <h1
          className="text-hero-display"
          style={{
            maxWidth: 800,
            animation: 'fadeInUp 0.8s ease-out 0.1s both',
          }}
        >
          Tối giản. Thanh lịch. Vượt thời gian.
        </h1>
        
        <p
          className="text-lead-airy"
          style={{
            maxWidth: 600,
            color: 'var(--color-body-muted)',
            marginBottom: 'var(--space-md)',
            animation: 'fadeInUp 0.8s ease-out 0.2s both',
          }}
        >
          Khám phá sự hoàn hảo trong từng chi tiết. Thiết kế tinh giản, chất liệu cao cấp mang đến trải nghiệm đích thực.
        </p>
        
        <div
          style={{
            display: 'flex',
            gap: 16,
            animation: 'fadeInUp 0.8s ease-out 0.3s both',
          }}
          className="flex-col sm:flex-row"
        >
          <Button variant="primary" size="lg" href="/products?sort=newest">
            Khám phá ngay
          </Button>
          <Button variant="ghost" size="lg" href="/products?badge=SALE" style={{ color: 'var(--color-on-dark)' }}>
            Xem ưu đãi
          </Button>
        </div>
      </div>
    </section>
  );
}
