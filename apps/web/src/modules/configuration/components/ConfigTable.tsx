import React from 'react';
import { Edit24Regular, Eye24Regular } from '@fluentui/react-icons';
import { DataTable, Column } from '@/src/components/organisms/DataTable';
import type { ConfigData } from '../types';

interface ConfigTableProps {
  configs: ConfigData[];
  loading: boolean;
  onView: (config: ConfigData) => void;
  onEdit: (config: ConfigData) => void;
}

export const ConfigTable: React.FC<ConfigTableProps> = ({
  configs,
  loading,
  onView,
  onEdit,
}) => {
  const columns: Column<ConfigData>[] = [
    {
      key: 'code',
      header: 'Kode',
      width: '120px',
      render: (config) => <span>{config.code}</span>,
    },
    {
      key: 'config_type',
      header: 'Tipe',
      width: '150px',
      render: (config) => <span>{config.config_type}</span>,
    },
    {
      key: 'config_key',
      header: 'Key',
      width: '200px',
      render: (config) => <span>{config.config_key}</span>,
    },
    {
      key: 'config_value',
      header: 'Value',
      width: '200px',
      render: (config) => <span>{config.config_value}{['TOLERANCE_WEIGHT', 'TOLERANCE_DIM'].includes(config.config_key) ? '%' : ''}</span>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      width: '250px',
      render: (config) => <span>{config.description}</span>,
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      render: (config) =>
        config.is_active ? (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-green-50 text-green-700 border border-green-200 whitespace-nowrap">
            Aktif
          </span>
        ) : (
          <span className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 whitespace-nowrap">
            Tidak Aktif
          </span>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      width: '120px',
      render: (config) => (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => onView(config)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          >
            <Eye24Regular className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => onEdit(config)}
            className="w-8 h-8 inline-flex items-center justify-center rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors"
          >
            <Edit24Regular className="w-4 h-4" />
          </button>
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={configs}
      columns={columns}
      loading={loading}
      emptyMessage="Tidak ada data konfigurasi"
    />
  );
};
