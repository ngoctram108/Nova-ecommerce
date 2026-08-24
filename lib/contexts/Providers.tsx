'use client';

import React from 'react';
import { ToastProvider } from '@/components/ui/Toast';
import { AuthProvider } from './AuthContext';
import { CartProvider } from './CartContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <AuthProvider>
        <CartProvider>
          {children}
        </CartProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
