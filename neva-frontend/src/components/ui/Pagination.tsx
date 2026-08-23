'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  itemsPerPageOptions?: number[];
}

export default function Pagination({
  currentPage,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  itemsPerPageOptions = [8, 15, 25, 50]
}: PaginationProps) {
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Generate page numbers
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-3.5 bg-white border-t border-zinc-100 text-xs">
      {/* Entries Info & Page Size Selector */}
      <div className="flex items-center gap-4 text-zinc-500 font-medium">
        <span>
          Showing <strong className="font-semibold text-zinc-900">{startItem}</strong> to{' '}
          <strong className="font-semibold text-zinc-900">{endItem}</strong> of{' '}
          <strong className="font-semibold text-zinc-900">{totalItems}</strong> entries
        </span>

        {onItemsPerPageChange && (
          <div className="flex items-center gap-1.5 ml-2">
            <span className="text-zinc-400">Per page:</span>
            <select
              value={itemsPerPage}
              onChange={(e) => {
                onItemsPerPageChange(Number(e.target.value));
                onPageChange(1);
              }}
              className="bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 rounded-lg px-2.5 py-1 text-xs font-semibold text-zinc-700 outline-none transition cursor-pointer"
            >
              {itemsPerPageOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium flex items-center gap-1"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
          <span className="hidden sm:inline text-[11px]">Prev</span>
        </button>

        <div className="flex items-center gap-1 px-1">
          {getPageNumbers().map((pg, idx) => (
            typeof pg === 'number' ? (
              <button
                key={idx}
                type="button"
                onClick={() => onPageChange(pg)}
                className={`h-7 min-w-[28px] px-2 rounded-lg font-bold text-xs transition cursor-pointer ${
                  currentPage === pg
                    ? 'bg-violet-600 text-white shadow-xs'
                    : 'text-zinc-600 hover:bg-zinc-100 border border-transparent'
                }`}
              >
                {pg}
              </button>
            ) : (
              <span key={idx} className="px-1 text-zinc-400 font-bold">...</span>
            )
          ))}
        </div>

        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages || totalPages === 0}
          className="px-2 py-1.5 rounded-lg border border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-40 disabled:cursor-not-allowed transition cursor-pointer font-medium flex items-center gap-1"
          title="Next Page"
        >
          <span className="hidden sm:inline text-[11px]">Next</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}
