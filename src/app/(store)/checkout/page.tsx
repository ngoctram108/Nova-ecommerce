'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCart } from '@/Frontend/contexts/CartContext';
import { useToast } from '@/Frontend/components/ui/Toast';
import { Button, Input, Select, EmptyState } from '@/Frontend/components/ui';
import { calculatePricingSummary } from '@/Backend/services/pricing';
import { useAuth } from '@/Frontend/contexts/AuthContext';
import { shippingAddressSchema, mockCardSchema } from '@/Shared/validation/checkout';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, itemCount, clearCart } = useCart();
  const { user, isLoading: isAuthLoading } = useAuth();
  const { error, success } = useToast();

  const [deliveryMethod, setDeliveryMethod] = useState<'STANDARD' | 'EXPRESS'>('STANDARD');
  const [paymentMethod, setPaymentMethod] = useState<'COD' | 'MOCK_CARD'>('COD');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    district: '',
    note: '',
  });

  const [cardData, setCardData] = useState({
    cardNumber: '',
    expiry: '',
    cvv: '',
    name: '',
  });

  // Calculate prices
  const pricing = calculatePricingSummary(
    items.map(i => ({ ...i, unitPrice: i.price, total: i.price * i.quantity })),
    deliveryMethod
  );

  useEffect(() => {
    // Force a sync when entering checkout to ensure everything is valid
    if (items.length > 0) {
      fetch('/api/cart/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items })
      }).catch(console.error);
    }
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear error
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleCardChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    
    // Auto-format card number
    if (e.target.name === 'cardNumber') {
      value = value.replace(/\D/g, '').slice(0, 16);
    }
    // Auto-format expiry
    if (e.target.name === 'expiry') {
      value = value.replace(/\D/g, '').slice(0, 4);
      if (value.length > 2) {
        value = `${value.slice(0, 2)}/${value.slice(2)}`;
      }
    }
    
    setCardData({ ...cardData, [e.target.name]: value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: '' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;
    
    if (!isAuthLoading && !user) {
      error('Bạn cần đăng nhập để thanh toán');
      router.push('/login');
      return;
    }

    setIsSubmitting(true);
    setErrors({});

    // Validate shipping info
    const addressValidation = shippingAddressSchema.safeParse(formData);
    if (!addressValidation.success) {
      const fieldErrors: Record<string, string> = {};
      addressValidation.error.issues.forEach((err: any) => {
        if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
      });
      setErrors(prev => ({ ...prev, ...fieldErrors }));
      error('Vui lòng kiểm tra lại thông tin giao hàng');
      setIsSubmitting(false);
      return;
    }

    // Validate card if selected
    if (paymentMethod === 'MOCK_CARD') {
      const cardValidation = mockCardSchema.safeParse(cardData);
      if (!cardValidation.success) {
        const fieldErrors: Record<string, string> = {};
        cardValidation.error.issues.forEach((err: any) => {
          if (err.path[0]) fieldErrors[err.path[0].toString()] = err.message;
        });
        setErrors(prev => ({ ...prev, ...fieldErrors }));
        error('Vui lòng kiểm tra lại thông tin thẻ');
        setIsSubmitting(false);
        return;
      }
    }

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items,
          customer: formData,
          paymentMethod,
          deliveryMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Đặt hàng thất bại');
      }

      success('Đặt hàng thành công!');
      clearCart();
      router.push(`/order/${data.id}`);
    } catch (err: any) {
      error(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (itemCount === 0) {
    return (
      <div className="container section">
        <EmptyState
          title="Giỏ hàng trống"
          description="Bạn không thể thanh toán khi giỏ hàng trống."
          action={{ label: 'Tiếp tục mua sắm', href: '/products' }}
        />
      </div>
    );
  }

  return (
    <div className="container section">
      <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-xl)' }}>
        Thanh toán
      </h1>

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xxl)' }} className="lg:grid-cols-12">
        {/* Left: Forms */}
        <div className="lg:col-span-7" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Shipping Address */}
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
              Thông tin giao hàng
            </h2>
            <div style={{ display: 'grid', gap: 16 }}>
              <Input label="Họ tên" name="fullName" value={formData.fullName} onChange={handleInputChange} error={errors.fullName} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Input label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} error={errors.email} required />
                <Input label="Số điện thoại" name="phone" value={formData.phone} onChange={handleInputChange} error={errors.phone} required />
              </div>
              <Input label="Địa chỉ" name="address" value={formData.address} onChange={handleInputChange} error={errors.address} required />
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <Select
                  label="Thành phố/Tỉnh"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  error={errors.city}
                  options={[
                    { value: 'Hồ Chí Minh', label: 'Hồ Chí Minh' },
                    { value: 'Hà Nội', label: 'Hà Nội' },
                    { value: 'Đà Nẵng', label: 'Đà Nẵng' },
                  ]}
                  placeholder="Chọn Thành phố"
                  required
                />
                <Input label="Quận/Huyện" name="district" value={formData.district} onChange={handleInputChange} error={errors.district} />
              </div>
              <Input label="Ghi chú (tùy chọn)" name="note" value={formData.note} onChange={handleInputChange} error={errors.note} />
            </div>
          </div>

          {/* Delivery Method */}
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
              Phương thức giao hàng
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  border: `1px solid ${deliveryMethod === 'STANDARD' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                  borderRadius: 'var(--rounded-sm)',
                  cursor: 'pointer',
                  backgroundColor: deliveryMethod === 'STANDARD' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                }}
              >
                <input type="radio" name="delivery" value="STANDARD" checked={deliveryMethod === 'STANDARD'} onChange={() => setDeliveryMethod('STANDARD')} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Giao hàng tiêu chuẩn</div>
                  <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Nhận hàng trong 2-3 ngày làm việc</div>
                </div>
                <div style={{ fontWeight: 600 }}>30.000 ₫</div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  border: `1px solid ${deliveryMethod === 'EXPRESS' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                  borderRadius: 'var(--rounded-sm)',
                  cursor: 'pointer',
                  backgroundColor: deliveryMethod === 'EXPRESS' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                }}
              >
                <input type="radio" name="delivery" value="EXPRESS" checked={deliveryMethod === 'EXPRESS'} onChange={() => setDeliveryMethod('EXPRESS')} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600 }}>Giao hàng hỏa tốc</div>
                  <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Nhận hàng trong vòng 24h</div>
                </div>
                <div style={{ fontWeight: 600 }}>50.000 ₫</div>
              </label>
            </div>
          </div>

          {/* Payment Method */}
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
              Phương thức thanh toán
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  border: `1px solid ${paymentMethod === 'COD' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                  borderRadius: 'var(--rounded-sm)',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'COD' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                }}
              >
                <input type="radio" name="payment" value="COD" checked={paymentMethod === 'COD'} onChange={() => setPaymentMethod('COD')} />
                <div style={{ fontWeight: 600 }}>Thanh toán khi nhận hàng (COD)</div>
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 16,
                  padding: 16,
                  border: `1px solid ${paymentMethod === 'MOCK_CARD' ? 'var(--color-primary)' : 'var(--color-hairline)'}`,
                  borderRadius: 'var(--rounded-sm)',
                  cursor: 'pointer',
                  backgroundColor: paymentMethod === 'MOCK_CARD' ? 'rgba(0, 102, 204, 0.05)' : 'transparent',
                }}
              >
                <input type="radio" name="payment" value="MOCK_CARD" checked={paymentMethod === 'MOCK_CARD'} onChange={() => setPaymentMethod('MOCK_CARD')} />
                <div style={{ fontWeight: 600 }}>Thẻ tín dụng / Ghi nợ (Mock)</div>
              </label>

              {/* Mock Card Form */}
              {paymentMethod === 'MOCK_CARD' && (
                <div style={{ marginTop: 16, display: 'grid', gap: 16, padding: 16, backgroundColor: 'var(--color-canvas-parchment)', borderRadius: 'var(--rounded-sm)' }}>
                  <Input label="Số thẻ" name="cardNumber" placeholder="1234 5678 1234 5678" value={cardData.cardNumber} onChange={handleCardChange} error={errors.cardNumber} required />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Input label="Ngày hết hạn" name="expiry" placeholder="MM/YY" value={cardData.expiry} onChange={handleCardChange} error={errors.expiry} required />
                    <Input label="CVV" name="cvv" placeholder="123" value={cardData.cvv} onChange={handleCardChange} error={errors.cvv} required />
                  </div>
                  <Input label="Tên in trên thẻ" name="name" value={cardData.name} onChange={handleCardChange} error={errors.name} required />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="lg:col-span-5">
          <div
            style={{
              backgroundColor: 'var(--color-surface-pearl)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--rounded-lg)',
              position: 'sticky',
              top: 'calc(var(--global-nav-height) + 24px)',
            }}
          >
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, color: 'var(--color-ink)', marginBottom: 'var(--space-lg)' }}>
              Đơn hàng
            </h2>

            {/* Items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24, maxHeight: 300, overflowY: 'auto' }}>
              {items.map(item => (
                <div key={`${item.productId}-${item.variantId}`} style={{ display: 'flex', gap: 12 }}>
                  <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 'var(--rounded-xs)', overflow: 'hidden', flexShrink: 0 }}>
                    <Image 
                      src={item.imageUrl || item.thumbnail} 
                      alt={item.imageAlt || item.name} 
                      fill 
                      sizes="64px" 
                      style={{ objectFit: 'cover' }} 
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (target.src !== item.thumbnail && target.src !== 'https://placehold.co/800') {
                           target.src = item.thumbnail || 'https://placehold.co/800';
                           target.srcset = '';
                        }
                      }}
                    />
                    <span style={{ position: 'absolute', top: 0, right: 0, backgroundColor: 'var(--color-ink)', color: 'var(--color-canvas)', fontSize: 10, padding: '2px 6px', borderBottomLeftRadius: 4 }}>
                      x{item.quantity}
                    </span>
                  </div>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ fontSize: 'var(--text-caption-strong-size)', fontWeight: 600, display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.name}</div>
                    {item.variant && <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-80)' }}>{item.variant}</div>}
                    <div style={{ fontSize: 'var(--text-caption-size)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}</div>
                  </div>
                </div>
              ))}
            </div>

            <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)', marginBottom: 24 }} />

            {/* Pricing */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted-80)' }}>
                <span>Tạm tính</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricing.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-ink-muted-80)' }}>
                <span>Phí giao hàng</span>
                <span>{pricing.shippingFee === 0 ? 'Miễn phí' : new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricing.shippingFee)}</span>
              </div>
              {pricing.discount > 0 && (
                <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--color-success)' }}>
                  <span>Khuyến mãi</span>
                  <span>-{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricing.discount)}</span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 16, borderTop: '1px solid var(--color-divider-soft)', marginBottom: 32 }}>
              <span style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600 }}>Tổng cộng</span>
              <span style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600, color: 'var(--color-primary)' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(pricing.total)}
              </span>
            </div>

            <Button variant="store-hero" fullWidth type="submit" loading={isSubmitting}>
              Đặt hàng
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
