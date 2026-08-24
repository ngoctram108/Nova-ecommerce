'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { Toast, ToastType } from '@/Shared/types';
import { generateId } from '@/Shared/utils';

/* ── State ── */

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'ADD_TOAST'; payload: Toast }
  | { type: 'REMOVE_TOAST'; payload: string };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'ADD_TOAST':
      return { toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

/* ── Context ── */

interface ToastContextValue {
  toasts: Toast[];
  addToast: (type: ToastType, message: string, duration?: number) => void;
  removeToast: (id: string) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  info: (message: string) => void;
  warning: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/* ── Provider ── */

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const removeToast = useCallback((id: string) => {
    dispatch({ type: 'REMOVE_TOAST', payload: id });
  }, []);

  const addToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = generateId('toast');
      dispatch({ type: 'ADD_TOAST', payload: { id, type, message, duration } });
    },
    []
  );

  const success = useCallback((msg: string) => addToast('success', msg), [addToast]);
  const error = useCallback((msg: string) => addToast('error', msg), [addToast]);
  const info = useCallback((msg: string) => addToast('info', msg), [addToast]);
  const warning = useCallback((msg: string) => addToast('warning', msg), [addToast]);

  return (
    <ToastContext.Provider
      value={{ toasts: state.toasts, addToast, removeToast, success, error, info, warning }}
    >
      {children}
      <ToastContainer toasts={state.toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
}

/* ── Toast Container ── */

function ToastContainer({
  toasts,
  onRemove,
}: {
  toasts: Toast[];
  onRemove: (id: string) => void;
}) {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        right: 24,
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
}

/* ── Toast Item ── */

const typeColors: Record<ToastType, { bg: string; border: string; icon: string }> = {
  success: { bg: '#f0fdf4', border: '#bbf7d0', icon: '✓' },
  error: { bg: '#fef2f2', border: '#fecaca', icon: '✕' },
  info: { bg: '#eff6ff', border: '#bfdbfe', icon: 'ℹ' },
  warning: { bg: '#fffbeb', border: '#fed7aa', icon: '⚠' },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const colors = typeColors[toast.type];

  useEffect(() => {
    if (toast.duration) {
      const timer = setTimeout(() => onRemove(toast.id), toast.duration);
      return () => clearTimeout(timer);
    }
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      style={{
        pointerEvents: 'auto',
        padding: '14px 20px',
        borderRadius: 'var(--rounded-md)',
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: 'var(--color-ink)',
        fontSize: '14px',
        lineHeight: 1.4,
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        minWidth: 300,
        maxWidth: 420,
        boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
        animation: 'fadeInUp 0.3s ease-out',
      }}
    >
      <span style={{ fontSize: 16, fontWeight: 600 }}>{colors.icon}</span>
      <span style={{ flex: 1 }}>{toast.message}</span>
      <button
        onClick={() => onRemove(toast.id)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: 16,
          color: 'var(--color-ink-muted-48)',
          padding: 4,
          lineHeight: 1,
        }}
        aria-label="Đóng"
      >
        ×
      </button>
    </div>
  );
}
