'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button, Input } from '@/components/ui';
import { useToast } from '@/components/ui/Toast';
import { useProductImage } from '@/hooks/useProductImage';

function AdminProductRow({ product }: { product: any }) {
  const { imageUrl, imageAlt } = useProductImage(product);
  const [manualUrl, setManualUrl] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const { success, error } = useToast();

  const handleSearchImageAgain = async () => {
    setIsUpdating(true);
    try {
      const res = await fetch('/api/images/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, query: `${product.name} ${product.brand} ${product.category}`, force: true })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        success('Cập nhật ảnh thành công!');
        window.location.reload();
      } else {
        error(resData.error || 'Cập nhật ảnh thất bại.');
      }
    } catch (err) {
      error('Lỗi kết nối.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUpdateManualImage = async () => {
    if (!manualUrl) return;
    setIsUpdating(true);
    try {
      const res = await fetch('/api/images/search', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId: product.id, imageUrl: manualUrl })
      });
      const resData = await res.json();
      if (res.ok && resData.success) {
        success('Cập nhật ảnh thủ công thành công!');
        window.location.reload();
      } else {
        error(resData.error || 'Cập nhật ảnh thất bại.');
      }
    } catch (err) {
      error('Lỗi kết nối.');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <tr style={{ borderBottom: '1px solid var(--color-divider-soft)' }}>
      <td style={{ padding: 16 }}>
         <div style={{ position: 'relative', width: 64, height: 64, borderRadius: 'var(--rounded-xs)', overflow: 'hidden', backgroundColor: 'var(--color-surface-pearl)' }}>
           <Image 
             src={imageUrl || product.thumbnail} 
             alt={imageAlt || product.name} 
             fill 
             style={{ objectFit: 'cover' }} 
             onError={(e) => {
               const target = e.target as HTMLImageElement;
               // Fallback to original thumbnail or placeholder if the current src fails
               if (target.src !== product.thumbnail && target.src !== 'https://placehold.co/800') {
                  target.src = product.thumbnail || 'https://placehold.co/800';
                  target.srcset = '';
               }
             }}
           />
         </div>
      </td>
      <td style={{ padding: 16 }}>
         <div style={{ fontWeight: 600 }}>{product.name}</div>
         <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>{product.brand} - {product.category}</div>
      </td>
      <td style={{ padding: 16 }}>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSearchImageAgain}
          loading={isUpdating}
        >
          Tự động tìm ảnh
        </Button>
      </td>
      <td style={{ padding: 16 }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <Input 
             placeholder="https://..." 
             value={manualUrl} 
             onChange={(e) => setManualUrl(e.target.value)}
          />
          <Button 
             variant="secondary" 
             size="sm"
             onClick={handleUpdateManualImage}
             loading={isUpdating}
             disabled={!manualUrl}
          >
             Lưu
          </Button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const [data, setData] = useState<{products: any[]} | null>(null);
  
  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(res => res.json())
      .then(resData => {
        if (!resData.error) {
          setData(resData);
        }
      })
      .catch(console.error);
  }, []);

  if (!data) return <div>Đang tải...</div>;

  return (
    <div>
      <h2 style={{ fontSize: 'var(--text-lead-size)', fontWeight: 600, marginBottom: 'var(--space-lg)' }}>
        Quản lý sản phẩm
      </h2>
      <div className="tile-light" style={{ borderRadius: 'var(--rounded-lg)', border: '1px solid var(--color-hairline)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ backgroundColor: 'var(--color-surface-pearl)', borderBottom: '1px solid var(--color-divider-soft)' }}>
            <tr>
              <th style={{ padding: 16, fontWeight: 600 }}>Ảnh hiện tại</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Sản phẩm</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Cập nhật tự động</th>
              <th style={{ padding: 16, fontWeight: 600 }}>Nhập URL thủ công</th>
            </tr>
          </thead>
          <tbody>
            {data.products.map(product => (
              <AdminProductRow key={product.id} product={product} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
