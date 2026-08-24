'use client';

import React from 'react';
import styles from './Button.module.css';
import { cn } from '@/Shared/utils';

export type ButtonVariant =
  | 'primary'
  | 'secondary'
  | 'dark-utility'
  | 'pearl'
  | 'store-hero'
  | 'ghost'
  | 'outline'
  | 'danger';

export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconOnly?: boolean;
  href?: string;
  children?: React.ReactNode;
}

const variantMap: Record<ButtonVariant, string> = {
  primary: styles['btn-primary'],
  secondary: styles['btn-secondary'],
  'dark-utility': styles['btn-dark-utility'],
  pearl: styles['btn-pearl'],
  'store-hero': styles['btn-store-hero'],
  ghost: styles['btn-ghost'],
  outline: styles['btn-outline'] || '',
  danger: styles['btn-danger'],
};

const sizeMap: Record<ButtonSize, string> = {
  sm: styles['btn-sm'],
  md: '',
  lg: styles['btn-lg'],
};

export default function Button({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  loading = false,
  icon,
  iconOnly = false,
  href,
  children,
  className,
  disabled,
  ...props
}: ButtonProps) {
  const classes = cn(
    styles.btn,
    variantMap[variant],
    sizeMap[size],
    fullWidth && styles['btn-full'],
    loading && styles['btn-loading'],
    iconOnly && styles['btn-icon'],
    iconOnly && (variant === 'primary' ? '' : styles['btn-icon-outline']),
    className
  );

  const content = (
    <>
      {loading && <span className={styles['btn-spinner']} />}
      {icon && !iconOnly && <span className={styles['btn-icon-inner']}>{icon}</span>}
      {iconOnly ? icon : <span className={loading ? styles['btn-text'] : undefined}>{children}</span>}
    </>
  );

  if (href) {
    return (
      <a href={href} className={classes}>
        {content}
      </a>
    );
  }

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      {...props}
    >
      {content}
    </button>
  );
}
