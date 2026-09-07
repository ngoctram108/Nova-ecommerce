'use client';

import React, { useState, useEffect } from 'react';
import { Product, ProductVariant } from '@/Shared/types';
import { useCart } from '@/Frontend/contexts/CartContext';
import { Button } from '@/Frontend/components/ui';
import { useProductImage } from '@/Frontend/hooks/useProductImage';

export default function AddToCartForm({ product }: { product: Product }) {
  // Determine if product has valid colors and sizes
  const hasColors = product.colors && product.colors.length > 0;
  const hasSizes = product.sizes && product.sizes.length > 0;
  const hasVariants = product.variants && product.variants.length > 0;

  const [selectedColor, setSelectedColor] = useState<string>(hasColors ? product.colors![0].name : '');
  const [selectedSize, setSelectedSize] = useState<string>(hasSizes ? product.sizes![0] : '');
  
  // If variants don't use color/size attributes (e.g. they just have names), fallback to old behavior
  const [selectedVariantId, setSelectedVariantId] = useState<string | undefined>(
    hasVariants && !hasColors && !hasSizes ? product.variants![0].id : undefined
  );

  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();
  const { imageUrl, imageAlt } = useProductImage(product);

  // Compute the matched variant based on color and size
  let matchedVariant: ProductVariant | undefined = undefined;

  if (hasVariants) {
    if (hasColors || hasSizes) {
      matchedVariant = product.variants!.find(v => {
        const attrs = v.attributes || {};
        const matchColor = !hasColors || attrs.color === selectedColor || attrs.Color === selectedColor;
        const matchSize = !hasSizes || attrs.size === selectedSize || attrs.Size === selectedSize;
        return matchColor && matchSize;
      });
    } else {
      matchedVariant = product.variants!.find(v => v.id === selectedVariantId);
    }
  }

  const currentVariantId = matchedVariant?.id || selectedVariantId;
  const currentStock = matchedVariant ? matchedVariant.stock : product.stock;
  const currentPrice = matchedVariant?.price ?? product.price;
  const isOutOfStock = currentStock === 0;

  // Reset quantity if stock changes and quantity is higher than new stock
  useEffect(() => {
    if (quantity > currentStock && currentStock > 0) {
      setQuantity(currentStock);
    } else if (currentStock === 0) {
      setQuantity(1); // Reset to 1 visually, though button will be disabled
    }
  }, [currentStock, quantity]);

  const handleAddToCart = () => {
    if (isOutOfStock) return;
    
    addItem({
      productId: product.id,
      variantId: currentVariantId,
      name: product.name,
      thumbnail: product.thumbnail,
      imageUrl,
      imageAlt,
      variant: matchedVariant?.name, // This preserves the specific variant name
      price: currentPrice,
      quantity,
      maxStock: currentStock,
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  const discountPercent = product.compareAt && product.compareAt > currentPrice 
    ? Math.round(((product.compareAt - currentPrice) / product.compareAt) * 100)
    : 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Price Section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <span
          style={{
            fontSize: 'var(--text-display-md-size)',
            fontWeight: 600,
            color: 'var(--color-ink)',
            lineHeight: 1,
          }}
        >
          {formatPrice(currentPrice)}
        </span>
        {product.compareAt && product.compareAt > currentPrice && (
          <>
            <span
              style={{
                fontSize: 'var(--text-body-size)',
                color: 'var(--color-ink-muted-48)',
                textDecoration: 'line-through',
              }}
            >
              {formatPrice(product.compareAt)}
            </span>
            <span
              style={{
                backgroundColor: 'var(--color-danger)',
                color: 'white',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: 'var(--text-caption-strong-size)',
                fontWeight: 600,
              }}
            >
              -{discountPercent}%
            </span>
          </>
        )}
      </div>

      {/* Tùy chọn (Color / Size) */}
      {hasVariants && (hasColors || hasSizes) && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Colors */}
          {hasColors && (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>
                Màu sắc: <span style={{ fontWeight: 600 }}>{selectedColor}</span>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {product.colors!.map((color) => {
                  const isSelected = selectedColor === color.name;
                  // Check if this color has any stock in any size
                  const hasStockInColor = product.variants!.some(v => {
                     const attrs = v.attributes || {};
                     const matchC = attrs.color === color.name || attrs.Color === color.name;
                     return matchC && v.stock > 0;
                  });
                  return (
                    <button
                      key={color.name}
                      onClick={() => setSelectedColor(color.name)}
                      title={color.name}
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        backgroundColor: color.hex,
                        border: isSelected ? '2px solid var(--color-ink)' : '1px solid var(--color-hairline)',
                        outline: isSelected ? '2px solid white' : 'none',
                        outlineOffset: -4,
                        cursor: 'pointer',
                        opacity: hasStockInColor ? 1 : 0.4,
                        position: 'relative',
                        boxShadow: isSelected ? '0 0 0 2px var(--color-ink)' : 'none'
                      }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Sizes */}
          {hasSizes && (
            <div>
              <div style={{ marginBottom: 8, fontWeight: 500 }}>Kích thước</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
                {product.sizes!.map((size) => {
                  const isSelected = selectedSize === size;
                  // Check stock for this specific size and the currently selected color
                  const variantForThisSize = product.variants!.find(v => {
                    const attrs = v.attributes || {};
                    const matchColor = !hasColors || attrs.color === selectedColor || attrs.Color === selectedColor;
                    const matchSize = attrs.size === size || attrs.Size === size;
                    return matchColor && matchSize;
                  });
                  const isVOutOfStock = !variantForThisSize || variantForThisSize.stock === 0;

                  return (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      disabled={isVOutOfStock}
                      style={{
                        minWidth: 48,
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
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Fallback Variants (no colors/sizes but has variants) */}
      {hasVariants && !hasColors && !hasSizes && (
        <div>
          <h3 style={{ fontSize: 'var(--text-body-strong-size)', fontWeight: 600, marginBottom: 12 }}>
            Tùy chọn
          </h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {product.variants!.map((v) => {
              const isSelected = selectedVariantId === v.id;
              const isVOutOfStock = v.stock === 0;
              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
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

      {/* Stock Status */}
      <div>
        {currentStock > 0 ? (
          <div style={{ color: 'var(--color-success)', fontSize: 'var(--text-body-strong-size)', fontWeight: 500 }}>
            {currentStock <= 5 ? `Chỉ còn ${currentStock} sản phẩm` : 'Còn hàng'}
          </div>
        ) : (
          <div style={{ color: 'var(--color-danger)', fontSize: 'var(--text-body-strong-size)', fontWeight: 500 }}>
            Hết hàng
          </div>
        )}
      </div>

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
            backgroundColor: isOutOfStock ? 'var(--color-background-muted)' : 'var(--color-canvas)',
          }}
        >
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            disabled={quantity <= 1 || isOutOfStock}
            style={{
              width: 40,
              height: 48,
              border: 'none',
              backgroundColor: 'transparent',
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
              color: isOutOfStock ? 'var(--color-ink-muted-48)' : 'var(--color-ink)',
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
              backgroundColor: 'transparent',
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
    </div>
  );
}
