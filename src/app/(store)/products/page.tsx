import React, { Suspense } from 'react';
import { Metadata } from 'next';
import { queryProducts } from '@/Backend/services/catalog';
import { ProductFilters } from '@/Shared/types';
import { ProductCard, Pagination, EmptyState } from '@/Frontend/components/ui';
import ProductFilterSidebar from '@/Frontend/components/sections/ProductFilterSidebar';
import { ProductListSkeleton } from './loading';

import styles from './Products.module.css';

export const metadata: Metadata = {
  title: 'Sản phẩm | NORA',
  description: 'Khám phá tất cả sản phẩm thời trang và phong cách sống từ NORA.',
};

// Force dynamic rendering so loading.tsx skeleton shows immediately during navigation
// instead of serving a stale cached page that masks the loading state
export const dynamic = 'force-dynamic';

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  // Await search params in Next.js 15
  const resolvedParams = await searchParams;

  // Build filters
  const filters: ProductFilters = {
    limit: 12,
  };

  if (typeof resolvedParams.q === 'string') filters.q = resolvedParams.q;
  if (typeof resolvedParams.category === 'string') filters.category = resolvedParams.category;
  if (typeof resolvedParams.subcategory === 'string') filters.subcategory = resolvedParams.subcategory;
  if (typeof resolvedParams.brand === 'string') filters.brand = resolvedParams.brand;
  if (typeof resolvedParams.color === 'string') filters.color = resolvedParams.color;
  if (typeof resolvedParams.size === 'string') filters.size = resolvedParams.size;
  if (typeof resolvedParams.minPrice === 'string') filters.minPrice = Number(resolvedParams.minPrice);
  if (typeof resolvedParams.maxPrice === 'string') filters.maxPrice = Number(resolvedParams.maxPrice);
  if (typeof resolvedParams.sort === 'string') filters.sort = resolvedParams.sort as any;
  if (typeof resolvedParams.badge === 'string') filters.badge = resolvedParams.badge as any;
  if (typeof resolvedParams.page === 'string') filters.page = Number(resolvedParams.page);
  if (resolvedParams.inStock === 'true') filters.inStock = true;
  if (typeof resolvedParams.rating === 'string') filters.rating = Number(resolvedParams.rating);

  return (
    <div className="container section">
      <div
        style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          marginBottom: 'var(--space-xl)',
          paddingBottom: 'var(--space-lg)',
          borderBottom: '1px solid var(--color-divider-soft)',
        }}
      >
        <h1 className="text-display-lg">
          {filters.category ? filters.category.replace('-', ' ') : 'Tất cả sản phẩm'}
        </h1>
      </div>

      {/* Trigger Suspense when query string changes to show skeleton immediately */}
      <Suspense fallback={<ProductListSkeleton />} key={JSON.stringify(resolvedParams)}>
        <ProductListContent filters={filters} />
      </Suspense>
    </div>
  );
}

async function ProductListContent({ filters }: { filters: ProductFilters }) {
  const result = await queryProducts(filters);

  return (
    <>
      <div style={{ fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)', marginBottom: 'var(--space-lg)', textAlign: 'right', marginTop: '-60px' }}>
        Hiển thị {result.data.length} trên tổng {result.pagination.total} sản phẩm
      </div>
      <div className={styles.pageLayout}>
        {/* Sidebar */}
        <aside className={styles.sidebarWrapper}>
          <ProductFilterSidebar availableFilters={result.filters} />
        </aside>

        {/* Main Content */}
        <div className={styles.mainContent}>
          {result.data.length > 0 ? (
            <>
              <div className={styles.productGrid}>
                {result.data.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>

              {/* Pagination */}
              <div style={{ marginTop: 'var(--space-xxl)' }}>
                <PaginationClient
                  currentPage={result.pagination.page}
                  totalPages={result.pagination.totalPages}
                />
              </div>
            </>
          ) : (
            <div style={{ paddingTop: 'var(--space-xl)' }}>
              <EmptyState
                icon={<span>🔍</span>}
                title="Không tìm thấy sản phẩm"
                description="Không có sản phẩm nào phù hợp với bộ lọc của bạn. Vui lòng thử lại với các tiêu chí khác."
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/* ── Client Pagination Wrapper ── */
import PaginationClient from './PaginationClient';
