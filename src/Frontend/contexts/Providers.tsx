'use client';

import React from 'react';
import { ToastProvider } from '@/Frontend/components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';
import { LocaleProvider } from './LocaleContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LocaleProvider>
      <ToastProvider>
        <AuthProvider>
          <CartProvider>
            {children}
          </CartProvider>
        </AuthProvider>
      </ToastProvider>
    </LocaleProvider>
  );
}
