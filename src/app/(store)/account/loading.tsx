import React from 'react';

export default function AccountLoading() {
  return (
    <div className="container section" style={{ minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-xl)' }}>
        <div>
          <div style={{ width: 200, height: 40, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginBottom: 8 }} />
          <div style={{ width: 150, height: 20, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite' }} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xxl)' }} className="lg:grid-cols-4">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[1, 2, 3, 4].map(i => (
              <div key={i} style={{ height: 44, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', borderRadius: 'var(--rounded-sm)' }} />
            ))}
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          <div style={{ width: 250, height: 32, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', marginBottom: 'var(--space-lg)' }} />
          <div style={{ height: 300, backgroundColor: 'var(--color-surface)', animation: 'pulse 1.5s infinite', borderRadius: 'var(--rounded-lg)' }} />
        </div>
      </div>
    </div>
  );
}
