'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/Frontend/contexts/CartContext';
import { Button, EmptyState } from '@/Frontend/components/ui';
import { ShoppingBag, Trash2 } from 'lucide-react';

export default function CartPage() {
  const { items, itemCount, subtotal, updateQuantity, removeItem } = useCart();

  if (itemCount === 0) {
    return (
      <div className="container section" style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <EmptyState
          icon={<ShoppingBag size={48} />}
          title="Giỏ hàng trống"
          description="Bạn chưa có sản phẩm nào trong giỏ hàng. Khám phá các bộ sưu tập mới của chúng tôi."
          action={{ label: 'Tiếp tục mua sắm', href: '/products' }}
        />
      </div>
    );
  }

  return (
    <div className="container section" style={{ minHeight: '80vh' }}>
      <h1 className="text-display-lg" style={{ marginBottom: 'var(--space-xxl)' }}>
        Giỏ hàng của bạn
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xxl)' }} className="lg:grid-cols-12">
        {/* Cart Items */}
        <div className="lg:col-span-8" style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div
            style={{
              display: 'none',
              paddingBottom: 16,
              borderBottom: '1px solid var(--color-hairline)',
              color: 'var(--color-ink-muted-80)',
              fontSize: 'var(--text-caption-size)',
              textTransform: 'uppercase',
              letterSpacing: 1,
            }}
            className="md:grid md:grid-cols-12 gap-4"
          >
            <div className="col-span-6">Sản phẩm</div>
            <div className="col-span-2 text-center">Số lượng</div>
            <div className="col-span-3 text-right">Tổng cộng</div>
            <div className="col-span-1"></div>
          </div>

          {items.map((item) => (
            <div
              key={`${item.productId}-${item.variantId || 'base'}`}
              style={{
                display: 'grid',
                gap: 16,
                paddingBottom: 24,
                borderBottom: '1px solid var(--color-hairline)',
                alignItems: 'center',
              }}
              className="grid-cols-1 md:grid-cols-12"
            >
              {/* Product Info */}
              <div className="md:col-span-6" style={{ display: 'flex', gap: 16 }}>
                <Link href={`/product/${item.productId}`} style={{ flexShrink: 0 }}>
                  <div
                    style={{
                      position: 'relative',
                      width: 100,
                      height: 100,
                      borderRadius: 'var(--rounded-sm)',
                      overflow: 'hidden',
                      backgroundColor: 'var(--color-canvas-parchment)',
                    }}
                  >
                    <Image
                      src={item.imageUrl || item.thumbnail}
                      alt={item.imageAlt || item.name}
                      fill
                      sizes="100px"
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
                </Link>
                <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <Link
                    href={`/product/${item.productId}`}
                    style={{
                      fontSize: 'var(--text-body-strong-size)',
                      fontWeight: 600,
                      color: 'var(--color-ink)',
                      marginBottom: 4,
                    }}
                    className="hover:underline"
                  >
                    {item.name}
                  </Link>
                  {item.variant && (
                    <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', marginBottom: 8 }}>
                      {item.variant}
                    </div>
                  )}
                  <div className="md:hidden" style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price)}
                  </div>
                </div>
              </div>

              {/* Quantity */}
              <div className="md:col-span-2" style={{ display: 'flex', justifyContent: 'center' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid var(--color-hairline)',
                    borderRadius: 'var(--rounded-sm)',
                    overflow: 'hidden',
                    height: 36,
                  }}
                >
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity - 1)}
                    style={{
                      width: 32,
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'var(--color-canvas)',
                      cursor: 'pointer',
                      color: 'var(--color-ink)',
                    }}
                  >
                    -
                  </button>
                  <div
                    style={{
                      width: 32,
                      textAlign: 'center',
                      fontSize: 'var(--text-caption-size)',
                    }}
                  >
                    {item.quantity}
                  </div>
                  <button
                    onClick={() => updateQuantity(item.productId, item.variantId, item.quantity + 1)}
                    disabled={item.quantity >= item.maxStock}
                    style={{
                      width: 32,
                      height: '100%',
                      border: 'none',
                      backgroundColor: 'var(--color-canvas)',
                      cursor: item.quantity >= item.maxStock ? 'not-allowed' : 'pointer',
                      color: 'var(--color-ink)',
                    }}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Total Price */}
              <div
                className="hidden md:block md:col-span-3 text-right"
                style={{
                  fontSize: 'var(--text-body-strong-size)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                }}
              >
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
                  item.price * item.quantity
                )}
              </div>

              {/* Remove */}
              <div className="md:col-span-1" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button
                  onClick={() => removeItem(item.productId, item.variantId)}
                  aria-label="Xóa sản phẩm"
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--color-ink-muted-48)',
                    padding: 8,
                  }}
                  className="hover:text-red-500"
                >
                  <Trash2 size={20} />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-4">
          <div
            style={{
              backgroundColor: 'var(--color-surface-pearl)',
              padding: 'var(--space-xl)',
              borderRadius: 'var(--rounded-lg)',
              position: 'sticky',
              top: 'calc(var(--global-nav-height) + 24px)',
            }}
          >
            <h2
              style={{
                fontSize: 'var(--text-lead-size)',
                fontWeight: 600,
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-lg)',
              }}
            >
              Tóm tắt đơn hàng
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Tạm tính ({itemCount} sản phẩm)</span>
                <span style={{ fontWeight: 600, color: 'var(--color-ink)' }}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Phí giao hàng</span>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Chưa tính</span>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                paddingTop: 16,
                borderTop: '1px solid var(--color-divider-soft)',
                marginBottom: 32,
              }}
            >
              <span style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600, color: 'var(--color-ink)' }}>
                Tổng cộng
              </span>
              <span style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600, color: 'var(--color-ink)' }}>
                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(subtotal)}
              </span>
            </div>

            <Button variant="store-hero" fullWidth href="/checkout">
              Tiến hành thanh toán
            </Button>
            
            <p style={{ marginTop: 16, fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-48)', textAlign: 'center' }}>
              Phí giao hàng và thuế (nếu có) sẽ được tính tại bước thanh toán.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
