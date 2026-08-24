import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import { StatusBadge } from '@/components/ui';
import OrderTimeline from '@/components/store/OrderTimeline';

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true, statusHistory: { orderBy: { createdAt: 'desc' } } }
  });

  if (!order) {
    notFound();
  }

  const shippingData = JSON.parse(order.shippingData || '{}');

  const formattedDate = new Intl.DateTimeFormat('vi-VN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(new Date(order.createdAt));

  return (
    <div className="container section">
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 'var(--space-xxl)' }}>
          <CheckCircle2
            size={64}
            color="var(--color-success)"
            style={{ margin: '0 auto 16px' }}
          />
          <h1 className="text-display-lg" style={{ marginBottom: 8 }}>
            Đơn hàng của bạn
          </h1>
          <p className="text-body text-ink-muted-80">
            Cảm ơn bạn đã mua sắm tại NORA. Theo dõi trạng thái đơn hàng của bạn dưới đây.
          </p>
        </div>

        {/* Timeline */}
        <OrderTimeline status={order.status} />

        {/* Order Details Card */}
        <div
          className="tile-light"
          style={{
            padding: 'var(--space-xl)',
            borderRadius: 'var(--rounded-lg)',
            border: '1px solid var(--color-hairline)',
            display: 'flex',
            flexDirection: 'column',
            gap: 24,
            marginBottom: 'var(--space-xxl)'
          }}
        >
          {/* Order Info */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Mã đơn hàng</div>
              <div style={{ fontWeight: 600 }}>{order.id}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Ngày đặt</div>
              <div style={{ fontWeight: 600 }}>{formattedDate}</div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Trạng thái</div>
              <div><StatusBadge status={order.status as any} /></div>
            </div>
            <div>
              <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>Thanh toán</div>
              <div style={{ fontWeight: 600 }}>
                {order.paymentMethod === 'COD' ? 'Khi nhận hàng' : 'Đã thanh toán'}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)' }} />

          {/* Delivery Info */}
          <div>
            <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600, marginBottom: 8 }}>
              Thông tin nhận hàng
            </h3>
            <div style={{ color: 'var(--color-ink-muted-80)', lineHeight: 1.6 }}>
              <div>{shippingData.fullName}</div>
              <div>{shippingData.phone}</div>
              <div>{shippingData.email}</div>
              <div>
                {shippingData.address}, {shippingData.district && `${shippingData.district}, `}
                {shippingData.city}
              </div>
            </div>
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)' }} />

          {/* Items */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600 }}>
              Sản phẩm ({order.items.length})
            </h3>
            {order.items.map((item, index) => (
              <div key={index} style={{ display: 'flex', gap: 12 }}>
                <div
                  style={{
                    position: 'relative',
                    width: 64,
                    height: 64,
                    borderRadius: 'var(--rounded-xs)',
                    overflow: 'hidden',
                    flexShrink: 0,
                    backgroundColor: 'var(--color-canvas-parchment)',
                  }}
                >
                  <Image src={item.imageUrl || item.thumbnail} alt={item.imageAlt || item.name} fill style={{ objectFit: 'cover' }} />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                  <div style={{ fontWeight: 600 }}>{item.name}</div>
                  {item.variantName && <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-80)' }}>{item.variantName}</div>}
                  <div style={{ fontSize: 'var(--text-caption-size)' }}>
                    {item.quantity} x {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)' }} />

          {/* Total */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600 }}>Tổng cộng</span>
            <span style={{ fontSize: 'var(--text-display-md-size)', fontWeight: 600, color: 'var(--color-primary)' }}>
              {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}
            </span>
          </div>
        </div>
        
        {/* Lịch sử cập nhật */}
        {order.statusHistory.length > 0 && (
          <div
            className="tile-light"
            style={{
              padding: 'var(--space-xl)',
              borderRadius: 'var(--rounded-lg)',
              border: '1px solid var(--color-hairline)',
              marginBottom: 'var(--space-xxl)'
            }}
          >
            <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600, marginBottom: 16 }}>
              Lịch sử trạng thái
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {order.statusHistory.map((history, idx) => (
                <div key={history.id} style={{ display: 'flex', flexDirection: 'column', gap: 4, paddingBottom: 16, borderBottom: idx === order.statusHistory.length - 1 ? 'none' : '1px solid var(--color-divider-soft)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div style={{ fontWeight: 600 }}>
                      {history.oldStatus} &rarr; {history.newStatus}
                    </div>
                    <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>
                      {new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(history.createdAt))}
                    </div>
                  </div>
                  {history.note && (
                    <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', fontStyle: 'italic', marginTop: 4 }}>
                      Ghi chú: {history.note}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 'var(--space-xl)' }}>
          <Link href="/products" style={{ color: 'var(--color-primary)', fontWeight: 600 }} className="hover:underline">
            Tiếp tục mua sắm →
          </Link>
        </div>
      </div>
    </div>
  );
}
