'use client';

import React from 'react';
import Link from 'next/link';
import { Globe, Mail } from 'lucide-react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const { t } = useLocale();

  const footerLinks = [
    {
      title: t.footer.productsTitle,
      links: [
        { name: t.footer.newArrivals, href: '/products?sort=newest' },
        { name: t.footer.bestSellers, href: '/products?sort=recommended' },
        { name: t.nav.sale, href: '/products?badge=SALE' },
        { name: t.footer.allProducts, href: '/products' },
      ],
    },
    {
      title: t.footer.supportTitle,
      links: [
        { name: t.footer.helpCenter, href: '/help' },
        { name: t.footer.shippingDelivery, href: '/shipping' },
        { name: t.footer.returnPolicy, href: '/returns' },
        { name: t.footer.warranty, href: '/warranty' },
      ],
    },
    {
      title: t.footer.aboutTitle,
      links: [
        { name: t.footer.brandStory, href: '/about' },
        { name: t.footer.careers, href: '/careers' },
        { name: t.footer.sustainability, href: '/sustainability' },
        { name: t.footer.contact, href: '/contact' },
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
              {t.footer.brandDesc}
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
            <Link href="/privacy">{t.footer.privacy}</Link>
            <Link href="/terms">{t.footer.terms}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
