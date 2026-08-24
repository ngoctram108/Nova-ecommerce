'use client';

import React from 'react';
import { cn } from '@/Shared/utils';

/* ── Input ── */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helper?: string;
  icon?: React.ReactNode;
  fullWidth?: boolean;
}

export default function Input({
  label,
  error,
  helper,
  icon,
  fullWidth = true,
  className,
  id,
  ...props
}: InputProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div className={cn(fullWidth && 'input-full')} style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-caption-size)',
            fontWeight: 600,
            color: error ? 'var(--color-error)' : 'var(--color-ink)',
            letterSpacing: 'var(--text-caption-ls)',
          }}
        >
          {label}
        </label>
      )}
      <div style={{ position: 'relative' }}>
        {icon && (
          <span
            style={{
              position: 'absolute',
              left: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--color-ink-muted-48)',
              display: 'flex',
              pointerEvents: 'none',
            }}
          >
            {icon}
          </span>
        )}
        <input
          id={inputId}
          className={cn(className)}
          style={{
            width: fullWidth ? '100%' : 'auto',
            padding: icon ? '12px 16px 12px 42px' : '12px 16px',
            fontSize: 'var(--text-body-size)',
            fontFamily: 'var(--font-body)',
            color: 'var(--color-ink)',
            backgroundColor: 'var(--color-canvas)',
            border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-hairline)'}`,
            borderRadius: 'var(--rounded-sm)',
            transition: 'border-color var(--transition-fast)',
            outline: 'none',
            lineHeight: 1.47,
            letterSpacing: '-0.374px',
          }}
          onFocus={(e) => {
            e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-hairline)';
          }}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : helper ? `${inputId}-helper` : undefined}
          {...props}
        />
      </div>
      {error && (
        <span
          id={`${inputId}-error`}
          role="alert"
          style={{
            fontSize: 'var(--text-fine-print-size)',
            color: 'var(--color-error)',
            lineHeight: 1.3,
          }}
        >
          {error}
        </span>
      )}
      {!error && helper && (
        <span
          id={`${inputId}-helper`}
          style={{
            fontSize: 'var(--text-fine-print-size)',
            color: 'var(--color-ink-muted-48)',
            lineHeight: 1.3,
          }}
        >
          {helper}
        </span>
      )}
    </div>
  );
}

/* ── Textarea ── */

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helper?: string;
  fullWidth?: boolean;
}

export function Textarea({
  label,
  error,
  helper,
  fullWidth = true,
  className,
  id,
  ...props
}: TextareaProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-caption-size)',
            fontWeight: 600,
            color: error ? 'var(--color-error)' : 'var(--color-ink)',
          }}
        >
          {label}
        </label>
      )}
      <textarea
        id={inputId}
        className={cn(className)}
        style={{
          width: fullWidth ? '100%' : 'auto',
          padding: '12px 16px',
          fontSize: 'var(--text-body-size)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-ink)',
          backgroundColor: 'var(--color-canvas)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-hairline)'}`,
          borderRadius: 'var(--rounded-sm)',
          transition: 'border-color var(--transition-fast)',
          outline: 'none',
          resize: 'vertical',
          minHeight: 100,
          lineHeight: 1.47,
        }}
        onFocus={(e) => {
          e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-primary)';
        }}
        onBlur={(e) => {
          e.target.style.borderColor = error ? 'var(--color-error)' : 'var(--color-hairline)';
        }}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <span role="alert" style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
      {!error && helper && (
        <span style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-48)' }}>
          {helper}
        </span>
      )}
    </div>
  );
}

/* ── Select ── */

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
  fullWidth?: boolean;
  placeholder?: string;
}

export function Select({
  label,
  error,
  options,
  fullWidth = true,
  placeholder,
  className,
  id,
  ...props
}: SelectProps) {
  const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {label && (
        <label
          htmlFor={inputId}
          style={{
            fontSize: 'var(--text-caption-size)',
            fontWeight: 600,
            color: error ? 'var(--color-error)' : 'var(--color-ink)',
          }}
        >
          {label}
        </label>
      )}
      <select
        id={inputId}
        className={cn(className)}
        style={{
          width: fullWidth ? '100%' : 'auto',
          padding: '12px 40px 12px 16px',
          fontSize: 'var(--text-body-size)',
          fontFamily: 'var(--font-body)',
          color: 'var(--color-ink)',
          backgroundColor: 'var(--color-canvas)',
          border: `1px solid ${error ? 'var(--color-error)' : 'var(--color-hairline)'}`,
          borderRadius: 'var(--rounded-sm)',
          appearance: 'none',
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath d='M3 4.5L6 7.5L9 4.5' stroke='%237a7a7a' stroke-width='1.5' fill='none'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 14px center',
          cursor: 'pointer',
          outline: 'none',
        }}
        aria-invalid={!!error}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && (
        <span role="alert" style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-error)' }}>
          {error}
        </span>
      )}
    </div>
  );
}
