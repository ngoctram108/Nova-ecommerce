'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/components/ui';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      if (res.ok) {
        router.push('/account');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Registration failed');
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
        <h1 className="text-display-sm" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>Đăng ký tài khoản</h1>
        
        {error && (
          <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--rounded-sm)', marginBottom: 16, fontSize: 'var(--text-body-size)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Họ tên</label>
            <Input 
              type="text" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="Nhập họ và tên"
            />
          </div>
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
              placeholder="Tạo mật khẩu"
            />
          </div>
          
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            Đăng ký
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>
          Đã có tài khoản? <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
