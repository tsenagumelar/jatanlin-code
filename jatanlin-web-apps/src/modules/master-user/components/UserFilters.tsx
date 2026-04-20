'use client';

import React from 'react';
import { Field, Input, Select, Button } from '@fluentui/react-components';
import { Search24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import { useRoleOptions } from '../hooks';
import type { UserFilterData } from '../types';

interface UserFiltersProps {
  filters: UserFilterData;
  onFilterChange: (filters: Partial<UserFilterData>) => void;
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const { roles } = useRoleOptions();

  const handleReset = () => {
    onFilterChange({
      search: '',
      role_id: '',
      is_active: '',
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Field label="Pencarian">
          <Input
            placeholder="Nama pengguna, nama, email..."
            value={filters.search}
            onChange={(e) => onFilterChange({ search: e.target.value })}
            contentBefore={<Search24Regular />}
          />
        </Field>

        <Field label="Peran">
          <Select
            value={filters.role_id}
            onChange={(e) => onFilterChange({ role_id: e.target.value })}
          >
            <option value="">Semua Peran</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.role_name}
              </option>
            ))}
          </Select>
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
