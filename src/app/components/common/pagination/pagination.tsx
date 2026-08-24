import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PaginationMeta } from '@/src/types/core';

interface PaginationProps {
  meta: PaginationMeta;
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

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const totalPages = meta.total_pages;
    const delta = 1;

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
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
    }

    return pages;
  };

  const pageNumbers = generatePageNumbers();

  return (
    <div className="flex items-center justify-between px-5 py-3 border-t border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900">
      {/* Left side - Page info */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-slate-400">
          Page {currentPage} of {meta.total_pages}
        </span>
      </div>

      {/* Center - Page numbers */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!meta.has_previous}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Previous page"
        >
          <ChevronLeft size={18} className="text-gray-600 dark:text-slate-400" />
        </button>

        {/* Page number buttons */}
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
              key={pageNum}
              onClick={() => onPageChange(pageNum)}
              className={`min-w-[32px] px-3 py-1 text-sm font-medium rounded transition-colors ${
                isActive
                  ? 'bg-purple-600 text-white'
                  : 'text-gray-700 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-700'
              }`}
            >
              {pageNum}
            </button>
          );
        })}

        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!meta.has_next}
          className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          aria-label="Next page"
        >
          <ChevronRight size={18} className="text-gray-600 dark:text-slate-400" />
        </button>
      </div>

      {/* Right side - Items per page */}
      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600 dark:text-slate-400">Items per Page</span>
        <select
          value={pageSize}
          onChange={(e) => onPageSizeChange(Number(e.target.value))}
          className="px-3 py-1 text-sm border border-gray-300 dark:border-slate-600 rounded bg-white dark:bg-slate-800 text-gray-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
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
