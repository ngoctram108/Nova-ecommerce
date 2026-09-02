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

    // Wrap in startTransition so React treats this as a non-urgent update.
    // This allows the Suspense boundary (key={JSON.stringify(resolvedParams)})
    // in the parent server component to show its fallback skeleton while
    // the new page data is being fetched. Without startTransition,
    // router.push triggers a hard navigation that doesn't interact
    // properly with the Suspense boundary, causing the old data to remain
    // visible and requiring a second click.
    startTransition(() => {
      router.push(`/products?${params.toString()}`, { scroll: true });
    });
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
