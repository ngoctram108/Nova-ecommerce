import React from 'react';
import AnalyticsSkeleton from './AnalyticsSkeleton';

export default function AnalyticsLoading() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600 }}>Analytics</h2>
      </div>
      <AnalyticsSkeleton />
    </div>
  );
}
