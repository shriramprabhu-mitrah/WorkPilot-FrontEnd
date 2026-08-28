import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/src/types/core';

interface PaginationProps {
  meta?: PaginationMeta;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (pageSize: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  meta,
  currentPage,
  pageSize,
  onPageChange,
  onPageSizeChange,
}) => {
  const pageSizeOptions = [10, 25, 50, 100];

  const totalPages = meta?.total_pages ?? 1;
  const hasPrevious = meta?.has_previous ?? currentPage > 1;
  const hasNext = meta?.has_next ?? currentPage < totalPages;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else if (currentPage <= 3) {
      for (let i = 1; i <= 4; i++) {
        pages.push(i);
      }

      pages.push('...');
      pages.push(totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1);
      pages.push('...');

      for (let i = totalPages - 3; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);
      pages.push('...');

      for (let i = currentPage - delta; i <= currentPage + delta; i++) {
        pages.push(i);
      }

      pages.push('...');
      pages.push(totalPages);
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) {
      return;
    }

    onPageChange(page);
  };

  return (
    <div className="flex items-center justify-between border-t border-gray-200 bg-white px-5 py-3 dark:border-slate-700 dark:bg-slate-900">
      {/* Page Info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-slate-400">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      {/* Pagination */}
      <div className="flex items-center gap-1">
        {/* Previous */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={!hasPrevious}
          className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} className="text-gray-600 dark:text-slate-400" />
        </button>

        {/* Page Numbers */}
        {pageNumbers.map((page, index) => {
          if (page === '...') {
            return (
              <span
                key={`ellipsis-${index}`}
                className="px-3 py-1 text-sm text-gray-500 dark:text-slate-500"
              >
                ...
              </span>
            );
          }

          const pageNum = page as number;
          const isActive = pageNum === currentPage;

          return (
            <button
              type="button"
              key={pageNum}
              onClick={() => handlePageChange(pageNum)}
              className={`min-w-[32px] rounded px-3 py-1 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-slate-300 dark:hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next */}
        <button
          type="button"
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={!hasNext}
          className="rounded p-1.5 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-slate-700"
          aria-label="Next page"
        >
          <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Page Size */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-slate-400">Items per Page</span>

        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="rounded border border-gray-300 bg-white px-3 py-1 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300"
        >
          {pageSizeOptions.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
