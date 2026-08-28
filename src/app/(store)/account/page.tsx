'use client';

import React, { useState } from 'react';
import { useAuth } from '@/Frontend/contexts/AuthContext';
import { Button, Input, StatusBadge, EmptyState } from '@/Frontend/components/ui';
import { Package, Heart, User as UserIcon, LogOut, Shield } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export default function AccountPage() {
  const { user, isLoading, login, logout } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (user?.role === 'ADMIN') {
      router.replace('/admin');
    }
  }, [user, router]);
  
  // Login form state
  const [email, setEmail] = useState('demo@example.com');
  const [password, setPassword] = useState('demo123');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Tabs state
  const [activeTab, setActiveTab] = useState<'profile' | 'orders' | 'wishlist' | 'security'>('orders');
  const [userOrders, setUserOrders] = useState<any[]>([]);
  const [ordersLoaded, setOrdersLoaded] = useState(false);

  // Fetch orders
  React.useEffect(() => {
    if (user && activeTab === 'orders' && !ordersLoaded) {
      fetch('/api/orders')
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            setUserOrders(data);
          }
          setOrdersLoaded(true);
        })
        .catch(err => console.error(err));
    }
  }, [user, activeTab, ordersLoaded]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    
    const result = await login(email, password);
    if (!result.success) {
      setLoginError(result.error || 'Đăng nhập thất bại');
    }
    
    setIsLoggingIn(false);
  };

  if (isLoading) {
    return <div className="container section" style={{ minHeight: '60vh' }}>Đang tải...</div>;
  }

  // Not logged in view
  if (!user) {
    return (
      <div className="container section" style={{ minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="tile-light" style={{ width: '100%', maxWidth: 400, padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', boxShadow: 'var(--shadow-product)' }}>
          <h1 className="text-display-md" style={{ textAlign: 'center', marginBottom: 'var(--space-lg)' }}>
            Đăng nhập
          </h1>
          <p style={{ textAlign: 'center', color: 'var(--color-ink-muted-80)', marginBottom: 'var(--space-xl)', fontSize: 'var(--text-caption-size)' }}>
            Sử dụng tài khoản demo: <br />
            <strong>Email:</strong> demo@example.com <br />
            <strong>Password:</strong> demo123
          </p>
          
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Input
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
            <Input
              label="Mật khẩu"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            
            {loginError && (
              <div style={{ color: 'var(--color-error)', fontSize: 'var(--text-fine-print-size)' }}>
                {loginError}
              </div>
            )}
            
            <Button variant="primary" fullWidth type="submit" loading={isLoggingIn} style={{ marginTop: 8 }}>
              Đăng nhập
            </Button>
          </form>
        </div>
      </div>
    );
  }

  // userOrders are fetched from state
  return (
    <div className="container section" style={{ minHeight: '80vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="text-display-lg">Tài khoản của tôi</h1>
          <p style={{ color: 'var(--color-ink-muted-80)', marginTop: 8 }}>Xin chào, {user.name}</p>
        </div>
        <Button variant="ghost" onClick={logout} icon={<LogOut size={16} />}>
          Đăng xuất
        </Button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xxl)' }} className="lg:grid-cols-4">
        {/* Sidebar Nav */}
        <div className="lg:col-span-1">
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <button
              onClick={() => setActiveTab('orders')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--rounded-sm)',
                border: 'none',
                backgroundColor: activeTab === 'orders' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                color: activeTab === 'orders' ? 'var(--color-primary)' : 'var(--color-ink)',
                fontWeight: activeTab === 'orders' ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Package size={20} />
              Đơn hàng của tôi
            </button>
            <button
              onClick={() => setActiveTab('profile')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--rounded-sm)',
                border: 'none',
                backgroundColor: activeTab === 'profile' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                color: activeTab === 'profile' ? 'var(--color-primary)' : 'var(--color-ink)',
                fontWeight: activeTab === 'profile' ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <UserIcon size={20} />
              Thông tin cá nhân
            </button>
            <button
              onClick={() => setActiveTab('wishlist')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--rounded-sm)',
                border: 'none',
                backgroundColor: activeTab === 'wishlist' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                color: activeTab === 'wishlist' ? 'var(--color-primary)' : 'var(--color-ink)',
                fontWeight: activeTab === 'wishlist' ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Heart size={20} />
              Sản phẩm yêu thích
            </button>
            <button
              onClick={() => setActiveTab('security')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 16px',
                borderRadius: 'var(--rounded-sm)',
                border: 'none',
                backgroundColor: activeTab === 'security' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                color: activeTab === 'security' ? 'var(--color-primary)' : 'var(--color-ink)',
                fontWeight: activeTab === 'security' ? 600 : 400,
                textAlign: 'left',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Shield size={20} />
              Bảo mật
            </button>
          </nav>
        </div>

        {/* Content Area */}
        <div className="lg:col-span-3">
          {activeTab === 'orders' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                Đơn hàng của tôi
              </h2>
              
              {userOrders.length === 0 ? (
                <EmptyState
                  icon={<Package size={48} />}
                  title="Chưa có đơn hàng"
                  description="Bạn chưa thực hiện đơn hàng nào."
                  action={{ label: 'Mua sắm ngay', href: '/products' }}
                />
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                  {userOrders.map(order => (
                    <div
                      key={order.id}
                      className="tile-light"
                      style={{
                        padding: 'var(--space-lg)',
                        borderRadius: 'var(--rounded-lg)',
                        border: '1px solid var(--color-hairline)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid var(--color-divider-soft)' }}>
                        <div>
                          <div style={{ fontWeight: 600 }}>{order.id}</div>
                          <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>
                            {new Intl.DateTimeFormat('vi-VN').format(new Date(order.createdAt))}
                          </div>
                        </div>
                        <div>
                          <StatusBadge status={order.status} />
                        </div>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 16 }}>
                        {order.items.map((item: any, i: number) => (
                          <div key={i} style={{ display: 'flex', gap: 12 }}>
                            <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 'var(--rounded-xs)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-canvas-parchment)' }}>
                              <Image 
                                src={item.imageUrl || item.thumbnail} 
                                alt={item.imageAlt || item.name} 
                                fill 
                                style={{ objectFit: 'cover' }} 
                                onError={(e) => {
                                  const target = e.target as HTMLImageElement;
                                  if (target.src !== item.thumbnail && target.src !== 'https://placehold.co/800') {
                                     target.src = item.thumbnail || 'https://placehold.co/800';
                                     target.srcset = '';
                                  }
                                }}
                              />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 'var(--text-caption-strong-size)', fontWeight: 600 }}>{item.name}</div>
                              <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-80)' }}>
                                {item.variant} | SL: {item.quantity}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTop: '1px solid var(--color-divider-soft)' }}>
                        <span style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>
                          Tổng tiền:
                        </span>
                        <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
                        </span>
                      </div>
                      
                      <div style={{ marginTop: 16, display: 'flex', justifyContent: 'flex-end' }}>
                        <Button variant="ghost" href={`/order/${order.id}`}>Xem chi tiết</Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                Thông tin cá nhân
              </h2>
              <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  <Input label="Họ tên" value={user.name} readOnly />
                  <Input label="Số điện thoại" value={user.phone} readOnly />
                  <Input label="Email" value={user.email} readOnly />
                </div>
                <div style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'center' }}>
                  <Button variant="secondary">Cập nhật thông tin</Button>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div>
              <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
                Sản phẩm yêu thích
              </h2>
              <EmptyState
                icon={<Heart size={48} />}
                title="Danh sách trống"
                description="Bạn chưa lưu sản phẩm nào vào danh sách yêu thích."
                action={{ label: 'Khám phá sản phẩm', href: '/products' }}
              />
            </div>
          )}

          {activeTab === 'security' && (
            <SecurityTab />
          )}
        </div>
      </div>
    </div>
  );
}

function SecurityTab() {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (newPassword !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp.');
      return;
    }

    if (newPassword.length < 8) {
      setError('Mật khẩu mới phải có ít nhất 8 ký tự.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();

      if (res.ok) {
        setMessage('Đổi mật khẩu thành công!');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setError(data.error || 'Đổi mật khẩu thất bại.');
      }
    } catch (err) {
      setError('Đã có lỗi xảy ra. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Bảo mật
      </h2>
      <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
        <h3 style={{ fontSize: 'var(--text-title-size)', fontWeight: 600, marginBottom: 8 }}>Mật khẩu</h3>
        <p style={{ color: 'var(--color-ink-muted-80)', marginBottom: 24 }}>Cập nhật mật khẩu để bảo vệ tài khoản của bạn.</p>
        
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

        <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
          <Input 
            label="Mật khẩu hiện tại" 
            type="password" 
            placeholder="Nhập mật khẩu hiện tại" 
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            required
          />
          <Input 
            label="Mật khẩu mới" 
            type="password" 
            placeholder="Nhập mật khẩu mới" 
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
          />
          <Input 
            label="Xác nhận mật khẩu mới" 
            type="password" 
            placeholder="Nhập lại mật khẩu mới" 
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
          <Button variant="primary" type="submit" loading={loading} style={{ marginTop: 8 }}>
            Đổi mật khẩu
          </Button>
        </form>

        <hr style={{ margin: '32px 0', border: 'none', borderTop: '1px solid var(--color-hairline)' }} />

        <h3 style={{ fontSize: 'var(--text-title-size)', fontWeight: 600, marginBottom: 8 }}>Bạn quên mật khẩu?</h3>
        <p style={{ color: 'var(--color-ink-muted-80)', marginBottom: 24 }}>Nếu bạn không nhớ mật khẩu hiện tại, bạn có thể yêu cầu đặt lại mật khẩu qua email.</p>
        <Button variant="outline" type="button" onClick={() => router.push('/forgot-password')}>Quên mật khẩu?</Button>
      </div>
    </div>
  );
}
