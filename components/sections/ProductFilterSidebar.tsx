'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Select } from '@/components/ui';
import { SlidersHorizontal, X } from 'lucide-react';
import styles from './ProductFilterSidebar.module.css';

export interface ProductFiltersProps {
  availableFilters: {
    categories: string[];
    subcategories?: string[];
    brands: string[];
    colors: string[];
    sizes: string[];
    priceRange: { min: number; max: number };
  };
}

export default function ProductFilterSidebar({ availableFilters }: ProductFiltersProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isDrawerOpen]);

  // Helpers to update URL
  const updateQuery = (key: string, value: string | null) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete('page'); // Reset page on filter change
    router.push(`/products?${params.toString()}`);
  };

  const currentCategory = searchParams.get('category') || '';
  const currentSubcategory = searchParams.get('subcategory') || '';
  const currentBrand = searchParams.get('brand') || '';
  const currentSort = searchParams.get('sort') || 'recommended';
  const currentRating = searchParams.get('rating') || '';
  const currentInStock = searchParams.get('inStock') === 'true';

  // State for Price inputs
  const [minPrice, setMinPrice] = React.useState(searchParams.get('minPrice') || '');
  const [maxPrice, setMaxPrice] = React.useState(searchParams.get('maxPrice') || '');

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (minPrice) params.set('minPrice', minPrice);
    else params.delete('minPrice');

    if (maxPrice) params.set('maxPrice', maxPrice);
    else params.delete('maxPrice');

    params.delete('page');
    router.push(`/products?${params.toString()}`);
  };

  const hasActiveFilters = searchParams.toString() !== '' && searchParams.toString() !== 'sort=recommended';

  const FilterContent = () => (
    <div className={styles.sidebarContainer}>
      {/* Search & Sort for Mobile (Hidden on Desktop via CSS if needed, but handled by drawer) */}
      <div className={styles.filterSection}>
        <Input
          placeholder="Tìm kiếm sản phẩm..."
          defaultValue={searchParams.get('q') || ''}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              updateQuery('q', e.currentTarget.value);
            }
          }}
          style={{ marginBottom: 12 }}
        />
        <Select
          options={[
            { value: 'recommended', label: 'Nổi bật nhất' },
            { value: 'newest', label: 'Mới nhất' },
            { value: 'price-asc', label: 'Giá: Thấp đến cao' },
            { value: 'price-desc', label: 'Giá: Cao đến thấp' },
          ]}
          value={currentSort}
          onChange={(e) => updateQuery('sort', e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Danh mục</h3>
        <div className={styles.filterList}>
          <button
            onClick={() => { updateQuery('category', null); updateQuery('subcategory', null); }}
            className={`${styles.filterItem} ${currentCategory === '' ? styles.filterItemActive : styles.filterItemInactive}`}
          >
            Tất cả
          </button>
          {['nu', 'nam', 'phu-kien'].map((cat) => (
            <button
              key={cat}
              onClick={() => { updateQuery('category', cat); updateQuery('subcategory', null); }}
              className={`${styles.filterItem} ${currentCategory === cat ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              {cat === 'nu' ? 'Nữ' : cat === 'nam' ? 'Nam' : 'Phụ kiện'}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Filter */}
      {availableFilters.subcategories && availableFilters.subcategories.length > 0 && currentCategory && (
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>Loại sản phẩm</h3>
          <div className={styles.filterList}>
            <button
              onClick={() => updateQuery('subcategory', null)}
              className={`${styles.filterItem} ${currentSubcategory === '' ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              Tất cả loại
            </button>
            {availableFilters.subcategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => updateQuery('subcategory', subcat)}
                className={`${styles.filterItem} ${currentSubcategory === subcat ? styles.filterItemActive : styles.filterItemInactive}`}
              >
                {subcat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {availableFilters.brands.length > 0 && (
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>Thương hiệu</h3>
          <div className={styles.filterList}>
            <button
              onClick={() => updateQuery('brand', null)}
              className={`${styles.filterItem} ${currentBrand === '' ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              Tất cả
            </button>
            {availableFilters.brands.map((brand) => (
              <button
                key={brand}
                onClick={() => updateQuery('brand', brand)}
                className={`${styles.filterItem} ${currentBrand === brand ? styles.filterItemActive : styles.filterItemInactive}`}
              >
                {brand}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Price Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Khoảng giá</h3>
        <div className={styles.priceInputGroup}>
          <div className={styles.priceInput}>
            <Input 
              type="number" 
              placeholder="Tối thiểu" 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)} 
            />
          </div>
          <span style={{ color: 'var(--color-ink-muted-80)' }}>-</span>
          <div className={styles.priceInput}>
            <Input 
              type="number" 
              placeholder="Tối đa" 
              value={maxPrice} 
              onChange={(e) => setMaxPrice(e.target.value)} 
            />
          </div>
        </div>
        <div className={styles.applyButton}>
          <Button 
            variant="outline" 
            fullWidth 
            onClick={applyPriceFilter}
          >
            Áp dụng
          </Button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Đánh giá</h3>
        <div className={styles.filterList}>
          <button
            onClick={() => updateQuery('rating', null)}
            className={`${styles.filterItem} ${currentRating === '' ? styles.filterItemActive : styles.filterItemInactive}`}
          >
            Mọi đánh giá
          </button>
          {[4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => updateQuery('rating', rating.toString())}
              className={`${styles.filterItem} ${currentRating === rating.toString() ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              <span style={{ color: '#ffb400' }}>{'★'.repeat(rating)}</span>
              <span style={{ color: 'var(--color-hairline)' }}>{'★'.repeat(5 - rating)}</span>
              <span style={{ marginLeft: 4 }}>trở lên</span>
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>Tình trạng</h3>
        <div className={styles.filterList}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-body-size)' }}>
            <input 
              type="checkbox" 
              checked={currentInStock}
              onChange={(e) => updateQuery('inStock', e.target.checked ? 'true' : null)}
              style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
            />
            <span className={currentInStock ? styles.filterItemActive : styles.filterItemInactive}>
              Chỉ hiển thị sản phẩm còn hàng
            </span>
          </label>
        </div>
      </div>

      {/* Reset Filters */}
      {hasActiveFilters && (
        <div style={{ paddingTop: 'var(--space-md)' }}>
          <Button
            variant="ghost"
            fullWidth
            onClick={() => router.push('/products')}
            style={{ color: 'var(--color-error)' }}
          >
            Xóa toàn bộ bộ lọc
          </Button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Mobile Filter Button */}
      <button 
        className={styles.mobileFilterBtn}
        onClick={() => setIsDrawerOpen(true)}
      >
        <SlidersHorizontal size={18} />
        Bộ lọc & Sắp xếp
      </button>

      {/* Desktop Sidebar (visible on lg+) */}
      <div className={styles.desktopSidebarWrapper}>
        <div className="desktop-sidebar">
          <FilterContent />
        </div>
      </div>

      {/* Mobile Drawer */}
      {isDrawerOpen && (
        <div 
          className={styles.drawerOverlay}
          onClick={() => setIsDrawerOpen(false)}
        />
      )}
      
      <div className={`${styles.drawer} ${isDrawerOpen ? styles.drawerOpen : ''}`}>
        <div className={styles.drawerHeader}>
          <span className={styles.drawerTitle}>Bộ lọc</span>
          <button
            onClick={() => setIsDrawerOpen(false)}
            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex' }}
          >
            <X size={24} strokeWidth={1.5} />
          </button>
        </div>
        
        <div className={styles.drawerContent}>
          <FilterContent />
        </div>
        
        <div className={styles.drawerFooter}>
          <Button fullWidth onClick={() => setIsDrawerOpen(false)}>
            Xem kết quả
          </Button>
        </div>
      </div>
    </>
  );
}
