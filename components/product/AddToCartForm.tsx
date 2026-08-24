'use client';

import React, { useState } from 'react';
import { Product } from '@/lib/types';
import { useCart } from '@/lib/contexts/CartContext';
import { Button } from '@/components/ui';
import { useProductImage } from '@/hooks/useProductImage';

export default function AddToCartForm({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(
    product.variants && product.variants.length > 0 ? product.variants[0].id : undefined
  );
  
  const { addItem } = useCart();
  const { imageUrl, imageAlt } = useProductImage(product);

  const variant = product.variants?.find((v) => v.id === selectedVariant);
  const currentStock = variant ? variant.stock : product.stock;
  const currentPrice = variant?.price ?? product.price;
  const isOutOfStock = currentStock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      variantId: selectedVariant,
      name: product.name,
      thumbnail: product.thumbnail,
      imageUrl,
      imageAlt,
      variant: variant?.name,
      price: currentPrice,
      quantity,
      maxStock: currentStock,
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Price */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12 }}>
        <span
          style={{
            fontSize: 'var(--text-display-md-size)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1,
          }}
        >
          {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
            currentPrice
          )}
        </span>
        {product.compareAt && (
          <span
            style={{
              fontSize: 'var(--text-body-size)',
              color: 'var(--color-ink-muted-48)',
              textDecoration: 'line-through',
              marginBottom: 4,
            }}
          >
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(
              product.compareAt
            )}
          </span>
        )}
      </div>

      {/* Variants (e.g. Size/Color combo) */}
      {product.variants && product.variants.length > 0 && (
        <div>
          <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600, marginBottom: 12 }}>
            Tùy chọn
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {product.variants.map((v) => {
              const isSelected = selectedVariant === v.id;
              const isVOutOfStock = v.stock === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariant(v.id)}
                  disabled={isVOutOfStock}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 'var(--rounded-sm)',
                    border: isSelected ? '2px solid var(--color-primary)' : '1px solid var(--color-hairline)',
                    backgroundColor: isSelected ? 'rgba(0, 102, 204, 0.05)' : 'var(--color-canvas)',
                    color: isVOutOfStock ? 'var(--color-ink-muted-48)' : 'var(--color-ink)',
                    fontWeight: isSelected ? 600 : 400,
                    cursor: isVOutOfStock ? 'not-allowed' : 'pointer',
                    transition: 'all var(--transition-fast)',
                    opacity: isVOutOfStock ? 0.5 : 1,
                  }}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Quantity & Add to Cart */}
      <div style={{ display: 'flex', gap: 16 }}>
        {/* Quantity selector */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            border: '1px solid var(--color-hairline)',
            borderRadius: 'var(--rounded-sm)',
            overflow: 'hidden',
          }}
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            style={{
              width: 40,
              height: 48,
              border: 'none',
              backgroundColor: 'var(--color-canvas)',
              cursor: quantity <= 1 || isOutOfStock ? 'not-allowed' : 'pointer',
              color: 'var(--color-ink)',
              fontSize: 18,
            }}
          >
            -
          </button>
          <div
            style={{
              width: 40,
              textAlign: 'center',
              fontWeight: 600,
            }}
          >
            {quantity}
          </div>
          <button
            onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
            disabled={quantity >= currentStock || isOutOfStock}
            style={{
              width: 40,
              height: 48,
              border: 'none',
              backgroundColor: 'var(--color-canvas)',
              cursor: quantity >= currentStock || isOutOfStock ? 'not-allowed' : 'pointer',
              color: 'var(--color-ink)',
              fontSize: 18,
            }}
          >
            +
          </button>
        </div>

        {/* Add button */}
        <div style={{ flex: 1 }}>
          <Button
            variant="store-hero"
            fullWidth
            onClick={handleAddToCart}
            disabled={isOutOfStock}
          >
            {isOutOfStock ? 'Hết hàng' : 'Thêm vào giỏ hàng'}
          </Button>
        </div>
      </div>
      
      {currentStock > 0 && currentStock <= 5 && (
        <p style={{ color: 'var(--color-warning)', fontSize: 'var(--text-caption-size)' }}>
          Chỉ còn {currentStock} sản phẩm trong kho!
        </p>
      )}
    </div>
  );
}
