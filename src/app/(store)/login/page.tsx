'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/Frontend/components/ui';

export default function LoginPage() {
  const [email, setEmail] = useState('admin@nora.com');
  const [password, setPassword] = useState('admin123456');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (res.ok) {
        const data = await res.json();
        // Redirect based on role
        if (data.user.role === 'ADMIN') {
          router.push('/admin');
        } else {
          router.push('/account');
        }
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Login failed');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section" style={{ maxWidth: 400, marginTop: 'var(--space-xxxl)', marginBottom: 'var(--space-xxxl)' }}>
      <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <h1 className="text-display-sm" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>Đăng nhập</h1>
        
        {error && (
          <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--rounded-sm)', marginBottom: 16, fontSize: 'var(--text-body-size)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Nhập email"
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mật khẩu</label>
            <Input 
              type="password" 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu"
            />
            <div style={{ marginTop: 8 }}>
              <Link href="/forgot-password" style={{ color: 'var(--color-primary)', fontSize: 'var(--text-caption-size)', fontWeight: 500 }}>
                Quên mật khẩu?
              </Link>
            </div>
          </div>
          
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            Đăng nhập
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>
          Chưa có tài khoản? <Link href="/register" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Đăng ký ngay</Link>
        </div>
      </div>
    </div>
  );
}
