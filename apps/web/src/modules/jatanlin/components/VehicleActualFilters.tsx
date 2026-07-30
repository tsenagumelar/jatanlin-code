'use client';

import React from 'react';
import { Field, Input, Select, Button } from '@fluentui/react-components';
import { Search24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import type { VehicleActualFilterData } from '../types';

interface VehicleActualFiltersProps {
  filters: VehicleActualFilterData;
  onFilterChange: (filters: Partial<VehicleActualFilterData>) => void;
}

export const VehicleActualFilters: React.FC<VehicleActualFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleReset = () => {
    onFilterChange({
      search: '',
      status: '',
      start_date: '',
      end_date: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Field label="Pencarian">
          <Input
            placeholder="Plat nomor..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            contentBefore={<Search24Regular />}
          />
        </Field>

        <Field label="Status">
          <Select
            value={filters.status}
            onChange={(e) => onFilterChange({ status: e.target.value })}
          >
            <option value="">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="verified">Terverifikasi</option>
            <option value="rejected">Ditolak</option>
          </Select>
        </Field>

        <Field label="Tanggal Mulai">
          <Input
            type="datetime-local"
            value={filters.start_date}
            onChange={(e) => onFilterChange({ start_date: e.target.value })}
          />
        </Field>

        <Field label="Tanggal Selesai">
          <Input
            type="datetime-local"
            value={filters.end_date}
            onChange={(e) => onFilterChange({ end_date: e.target.value })}
          />
        </Field>

        <div className="flex items-end">
          <Button
            appearance="subtle"
            icon={<ArrowReset24Regular />}
            onClick={handleReset}
          >
            Atur Ulang Filter
          </Button>
        </div>
      </div>
    </div>
  );
};
