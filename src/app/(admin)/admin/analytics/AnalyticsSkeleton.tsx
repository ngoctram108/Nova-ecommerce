import React from 'react';

export default function AnalyticsSkeleton() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      {/* 4 Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-lg)' }}>
        {[1, 2, 3, 4].map(i => (
          <div 
            key={i} 
            style={{ 
              padding: 'var(--space-lg)', 
              backgroundColor: '#fff', 
              borderRadius: 'var(--rounded-lg)', 
              border: '1px solid var(--color-hairline)',
              height: 104,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              gap: 12
            }}
          >
            <div style={{ height: 16, width: '60%', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ height: 28, width: '40%', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          </div>
        ))}
      </div>

      {/* Main Chart */}
      <div 
        style={{ 
          padding: 'var(--space-lg)', 
          backgroundColor: '#fff', 
          borderRadius: 'var(--rounded-lg)', 
          border: '1px solid var(--color-hairline)',
          height: 380,
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 'var(--space-xl)' }}>
          <div style={{ height: 24, width: 200, backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
          <div style={{ height: 28, width: 140, backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
        </div>
        <div style={{ flex: 1, backgroundColor: 'var(--color-surface-pearl)', borderRadius: '4px 4px 0 0', opacity: 0.5, animation: 'pulse 1.5s ease-in-out infinite' }} />
      </div>

      {/* Bottom 3 Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 'var(--space-lg)' }}>
        {[1, 2, 3].map(i => (
          <div 
            key={i} 
            style={{ 
              padding: 'var(--space-lg)', 
              backgroundColor: '#fff', 
              borderRadius: 'var(--rounded-lg)', 
              border: '1px solid var(--color-hairline)',
              height: 280,
              display: 'flex',
              flexDirection: 'column',
              gap: 16
            }}
          >
            <div style={{ height: 24, width: 150, backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 12 }}>
              {[1, 2, 3, 4].map(j => (
                <div key={j} style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <div style={{ height: 20, width: '60%', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                  <div style={{ height: 20, width: '20%', backgroundColor: 'var(--color-surface-pearl)', borderRadius: 4, animation: 'pulse 1.5s ease-in-out infinite' }} />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
