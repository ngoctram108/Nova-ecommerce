import React from 'react';
import { Skeleton } from '@/Frontend/components/ui';

export default function ProductDetailLoading() {
  return (
    <div className="container section">
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr',
          gap: 'var(--space-xxl)',
        }}
        className="lg:grid-cols-2"
      >
        {/* Left: Gallery Skeleton */}
        <div>
          <div style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--rounded-lg)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 'var(--space-sm)', marginTop: 'var(--space-sm)' }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ aspectRatio: '3/4', backgroundColor: 'var(--color-surface)', borderRadius: 'var(--rounded-sm)', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        </div>

        {/* Right: Info Skeleton */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
          <div style={{ width: '20%', height: 20, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '80%', height: 40, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
          <div style={{ width: '40%', height: 24, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
          
          <div style={{ width: '100%', height: 100, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginTop: 'var(--space-md)' }} />
          
          <div style={{ width: '100%', height: 60, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginTop: 'var(--space-xl)' }} />
          <div style={{ width: '100%', height: 48, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </div>
  );
}
