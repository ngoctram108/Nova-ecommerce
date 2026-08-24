'use client';

import React from 'react';
import { CheckCircle2, Circle, Clock, Package, Truck } from 'lucide-react';

interface OrderTimelineProps {
  status: string;
}

const STEPS = [
  { id: 'PENDING', label: 'Đặt hàng', icon: Clock },
  { id: 'CONFIRMED', label: 'Đã xác nhận', icon: CheckCircle2 },
  { id: 'PROCESSING', label: 'Đang xử lý', icon: Package },
  { id: 'SHIPPING', label: 'Đang giao', icon: Truck },
  { id: 'DELIVERED', label: 'Đã giao', icon: CheckCircle2 }
];

export default function OrderTimeline({ status }: OrderTimelineProps) {
  if (status === 'CANCELLED') {
    return (
      <div style={{ padding: '24px', backgroundColor: 'var(--color-error-light)', borderRadius: 'var(--rounded-lg)', textAlign: 'center', marginBottom: '24px' }}>
        <div style={{ color: 'var(--color-error)', fontWeight: 600, fontSize: 'var(--text-lead-size)' }}>Đơn hàng đã hủy</div>
      </div>
    );
  }

  const currentIndex = STEPS.findIndex(s => s.id === status);
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div style={{ padding: '32px 0', marginBottom: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
        <div style={{ position: 'absolute', top: 12, left: 0, right: 0, height: 2, backgroundColor: 'var(--color-divider-soft)', zIndex: 0 }} />
        <div style={{ position: 'absolute', top: 12, left: 0, width: `${(activeIndex / (STEPS.length - 1)) * 100}%`, height: 2, backgroundColor: 'var(--color-primary)', zIndex: 0, transition: 'width 0.3s ease' }} />
        
        {STEPS.map((step, idx) => {
          const isActive = idx <= activeIndex;
          const isCurrent = idx === activeIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative', zIndex: 1, width: 80 }}>
              <div style={{ 
                width: 24, height: 24, borderRadius: '50%', 
                backgroundColor: isActive ? 'var(--color-primary)' : 'var(--color-surface)',
                border: isActive ? 'none' : '2px solid var(--color-divider-soft)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: isActive ? 'white' : 'transparent',
                marginBottom: 8
              }}>
                <Icon size={14} />
              </div>
              <div style={{ 
                fontSize: 'var(--text-fine-print-size)', 
                fontWeight: isCurrent ? 600 : 400,
                color: isActive ? 'var(--color-ink)' : 'var(--color-ink-muted-80)',
                textAlign: 'center'
              }}>
                {step.label}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
