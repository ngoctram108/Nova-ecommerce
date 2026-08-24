'use client';

import React, { useState } from 'react';
import { Button, Input } from '@/Frontend/components/ui';

interface InventoryAdjustmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: any; // from the API
  onSuccess: () => void;
}

export default function InventoryAdjustmentModal({
  isOpen,
  onClose,
  inventory,
  onSuccess
}: InventoryAdjustmentModalProps) {
  const [type, setType] = useState('IMPORT');
  const [quantity, setQuantity] = useState(0);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !inventory) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (quantity <= 0) {
      setError('Số lượng phải lớn hơn 0');
      return;
    }

    let quantityChange = quantity;
    if (type === 'SALE' || type === 'ADJUSTMENT_DECREASE') {
      quantityChange = -quantity;
    }

    if (inventory.stockQuantity + quantityChange < 0) {
      setError('Số lượng tồn không thể nhỏ hơn 0');
      return;
    }

    setIsSubmitting(true);
    try {
      const dbType = type === 'ADJUSTMENT_DECREASE' ? 'ADJUSTMENT' : type;
      const res = await fetch(`/api/admin/inventory/${inventory.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type: dbType, quantityChange, reason })
      });
      const data = await res.json();
      
      if (res.ok && data.success) {
        onSuccess();
        onClose();
        setQuantity(0);
        setReason('');
      } else {
        setError(data.error || 'Đã có lỗi xảy ra');
      }
    } catch (err) {
      setError('Lỗi kết nối');
    } finally {
      setIsSubmitting(false);
    }
  };

  const newStock = inventory.stockQuantity + (
    (type === 'SALE' || type === 'ADJUSTMENT_DECREASE') ? -quantity : quantity
  );

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    }}>
      <div style={{
        backgroundColor: '#fff', borderRadius: 'var(--rounded-lg)',
        padding: 'var(--space-xl)', width: '100%', maxWidth: 500,
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
      }}>
        <h3 style={{ fontSize: 'var(--text-title-size)', fontWeight: 600, marginBottom: 8 }}>
          Điều chỉnh tồn kho
        </h3>
        <p style={{ color: 'var(--color-ink-muted-80)', marginBottom: 24 }}>
          {inventory.product.name} {inventory.variant?.name !== 'Default' ? `- ${inventory.variant.name}` : ''}
        </p>

        {error && (
          <div style={{ padding: 12, backgroundColor: 'var(--color-danger)', color: '#fff', borderRadius: 4, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Loại điều chỉnh</label>
            <select 
              value={type} 
              onChange={e => setType(e.target.value)}
              style={{ width: '100%', padding: '10px 12px', borderRadius: 'var(--rounded-sm)', border: '1px solid var(--color-hairline)' }}
            >
              <option value="IMPORT">Nhập Hàng (+)</option>
              <option value="RETURN">Khách Trả Hàng (+)</option>
              <option value="ADJUSTMENT">Khớp Kho / Thêm (+)</option>
              <option value="ADJUSTMENT_DECREASE">Khớp Kho / Hao Hụt (-)</option>
              <option value="SALE">Xuất Bán (-)</option>
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Số lượng</label>
            <Input 
              type="number" 
              min={1}
              value={quantity || ''} 
              onChange={e => setQuantity(parseInt(e.target.value) || 0)} 
              placeholder="0"
            />
          </div>

          <div style={{ padding: 16, backgroundColor: 'var(--color-surface-pearl)', borderRadius: 'var(--rounded-sm)', display: 'flex', justifyContent: 'space-between' }}>
            <span>Tồn sau điều chỉnh:</span>
            <span style={{ fontWeight: 600, color: newStock < 0 ? 'var(--color-danger)' : 'var(--color-ink)' }}>
              {inventory.stockQuantity} &rarr; {newStock}
            </span>
          </div>

          <div>
            <label style={{ display: 'block', fontWeight: 500, marginBottom: 8 }}>Lý do (Tùy chọn)</label>
            <Input 
              value={reason} 
              onChange={e => setReason(e.target.value)} 
              placeholder="VD: Nhập lô hàng mới..."
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 16 }}>
            <Button variant="outline" type="button" onClick={onClose}>Hủy</Button>
            <Button variant="store-hero" type="submit" loading={isSubmitting}>Lưu thay đổi</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
