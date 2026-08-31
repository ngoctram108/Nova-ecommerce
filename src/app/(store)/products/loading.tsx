import React from 'react';
import styles from './Products.module.css';

export function ProductListSkeleton() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 'var(--space-lg)', marginTop: '-60px' }}>
        <div style={{ width: 150, height: 20, backgroundColor: 'var(--color-surface)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      </div>
      <div className={styles.pageLayout}>
        {/* Sidebar Skeleton */}
        <aside className={styles.sidebarWrapper}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[1, 2, 3, 4].map((i) => (
              <div key={i} style={{ width: '100%', height: 40, backgroundColor: 'var(--color-surface)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        </aside>

        {/* Main Content Skeleton */}
        <div className={styles.mainContent}>
          <div className={styles.productGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ width: '100%', aspectRatio: '3/4', backgroundColor: 'var(--color-surface)', borderRadius: 8, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '80%', height: 20, backgroundColor: 'var(--color-surface)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
                <div style={{ width: '40%', height: 20, backgroundColor: 'var(--color-surface)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
              </div>
            ))}
          </div>
        </div>
      </div>
      <style>{`
        @keyframes pulse {
          0% { opacity: 1; }
          50% { opacity: 0.5; }
          100% { opacity: 1; }
        }
      `}</style>
    </>
  );
}

export default function ProductsLoading() {
  return (
    <div className="container section">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-xl)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--color-divider-soft)',
        }}
      >
        <div style={{ width: 200, height: 40, backgroundColor: 'var(--color-surface)', borderRadius: 4, animation: 'pulse 1.5s infinite' }} />
      </div>

      <ProductListSkeleton />
    </div>
  );
}
