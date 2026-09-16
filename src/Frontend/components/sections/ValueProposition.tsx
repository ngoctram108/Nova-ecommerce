'use client';

import React from 'react';
import { Package, Truck, ShieldCheck, Leaf } from 'lucide-react';
import { Input, Button } from '@/Frontend/components/ui';
import { useLocale } from '@/Frontend/contexts/LocaleContext';

export default function ValueProposition() {
  const { t } = useLocale();

  const values = [
    {
      icon: <Leaf size={32} strokeWidth={1.5} />,
      title: t.home.sustainableTitle,
      desc: t.home.sustainableDesc,
    },
    {
      icon: <ShieldCheck size={32} strokeWidth={1.5} />,
      title: t.home.timelessTitle,
      desc: t.home.timelessDesc,
    },
    {
      icon: <Truck size={32} strokeWidth={1.5} />,
      title: t.home.shippingTitle,
      desc: t.home.shippingDesc,
    },
    {
      icon: <Package size={32} strokeWidth={1.5} />,
      title: t.home.returnsTitle,
      desc: t.home.returnsDesc,
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
            {t.home.newsletterTitle}
          </h2>
          <p
            style={{
              fontSize: 'var(--text-body-size)',
              color: 'var(--color-ink-muted-80)',
              marginBottom: 8,
              maxWidth: 500,
            }}
          >
            {t.home.newsletterDesc}
          </p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Mock submit
              alert(t.home.newsletterSuccess);
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
                placeholder={t.home.newsletterPlaceholder}
                required
                aria-label={t.home.newsletterPlaceholder}
              />
            </div>
            <Button variant="primary" type="submit">
              {t.home.newsletterButton}
            </Button>
          </form>
        </div>
      </div>
    </section>
  );
}
