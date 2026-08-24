'use client';

import React, { useEffect, useRef } from 'react';

/* ── Modal ── */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  maxWidth?: number;
}

export default function Modal({ isOpen, onClose, title, children, maxWidth = 560 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      // Focus trap
      contentRef.current?.focus();
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.2s ease-out',
        padding: 'var(--space-lg)',
      }}
    >
      <div
        ref={contentRef}
        tabIndex={-1}
        style={{
          backgroundColor: 'var(--color-canvas)',
          borderRadius: 'var(--rounded-lg)',
          maxWidth,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          animation: 'fadeInUp 0.3s ease-out',
          outline: 'none',
        }}
      >
        {title && (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '20px 24px',
              borderBottom: '1px solid var(--color-divider-soft)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--text-tagline-size)',
                fontWeight: 600,
                color: 'var(--color-ink)',
              }}
            >
              {title}
            </h2>
            <button
              onClick={onClose}
              aria-label="Đóng"
              style={{
                width: 32,
                height: 32,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: 'var(--rounded-full)',
                fontSize: 20,
                color: 'var(--color-ink-muted-48)',
                transition: 'background-color var(--transition-fast)',
                cursor: 'pointer',
                background: 'none',
                border: 'none',
              }}
              onMouseEnter={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'var(--color-canvas-parchment)';
              }}
              onMouseLeave={(e) => {
                (e.target as HTMLElement).style.backgroundColor = 'transparent';
              }}
            >
              ×
            </button>
          </div>
        )}
        <div style={{ padding: '24px' }}>{children}</div>
      </div>
    </div>
  );
}

/* ── Drawer ── */

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  side?: 'left' | 'right';
  width?: number;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  children,
  side = 'right',
  width = 360,
}: DrawerProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    function handleEscape(e: KeyboardEvent) {
      if (e.key === 'Escape' && isOpen) onClose();
    }
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9990,
        display: 'flex',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        animation: 'fadeIn 0.15s ease-out',
      }}
    >
      <div
        style={{
          position: 'absolute',
          top: 0,
          bottom: 0,
          [side]: 0,
          width,
          maxWidth: '100vw',
          backgroundColor: 'var(--color-canvas)',
          display: 'flex',
          flexDirection: 'column',
          animation: `slideIn${side === 'right' ? 'Right' : 'Left'} 0.3s ease-out`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '16px 20px',
            borderBottom: '1px solid var(--color-divider-soft)',
            flexShrink: 0,
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-body-strong-size)',
              fontWeight: 600,
              color: 'var(--color-ink)',
            }}
          >
            {title || ''}
          </h2>
          <button
            onClick={onClose}
            aria-label="Đóng"
            style={{
              width: 36,
              height: 36,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--rounded-full)',
              fontSize: 20,
              color: 'var(--color-ink-muted-48)',
              cursor: 'pointer',
              background: 'none',
              border: 'none',
            }}
          >
            ×
          </button>
        </div>
        {/* Content */}
        <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>{children}</div>
      </div>
    </div>
  );
}
