'use client';

import React from 'react';
import { getPaginationRange } from '@/lib/utils';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const range = getPaginationRange(currentPage, totalPages);

  return (
    <nav
      aria-label="Phân trang"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 4,
        padding: 'var(--space-lg) 0',
      }}
    >
      {/* Previous */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Trang trước"
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--rounded-sm)',
          border: '1px solid var(--color-hairline)',
          backgroundColor: 'var(--color-canvas)',
          color: currentPage === 1 ? 'var(--color-ink-muted-48)' : 'var(--color-ink)',
          cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
          fontSize: 14,
          transition: 'all var(--transition-fast)',
        }}
      >
        ‹
      </button>

      {/* Pages */}
      {range.map((item, i) =>
        item === '...' ? (
          <span
            key={`dots-${i}`}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 14,
              color: 'var(--color-ink-muted-48)',
            }}
          >
            …
          </span>
        ) : (
          <button
            key={item}
            onClick={() => onPageChange(item as number)}
            aria-current={item === currentPage ? 'page' : undefined}
            style={{
              width: 40,
              height: 40,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: 'var(--rounded-sm)',
              border: item === currentPage ? 'none' : '1px solid transparent',
              backgroundColor: item === currentPage ? 'var(--color-primary)' : 'transparent',
              color: item === currentPage ? 'var(--color-on-primary)' : 'var(--color-ink)',
              cursor: 'pointer',
              fontSize: 14,
              fontWeight: item === currentPage ? 600 : 400,
              transition: 'all var(--transition-fast)',
            }}
          >
            {item}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Trang sau"
        style={{
          width: 40,
          height: 40,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 'var(--rounded-sm)',
          border: '1px solid var(--color-hairline)',
          backgroundColor: 'var(--color-canvas)',
          color: currentPage === totalPages ? 'var(--color-ink-muted-48)' : 'var(--color-ink)',
          cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
          fontSize: 14,
          transition: 'all var(--transition-fast)',
        }}
      >
        ›
      </button>
    </nav>
  );
}
