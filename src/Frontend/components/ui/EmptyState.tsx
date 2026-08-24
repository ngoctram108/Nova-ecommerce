'use client';

import React from 'react';
import Button from './Button';

export interface EmptyStateProps {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    href?: string;
    onClick?: () => void;
  };
}

export default function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-section) var(--space-lg)',
        textAlign: 'center',
        gap: 16,
        minHeight: 300,
      }}
    >
      {icon && (
        <div
          style={{
            fontSize: 48,
            color: 'var(--color-ink-muted-48)',
            marginBottom: 8,
          }}
        >
          {icon}
        </div>
      )}
      <h3
        style={{
          fontSize: 'var(--text-tagline-size)',
          fontWeight: 600,
          color: 'var(--color-ink)',
          letterSpacing: 'var(--text-tagline-ls)',
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 'var(--text-body-size)',
            color: 'var(--color-ink-muted-48)',
            maxWidth: 400,
            lineHeight: 1.47,
          }}
        >
          {description}
        </p>
      )}
      {action && (
        <div style={{ marginTop: 8 }}>
          <Button
            variant="primary"
            onClick={action.onClick}
            href={action.href}
          >
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
}

/* ── Error State ── */

export function ErrorState({
  message = 'Đã có lỗi xảy ra',
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <EmptyState
      icon={<span>⚠</span>}
      title="Lỗi"
      description={message}
      action={onRetry ? { label: 'Thử lại', onClick: onRetry } : undefined}
    />
  );
}

/* ── Loading State ── */

export function LoadingState({ message = 'Đang tải...' }: { message?: string }) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--space-section) var(--space-lg)',
        gap: 16,
        minHeight: 300,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          border: '3px solid var(--color-divider-soft)',
          borderTopColor: 'var(--color-primary)',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }}
      />
      <p style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-48)' }}>
        {message}
      </p>
    </div>
  );
}
