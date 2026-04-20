import React from 'react';
import { Button, Select } from '@fluentui/react-components';
import {
  ChevronLeft24Regular,
  ChevronRight24Regular,
} from '@fluentui/react-icons';

interface VehicleClassPaginationProps {
  page: number;
  rowsPerPage: number;
  totalCount: number;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
}

export const VehicleClassPagination: React.FC<VehicleClassPaginationProps> = ({
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
    <div className="flex items-center justify-between p-4 border-t">
      <div className="flex items-center gap-2">
        <span>Baris per halaman:</span>
        <Select
          value={rowsPerPage.toString()}
          onChange={(e) => onRowsPerPageChange(Number(e.target.value))}
        >
          <option value="10">10</option>
          <option value="25">25</option>
          <option value="50">50</option>
          <option value="100">100</option>
        </Select>
      </div>

      <div className="flex items-center gap-4">
        <span>
          {startRow}-{endRow} dari {totalCount}
        </span>
        <div className="flex gap-2">
          <Button
            icon={<ChevronLeft24Regular />}
            disabled={page === 0}
            onClick={() => onPageChange(page - 1)}
          />
          <Button
            icon={<ChevronRight24Regular />}
            disabled={page >= totalPages - 1}
            onClick={() => onPageChange(page + 1)}
          />
        </div>
      </div>
    </div>
  );
};
