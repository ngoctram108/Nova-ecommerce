'use client';

import React, { useEffect, useState } from 'react';
import { Button } from '@/Frontend/components/ui';
import { X, ArrowRight, PackagePlus, PackageMinus, RefreshCw } from 'lucide-react';

interface InventoryLogDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: any;
}

export default function InventoryLogDrawer({ isOpen, onClose, inventory }: InventoryLogDrawerProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && inventory) {
      fetchLogs();
    }
  }, [isOpen, inventory]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/inventory/${inventory.id}/logs`);
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !inventory) return null;

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 1000,
      display: 'flex', justifyContent: 'flex-end'
    }}>
      <div style={{
        width: '100%', maxWidth: 480, height: '100%', backgroundColor: '#fff',
        boxShadow: '-4px 0 15px rgba(0,0,0,0.1)', display: 'flex', flexDirection: 'column'
      }}>
        {/* Header */}
        <div style={{ padding: '24px 24px 16px', borderBottom: '1px solid var(--color-hairline)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 600, marginBottom: 4 }}>Lịch sử tồn kho</h3>
            <p style={{ color: 'var(--color-ink-muted-80)', fontSize: 14 }}>
              {inventory.product.name} {inventory.variant?.name !== 'Default' ? `- ${inventory.variant.name}` : ''}
            </p>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 8 }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--color-ink-muted-80)', padding: 40 }}>Đang tải...</div>
          ) : logs.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--color-ink-muted-80)', padding: 40 }}>Chưa có lịch sử thay đổi</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              {logs.map(log => {
                const isPositive = log.quantityChange > 0;
                const Icon = isPositive ? PackagePlus : (log.type === 'ADJUSTMENT' || log.type === 'SALE' ? PackageMinus : RefreshCw);
                const color = isPositive ? 'var(--color-success)' : (log.type === 'SALE' ? 'var(--color-ink-muted-80)' : 'var(--color-warning)');
                
                return (
                  <div key={log.id} style={{ display: 'flex', gap: 16 }}>
                    <div style={{
                      width: 40, height: 40, borderRadius: '50%', backgroundColor: 'var(--color-surface-pearl)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0
                    }}>
                      <Icon size={20} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                        <span style={{ fontWeight: 600 }}>{log.type}</span>
                        <span style={{ fontSize: 13, color: 'var(--color-ink-muted-80)' }}>
                          {new Date(log.createdAt).toLocaleString('vi-VN')}
                        </span>
                      </div>
                      <div style={{ fontSize: 14, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontWeight: 600, color }}>
                          {isPositive ? '+' : ''}{log.quantityChange}
                        </span>
                        <span style={{ color: 'var(--color-hairline)' }}>|</span>
                        <span style={{ color: 'var(--color-ink-muted-80)' }}>
                          {log.stockBefore} <ArrowRight size={12} style={{ display: 'inline', margin: '0 4px', verticalAlign: 'middle' }} /> {log.stockAfter}
                        </span>
                      </div>
                      {log.reason && (
                        <div style={{ fontSize: 13, color: 'var(--color-ink-muted-80)', backgroundColor: 'var(--color-surface-pearl)', padding: '6px 10px', borderRadius: 4, marginTop: 8 }}>
                          {log.reason}
                        </div>
                      )}
                      <div style={{ fontSize: 12, color: 'var(--color-ink-muted-80)', marginTop: 8 }}>
                        Thực hiện bởi: {log.createdByName}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
