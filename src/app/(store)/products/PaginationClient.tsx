'use client';

import React, { useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Pagination } from '@/Frontend/components/ui';

export default function PaginationClient({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set('page', page.toString());
    } else {
      params.delete('page');
    }

    // We do not use startTransition here because we WANT the Suspense boundary
    // in the parent server component to show its fallback skeleton immediately.
    // In Next.js App Router, router.push without transition will trigger the closest Suspense boundary.
    router.push(`/products?${params.toString()}`, { scroll: true });
  };

  return (
    <div style={{ opacity: isPending ? 0.5 : 1, transition: 'opacity 0.2s', pointerEvents: isPending ? 'none' : 'auto' }}>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isPending && (
        <div style={{ textAlign: 'center', marginTop: 8, fontSize: 'var(--text-caption-size)', color: 'var(--color-ink-muted-80)' }}>
          Đang tải...
        </div>
      )}
    </div>
  );
}
