'use client';

import React, { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/Frontend/components/ui';
import { Eye, EyeOff } from 'lucide-react';

function ResetPasswordForm() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!token) {
      setError('Token không hợp lệ hoặc bị thiếu.');
      return;
    }

    if (password.length < 8) {
      setError('Mật khẩu phải dài ít nhất 8 ký tự.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('Đặt lại mật khẩu thành công! Chuyển hướng đến trang đăng nhập...');
        setTimeout(() => {
          router.push('/login');
        }, 2000);
      } else {
        setError(data.error || 'Đã có lỗi xảy ra.');
      }
    } catch (err) {
      setError('Lỗi kết nối. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <div style={{ padding: 12, backgroundColor: '#fee2e2', color: '#b91c1c', borderRadius: 'var(--rounded-sm)', marginBottom: 16, fontSize: 'var(--text-body-size)' }}>
          Liên kết đặt lại mật khẩu không hợp lệ hoặc đã hết hạn. Vui lòng yêu cầu một liên kết mới.
        </div>
        <div style={{ textAlign: 'center' }}>
          <Link href="/forgot-password">
            <Button>Yêu cầu link mới</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
      <h1 className="text-display-sm" style={{ marginBottom: 'var(--space-md)', textAlign: 'center' }}>Đặt lại mật khẩu</h1>
      
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
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mật khẩu mới</label>
          <div style={{ position: 'relative' }}>
            <Input 
              type={showPassword ? 'text' : 'password'} 
              required 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              placeholder="Nhập mật khẩu mới"
              style={{ paddingRight: 40 }}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              style={{
                position: 'absolute',
                right: 12,
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--color-ink-muted-48)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Xác nhận mật khẩu</label>
          <Input 
            type={showPassword ? 'text' : 'password'} 
            required 
            value={confirmPassword} 
            onChange={e => setConfirmPassword(e.target.value)} 
            placeholder="Nhập lại mật khẩu mới"
          />
        </div>
        
        <Button type="submit" loading={loading} style={{ width: '100%', marginTop: 8 }}>
          Xác nhận đổi mật khẩu
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="container section" style={{ maxWidth: 400, marginTop: 'var(--space-xxxl)', marginBottom: 'var(--space-xxxl)' }}>
      <Suspense fallback={<div style={{ textAlign: 'center', padding: 'var(--space-xl)' }}>Đang tải...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
