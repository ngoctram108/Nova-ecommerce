import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui';
import OrderStatusSelect from '@/components/admin/OrderStatusSelect';
import { ArrowLeft } from 'lucide-react';

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id },
    include: { 
      items: true, 
      user: true,
      statusHistory: { orderBy: { createdAt: 'desc' } }
    }
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
    <div className="container section" style={{ minHeight: '80vh' }}>
      <div style={{ marginBottom: 'var(--space-xl)' }}>
        <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--color-ink-muted-80)' }} className="hover:text-primary">
          <ArrowLeft size={16} />
          Quay lại danh sách đơn hàng
        </Link>
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 'var(--space-xxl)' }}>
        <h1 className="text-display-lg">
          Chi tiết đơn hàng {order.id}
        </h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ width: 200 }}>
            <OrderStatusSelect orderId={order.id} currentStatus={order.status} />
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 'var(--space-xxl)' }} className="lg:grid-cols-3">
        {/* Left Col: Order Info */}
        <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          {/* Items */}
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Sản phẩm</h2>
            
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
                <tr>
                  <th style={{ paddingBottom: 16, fontWeight: 600 }}>Sản phẩm</th>
                  <th style={{ paddingBottom: 16, fontWeight: 600, textAlign: 'center' }}>Số lượng</th>
                  <th style={{ paddingBottom: 16, fontWeight: 600, textAlign: 'right' }}>Đơn giá</th>
                  <th style={{ paddingBottom: 16, fontWeight: 600, textAlign: 'right' }}>Thành tiền</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, index) => (
                  <tr key={index} style={{ borderBottom: index === order.items.length - 1 ? 'none' : '1px solid var(--color-divider-soft)' }}>
                    <td style={{ paddingTop: 16, paddingBottom: 16 }}>
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ position: 'relative', width: 48, height: 48, borderRadius: 'var(--rounded-xs)', overflow: 'hidden', flexShrink: 0, backgroundColor: 'var(--color-canvas-parchment)' }}>
                          <Image src={item.thumbnail} alt={item.name} fill style={{ objectFit: 'cover' }} />
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                          <div style={{ fontWeight: 600 }}>{item.name}</div>
                          {item.variantName && <div style={{ fontSize: 'var(--text-fine-print-size)', color: 'var(--color-ink-muted-80)' }}>{item.variantName}</div>}
                        </div>
                      </div>
                    </td>
                    <td style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'right' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice)}</td>
                    <td style={{ paddingTop: 16, paddingBottom: 16, textAlign: 'right', fontWeight: 600 }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.unitPrice * item.quantity)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginTop: 24, paddingTop: 24, borderTop: '1px solid var(--color-divider-soft)', alignItems: 'flex-end' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Tạm tính:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.subtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: 300 }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Phí giao hàng:</span>
                <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.shippingFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', width: 300, fontSize: 'var(--text-lead-size)', fontWeight: 600, marginTop: 8 }}>
                <span>Tổng cộng:</span>
                <span style={{ color: 'var(--color-primary)' }}>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: Customer Info */}
        <div className="lg:col-span-1" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xl)' }}>
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Khách hàng</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <div style={{ fontWeight: 600 }}>{shippingData.fullName || order.user?.name || 'Guest'}</div>
                <div style={{ color: 'var(--color-ink-muted-80)' }}>{shippingData.email || order.user?.email}</div>
                <div style={{ color: 'var(--color-ink-muted-80)' }}>{shippingData.phone || order.user?.phone}</div>
              </div>
              
              <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)' }} />
              
              <div>
                <div style={{ fontWeight: 600, marginBottom: 8 }}>Địa chỉ giao hàng</div>
                <div style={{ color: 'var(--color-ink-muted-80)', lineHeight: 1.6 }}>
                  {shippingData.address}<br />
                  {shippingData.district && `${shippingData.district}, `}{shippingData.city}
                </div>
              </div>
              
              {shippingData.note && (
                <>
                  <hr style={{ border: 'none', borderTop: '1px solid var(--color-divider-soft)' }} />
                  <div>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>Ghi chú</div>
                    <div style={{ color: 'var(--color-ink-muted-80)', fontStyle: 'italic' }}>
                      &quot;{shippingData.note}&quot;
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
          
          <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)' }}>
            <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Thông tin thanh toán</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Phương thức:</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: 'var(--color-ink-muted-80)' }}>Trạng thái:</span>
                <span style={{ fontWeight: 600 }}>{order.paymentMethod === 'COD' ? 'Chưa thanh toán' : 'Đã thanh toán'}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* History */}
      <div className="tile-light" style={{ padding: 'var(--space-xl)', borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', marginTop: 'var(--space-xxl)' }}>
        <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>Lịch sử cập nhật</h2>
        {order.statusHistory.length === 0 ? (
          <div style={{ color: 'var(--color-ink-muted-80)' }}>Chưa có lịch sử cập nhật.</div>
        ) : (
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
                <div style={{ fontSize: 'var(--text-caption-size)' }}>Thực hiện bởi: {history.changedBy}</div>
                {history.note && (
                  <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', fontStyle: 'italic', marginTop: 4 }}>
                    Ghi chú: {history.note}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
