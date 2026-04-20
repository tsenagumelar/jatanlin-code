'use client';

import React from 'react';
import { Field, Input, Select, Button } from '@fluentui/react-components';
import { Search24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import type { VehicleClassFilterData } from '../types';

interface VehicleClassFiltersProps {
  filters: VehicleClassFilterData;
  onFilterChange: (filters: Partial<VehicleClassFilterData>) => void;
}

export const VehicleClassFilters: React.FC<VehicleClassFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleReset = () => {
    onFilterChange({
      search: '',
      is_active: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Field label="Pencarian">
          <Input
            placeholder="Kode, tipe, deskripsi..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            contentBefore={<Search24Regular />}
          />
        </Field>

        <Field label="Status">
          <Select
            value={filters.is_active}
            onChange={(e) => onFilterChange({ is_active: e.target.value })}
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </Select>
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
