'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = [
    {
      title: 'Sản phẩm',
      links: [
        { name: 'Hàng mới về', href: '/products?sort=newest' },
        { name: 'Bán chạy', href: '/products?sort=recommended' },
        { name: 'Sale', href: '/products?badge=SALE' },
        { name: 'Tất cả sản phẩm', href: '/products' },
      ],
    },
    {
      title: 'Hỗ trợ khách hàng',
      links: [
        { name: 'Trung tâm trợ giúp', href: '/help' },
        { name: 'Giao hàng & Nhận hàng', href: '/shipping' },
        { name: 'Chính sách đổi trả', href: '/returns' },
        { name: 'Bảo hành', href: '/warranty' },
      ],
    },
    {
      title: 'Về NORA',
      links: [
        { name: 'Câu chuyện thương hiệu', href: '/about' },
        { name: 'Tuyển dụng', href: '/careers' },
        { name: 'Phát triển bền vững', href: '/sustainability' },
        { name: 'Liên hệ', href: '/contact' },
      ],
    },
  ];

  return (
    <footer
      style={{
        backgroundColor: 'var(--color-surface-pearl)',
        borderTop: '1px solid var(--color-divider-soft)',
        paddingTop: 'var(--space-xxl)',
        paddingBottom: 'var(--space-lg)',
        color: 'var(--color-ink-muted-80)',
      }}
    >
      <div className="container">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: 'var(--space-xl)',
            marginBottom: 'var(--space-xxl)',
          }}
        >
          {/* Brand Info */}
          <div>
            <h3
              style={{
                fontSize: 18,
                fontWeight: 700,
                letterSpacing: 2,
                color: 'var(--color-ink)',
                marginBottom: 'var(--space-md)',
              }}
            >
              NORA
            </h3>
            <p
              style={{
                fontSize: 'var(--text-caption-size)',
                lineHeight: 1.6,
                marginBottom: 'var(--space-md)',
                maxWidth: 280,
              }}
            >
              Thương hiệu thời trang và phong cách sống lấy cảm hứng từ thiết kế tối giản Bắc Âu. Đơn giản, bền bỉ và thanh lịch.
            </p>
            <div style={{ display: 'flex', gap: 16 }}>
              <a href="https://example.com" aria-label="Website" style={{ color: 'inherit' }}>
                <Globe size={20} />
              </a>
              <a href="mailto:hello@nora.com" aria-label="Email" style={{ color: 'inherit' }}>
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          {footerLinks.map((section) => (
            <div key={section.title}>
              <h4
                style={{
                  fontSize: 'var(--text-caption-strong-size)',
                  fontWeight: 600,
                  color: 'var(--color-ink)',
                  marginBottom: 'var(--space-md)',
                }}
              >
                {section.title}
              </h4>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      style={{
                        fontSize: 'var(--text-caption-size)',
                        color: 'inherit',
                        transition: 'color var(--transition-fast)',
                      }}
                      onMouseEnter={(e) => {
                        (e.target as HTMLElement).style.color = 'var(--color-ink)';
                      }}
                      onMouseLeave={(e) => {
                        (e.target as HTMLElement).style.color = 'inherit';
                      }}
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            paddingTop: 'var(--space-lg)',
            borderTop: '1px solid var(--color-divider-soft)',
            fontSize: 'var(--text-fine-print-size)',
          }}
          className="md:flex-row md:items-center md:justify-between"
        >
          <p>© {currentYear} NORA. All rights reserved.</p>
          <div style={{ display: 'flex', gap: 24 }}>
            <Link href="/privacy">Chính sách bảo mật</Link>
            <Link href="/terms">Điều khoản sử dụng</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
