'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Input, Button } from '@/Frontend/components/ui';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setEmail('');
      } else {
        setError(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container section" style={{ maxWidth: 400, marginTop: 'var(--space-xxxl)', marginBottom: 'var(--space-xxxl)' }}>
      <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <h1 className="text-display-sm" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>Quên mật khẩu</h1>
        
        <p style={{ marginBottom: 'var(--space-lg)', color: 'var(--color-ink-muted-80)', textAlign: 'center', fontSize: 'var(--text-body-size)' }}>
          Nhập email của tài khoản NORA để nhận liên kết đặt lại mật khẩu.
        </p>

        {error && (
          <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--rounded-sm)', marginBottom: 16, fontSize: 'var(--text-body-size)' }}>
            {error}
          </div>
        )}

        {message && (
          <div style={{ padding: 12, backgroundColor: '#dcfce7', color: '#15803d', borderRadius: 'var(--rounded-sm)', marginBottom: 16, fontSize: 'var(--text-body-size)' }}>
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              placeholder="Nhập email của bạn"
            />
          </div>
          
          <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
            Gửi yêu cầu
          </Button>
        </form>

        <div style={{ marginTop: 'var(--space-lg)', textAlign: 'center', color: 'var(--color-ink-muted-80)' }}>
          <Link href="/login" style={{ color: 'var(--color-primary)', fontWeight: 500 }}>Quay lại đăng nhập</Link>
        </div>
      </div>
    </div>
  );
}
