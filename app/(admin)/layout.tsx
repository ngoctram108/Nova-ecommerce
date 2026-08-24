'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DollarSign, Package, ShoppingBag, Users, BarChart3, LogOut, Settings, Boxes } from 'lucide-react';
import { Providers } from '@/lib/contexts/Providers';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const links = [
    { name: 'Dashboard', href: '/admin', icon: DollarSign },
    { name: 'Products', href: '/admin/products', icon: ShoppingBag },
    { name: 'Inventory', href: '/admin/inventory', icon: Boxes },
    { name: 'Orders', href: '/admin/orders', icon: Package },
    { name: 'Customers', href: '/admin/customers', icon: Users },
    { name: 'Analytics', href: '/admin/analytics', icon: BarChart3 },
  ];

  return (
    <Providers>
      <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--color-surface-pearl)' }}>
        {/* Sidebar */}
        <aside style={{ width: 260, backgroundColor: '#fff', borderRight: '1px solid var(--color-hairline)', display: 'flex', flexDirection: 'column' }}>
          <div style={{ padding: 'var(--space-xl)', borderBottom: '1px solid var(--color-hairline)' }}>
            <Link href="/" style={{ textDecoration: 'none', color: 'var(--color-ink)' }}>
              <div style={{ fontSize: 'var(--text-lead-size)', fontWeight: 800, letterSpacing: '0.1em' }}>
                NORA <span style={{ fontSize: '12px', fontWeight: 500, color: 'var(--color-primary)' }}>ADMIN</span>
              </div>
            </Link>
          </div>
          
          <nav style={{ padding: 'var(--space-lg)', flex: 1, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {links.map(link => {
              const isActive = pathname === link.href;
              const Icon = link.icon;
              return (
                <Link 
                  key={link.href} 
                  href={link.href}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 16px',
                    borderRadius: 'var(--rounded-sm)',
                    textDecoration: 'none',
                    backgroundColor: isActive ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                    color: isActive ? 'var(--color-primary)' : 'var(--color-ink-muted-80)',
                    fontWeight: isActive ? 600 : 500,
                    transition: 'all var(--transition-fast)',
                  }}
                >
                  <Icon size={20} />
                  {link.name}
                </Link>
              );
            })}
          </nav>

          <div style={{ padding: 'var(--space-lg)', borderTop: '1px solid var(--color-hairline)' }}>
            <button 
              onClick={async () => {
                await fetch('/api/auth/logout', { method: 'POST' });
                window.location.href = '/login';
              }}
              style={{
                width: '100%',
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                color: 'var(--color-danger)',
                backgroundColor: 'transparent',
                border: 'none',
                fontWeight: 500,
                cursor: 'pointer',
                textAlign: 'left'
              }}
            >
              <LogOut size={20} />
              Đăng xuất
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
          <header style={{ height: 72, backgroundColor: '#fff', borderBottom: '1px solid var(--color-hairline)', display: 'flex', alignItems: 'center', padding: '0 var(--space-xxl)' }}>
            <h2 style={{ fontSize: 'var(--text-title-size)', fontWeight: 600, color: 'var(--color-ink)' }}>
              {links.find(l => l.href === pathname)?.name || 'Dashboard'}
            </h2>
          </header>
          <div style={{ padding: 'var(--space-xxl)', flex: 1, overflowY: 'auto' }}>
            {children}
          </div>
        </main>
      </div>
    </Providers>
  );
}
