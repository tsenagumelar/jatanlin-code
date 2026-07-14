'use client';

import React from 'react';
import {
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from '@fluentui/react-icons';

interface UserPaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export const UserPagination: React.FC<UserPaginationProps> = ({
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
}) => {
  const totalPages = Math.ceil(totalCount / rowsPerPage);
  const startRow = page * rowsPerPage + 1;
  const endRow = Math.min((page + 1) * rowsPerPage, totalCount);

  return (
    <div className="px-5 py-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/50">
      <div className="flex flex-wrap items-center gap-4">
        <span className="text-xs text-slate-400">
          Menampilkan {startRow}-{endRow} dari {totalCount} data
        </span>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Baris:</span>
          <select
            value={rowsPerPage.toString()}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="px-2 py-1.5 text-xs rounded-md border border-slate-200 bg-white text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-slate-400">
          Halaman {page + 1} dari {totalPages}
        </span>
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronLeft20Regular />
        </button>
        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
          className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          <ChevronRight20Regular />
        </button>
      </div>
    </div>
  );
};
