'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button, Input, Select } from '@/Frontend/components/ui';
import { SlidersHorizontal, X } from 'lucide-react';
import { useLocale } from '@/Frontend/contexts/LocaleContext';
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
  const { t } = useLocale();

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

  const getCategoryLabel = (cat: string) => {
    return (t.categories as Record<string, string>)[cat] || cat;
  };

  const FilterContent = () => (
    <div className={styles.sidebarContainer}>
      {/* Search & Sort for Mobile (Hidden on Desktop via CSS if needed, but handled by drawer) */}
      <div className={styles.filterSection}>
        <Input
          placeholder={t.products.searchPlaceholder}
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
            { value: 'recommended', label: t.products.sortRecommended },
            { value: 'newest', label: t.products.sortNewest },
            { value: 'price-asc', label: t.products.sortPriceAsc },
            { value: 'price-desc', label: t.products.sortPriceDesc },
          ]}
          value={currentSort}
          onChange={(e) => updateQuery('sort', e.target.value)}
        />
      </div>

      {/* Category Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>{t.products.category}</h3>
        <div className={styles.filterList}>
          <button
            onClick={() => { updateQuery('category', null); updateQuery('subcategory', null); }}
            className={`${styles.filterItem} ${currentCategory === '' ? styles.filterItemActive : styles.filterItemInactive}`}
          >
            {t.categories.all}
          </button>
          {['nu', 'nam', 'phu-kien'].map((cat) => (
            <button
              key={cat}
              onClick={() => { updateQuery('category', cat); updateQuery('subcategory', null); }}
              className={`${styles.filterItem} ${currentCategory === cat ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              {getCategoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      {/* Subcategory Filter */}
      {availableFilters.subcategories && availableFilters.subcategories.length > 0 && currentCategory && (
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>{t.products.productType}</h3>
          <div className={styles.filterList}>
            <button
              onClick={() => updateQuery('subcategory', null)}
              className={`${styles.filterItem} ${currentSubcategory === '' ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              {t.products.allTypes}
            </button>
            {availableFilters.subcategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => updateQuery('subcategory', subcat)}
                className={`${styles.filterItem} ${currentSubcategory === subcat ? styles.filterItemActive : styles.filterItemInactive}`}
              >
                {(t.subcategories as Record<string, string>)[subcat] || subcat.replace(/-/g, ' ')}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Brand Filter */}
      {availableFilters.brands.length > 0 && (
        <div className={styles.filterSection}>
          <h3 className={styles.sectionTitle}>{t.products.brand}</h3>
          <div className={styles.filterList}>
            <button
              onClick={() => updateQuery('brand', null)}
              className={`${styles.filterItem} ${currentBrand === '' ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              {t.categories.all}
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
        <h3 className={styles.sectionTitle}>{t.products.priceRange}</h3>
        <div className={styles.priceInputGroup}>
          <div className={styles.priceInput}>
            <Input 
              type="number" 
              placeholder={t.products.priceMin} 
              value={minPrice} 
              onChange={(e) => setMinPrice(e.target.value)} 
            />
          </div>
          <span style={{ color: 'var(--color-ink-muted-80)' }}>-</span>
          <div className={styles.priceInput}>
            <Input 
              type="number" 
              placeholder={t.products.priceMax} 
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
            {t.products.applyPrice}
          </Button>
        </div>
      </div>

      {/* Rating Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>{t.products.rating}</h3>
        <div className={styles.filterList}>
          <button
            onClick={() => updateQuery('rating', null)}
            className={`${styles.filterItem} ${currentRating === '' ? styles.filterItemActive : styles.filterItemInactive}`}
          >
            {t.products.allRatings}
          </button>
          {[4, 3].map((rating) => (
            <button
              key={rating}
              onClick={() => updateQuery('rating', rating.toString())}
              className={`${styles.filterItem} ${currentRating === rating.toString() ? styles.filterItemActive : styles.filterItemInactive}`}
            >
              <span style={{ color: '#ffb400' }}>{'★'.repeat(rating)}</span>
              <span style={{ color: 'var(--color-hairline)' }}>{'★'.repeat(5 - rating)}</span>
              <span style={{ marginLeft: 4 }}>{t.products.andUp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* In Stock Filter */}
      <div className={styles.filterSection}>
        <h3 className={styles.sectionTitle}>{t.products.availability}</h3>
        <div className={styles.filterList}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 'var(--text-body-size)' }}>
            <input 
              type="checkbox" 
              checked={currentInStock}
              onChange={(e) => updateQuery('inStock', e.target.checked ? 'true' : null)}
              style={{ width: 18, height: 18, accentColor: 'var(--color-primary)' }}
            />
            <span className={currentInStock ? styles.filterItemActive : styles.filterItemInactive}>
              {t.products.inStockOnly}
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
            {t.products.clearFilters}
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
        {t.products.filterSort}
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
          <span className={styles.drawerTitle}>{t.products.filters}</span>
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
            {t.products.viewResults}
          </Button>
        </div>
      </div>
    </>
  );
}
