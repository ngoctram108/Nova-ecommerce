'use client';

import React from 'react';
import { Package, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { Input, Button } from '@/Frontend/components/ui';

export default function ValueProposition() {
  const values = [
    {
      icon: <Leaf size={32} strokeWidth={1.5} />,
      title: 'Chất liệu bền vững',
      desc: 'Chúng tôi ưu tiên sử dụng cotton hữu cơ, len merino tái chế và các vật liệu thân thiện với môi trường.',
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      title: 'Thiết kế vượt thời gian',
      desc: 'Phong cách tối giản không bao giờ lỗi mốt, dễ dàng kết hợp và sử dụng trong nhiều năm.',
    },
    {
      icon: <Truck size={32} strokeWidth={1.5} />,
      title: 'Giao hàng nhanh chóng',
      desc: 'Miễn phí giao hàng toàn quốc cho đơn hàng từ 1.000.000đ. Nhận hàng trong 2-3 ngày làm việc.',
    },
    {
      icon: <Package size={32} strokeWidth={1.5} />,
      title: 'Đổi trả dễ dàng',
      desc: 'Chính sách đổi trả miễn phí trong vòng 30 ngày nếu bạn không hoàn toàn hài lòng với sản phẩm.',
    },
  ];

  return (
    <section className="section tile-parchment">
      <div className="container">
        {/* Values Grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-section)',
          }}
        >
          {values.map((val, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  color: 'var(--color-primary)',
                  marginBottom: 8,
                }}
              >
                {val.icon}
              </div>
              <h3
                style={{
                  fontSize: 'var(--text-body-strong-size)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                }}
              >
                {val.title}
              </h3>
              <p
                style={{
                  fontSize: 'var(--text-caption-size)',
                  color: 'var(--color-ink-muted-80)',
                  lineHeight: 1.6,
                }}
              >
                {val.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Newsletter */}
        <div
          style={{
            backgroundColor: 'var(--color-canvas)',
            borderRadius: 'var(--rounded-lg)',
            padding: 'var(--space-xl)',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 16,
            boxShadow: 'var(--shadow-product)',
            maxWidth: 800,
            margin: '0 auto',
          }}
        >
          <h2
            style={{
              fontSize: 'var(--text-lead-size)',
              fontWeight: 600,
              color: 'var(--color-ink)',
            }}
          >
            Đăng ký nhận thông tin
          </h2>
          <p
            style={{
              fontSize: 'var(--text-body-size)',
              color: 'var(--color-ink-muted-80)',
              marginBottom: 8,
              maxWidth: 500,
            }}
          >
            Nhận ưu đãi 10% cho đơn hàng đầu tiên và cập nhật sớm nhất về các bộ sưu tập mới của NORA.
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Mock submit
              alert('Cảm ơn bạn đã đăng ký!');
              (e.target as HTMLFormElement).reset();
            }}
            style={{
              display: 'flex',
              width: '100%',
              maxWidth: 400,
              gap: 8,
            }}
            className="flex-col sm:flex-row"
          >
            <div style={{ flex: 1 }}>
              <Input
                type="email"
                placeholder="Địa chỉ email của bạn"
                required
                aria-label="Địa chỉ email"
              />
            </div>
            <Button variant="primary" type="submit">
              Đăng ký
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
