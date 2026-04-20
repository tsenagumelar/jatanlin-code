'use client';

import React from 'react';
import { Button, Select } from '@fluentui/react-components';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
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
    <div className="flex items-center justify-between p-4 bg-white border-t border-gray-200">
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">
          Menampilkan {startRow}-{endRow} dari {totalCount} data
        </span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Baris per halaman:</span>
          <Select
            value={rowsPerPage.toString()}
            onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
            className="w-20"
          >
            <option value="5">5</option>
            <option value="10">10</option>
            <option value="25">25</option>
            <option value="50">50</option>
            <option value="100">100</option>
          </Select>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-sm text-gray-600">
          Halaman {page + 1} dari {totalPages}
        </span>
        <Button
          appearance="subtle"
          icon={<ChevronLeft24Regular />}
          onClick={() => onPageChange(page - 1)}
          disabled={page === 0}
        />
        <Button
          appearance="subtle"
          icon={<ChevronRight24Regular />}
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages - 1}
        />
      </div>
    </div>
  );
};
