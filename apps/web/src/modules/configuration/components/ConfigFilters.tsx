'use client';

import React from 'react';
import { Search24Regular, ArrowReset24Regular } from '@fluentui/react-icons';
import type { ConfigFilterData } from '../types';

interface ConfigFiltersProps {
  filters: ConfigFilterData;
  onFilterChange: (filters: Partial<ConfigFilterData>) => void;
}

export const ConfigFilters: React.FC<ConfigFiltersProps> = ({
  filters,
  onFilterChange,
}) => {
  const handleReset = () => {
    onFilterChange({
      search: '',
      config_type: '',
      is_active: '',
    });
  };

  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-4">
      <div className="px-5 py-4 flex flex-wrap items-end gap-3">
        <label className="block flex-1 min-w-[220px] max-w-sm">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5">Pencarian</span>
          <div className="relative">
            <Search24Regular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Kode, kunci, nilai, deskripsi..."
              value={filters.search}
              onChange={(e) => onFilterChange({ search: e.target.value })}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
            />
          </div>
        </label>

        <label className="block min-w-[180px]">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5">Tipe Konfigurasi</span>
          <select
            value={filters.config_type}
            onChange={(e) => onFilterChange({ config_type: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          >
            <option value="">Semua Tipe</option>
            <option value="SYSTEM">Sistem</option>
            <option value="APPLICATION">Aplikasi</option>
            <option value="INTEGRATION">Integrasi</option>
          </select>
        </label>

        <label className="block min-w-[160px]">
          <span className="block text-xs font-semibold text-slate-500 mb-1.5">Status</span>
          <select
            value={filters.is_active}
            onChange={(e) => onFilterChange({ is_active: e.target.value })}
            className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          >
            <option value="">Semua Status</option>
            <option value="true">Aktif</option>
            <option value="false">Tidak Aktif</option>
          </select>
        </label>

        <button
          type="button"
          onClick={handleReset}
          className="inline-flex items-center gap-2 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
        >
          <ArrowReset24Regular className="w-4 h-4" />
          Atur Ulang
        </button>
      </div>
    </div>
  );
};
