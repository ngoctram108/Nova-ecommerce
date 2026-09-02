'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Input, Button } from '@/Frontend/components/ui';
import { Eye, EyeOff } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Name validation
    if (!name.trim()) {
      errors.name = 'Vui lòng nhập họ tên.';
    } else if (name.trim().length < 2) {
      errors.name = 'Họ tên phải có ít nhất 2 ký tự.';
    }

    // Email validation
    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      errors.email = 'Vui lòng nhập email.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      errors.email = 'Email không đúng định dạng.';
    }

    // Password validation
    if (!password) {
      errors.password = 'Vui lòng nhập mật khẩu.';
    } else if (password.length < 8) {
      errors.password = 'Mật khẩu phải có ít nhất 8 ký tự.';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận mật khẩu.';
    } else if (confirmPassword !== password) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/account');
        router.refresh();
      } else {
        setError(data.error || 'Đăng ký thất bại. Vui lòng thử lại.');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  };

  // Clear field error when user starts typing
  const clearFieldError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
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
              onChange={e => { setName(e.target.value); clearFieldError('name'); }}
              placeholder="Nhập họ và tên"
              error={fieldErrors.name}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Email</label>
            <Input 
              type="email" 
              required 
              value={email} 
              onChange={e => { setEmail(e.target.value); clearFieldError('email'); }}
              placeholder="Nhập email"
              error={fieldErrors.email}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Input 
                type={showPassword ? 'text' : 'password'} 
                required 
                value={password} 
                onChange={e => { setPassword(e.target.value); clearFieldError('password'); }}
                placeholder="Tạo mật khẩu (ít nhất 8 ký tự)"
                error={fieldErrors.password}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: fieldErrors.password ? 'calc(50% - 10px)' : '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-ink-muted-48)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Xác nhận mật khẩu</label>
            <div style={{ position: 'relative' }}>
              <Input 
                type={showConfirmPassword ? 'text' : 'password'} 
                required 
                value={confirmPassword} 
                onChange={e => { setConfirmPassword(e.target.value); clearFieldError('confirmPassword'); }}
                placeholder="Nhập lại mật khẩu"
                error={fieldErrors.confirmPassword}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: fieldErrors.confirmPassword ? 'calc(50% - 10px)' : '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--color-ink-muted-48)',
                  display: 'flex',
                  alignItems: 'center',
                  padding: 4,
                }}
                aria-label={showConfirmPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>
          
          <Button type="submit" loading={loading} disabled={loading} style={{ width: '100%', marginTop: 8 }}>
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
