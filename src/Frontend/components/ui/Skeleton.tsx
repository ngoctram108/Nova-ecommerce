'use client';

import React from 'react';

/* ── Skeleton ── */

export interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  borderRadius?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function Skeleton({
  width = '100%',
  height = 20,
  borderRadius = 'var(--rounded-sm)',
  className,
  style,
}: SkeletonProps) {
  return (
    <div
      className={`skeleton ${className || ''}`}
      style={{
        width,
        height,
        borderRadius,
        ...style,
      }}
      aria-hidden="true"
    />
  );
}

/* ── Product Card Skeleton ── */

export function ProductCardSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <Skeleton height={0} style={{ paddingBottom: '100%', position: 'relative' }} borderRadius="var(--rounded-lg)" />
      <Skeleton height={12} width="40%" />
      <Skeleton height={16} width="80%" />
      <Skeleton height={12} width="30%" />
      <Skeleton height={16} width="50%" />
    </div>
  );
}

/* ── Product Grid Skeleton ── */

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
        gap: 24,
      }}
    >
      {Array.from({ length: count }).map((_, i) => (
        <ProductCardSkeleton key={i} />
      ))}
    </div>
  );
}

/* ── Table Skeleton ── */

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} style={{ display: 'grid', gridTemplateColumns: `repeat(${cols}, 1fr)`, gap: 16 }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} height={16} width={`${60 + Math.random() * 40}%`} />
          ))}
        </div>
      ))}
    </div>
  );
}
