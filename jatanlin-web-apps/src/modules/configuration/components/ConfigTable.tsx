import React from 'react';
import { Button, Badge } from '@fluentui/react-components';
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
          <Badge appearance="filled" color="success" size="large">
            Aktif
          </Badge>
        ) : (
          <Badge appearance="filled" color="danger" size="large">
            Tidak Aktif
          </Badge>
        ),
    },
    {
      key: 'actions',
      header: 'Aksi',
      width: '120px',
      render: (config) => (
        <div className="flex gap-2">
          <Button
            icon={<Eye24Regular />}
            size="small"
            onClick={() => onView(config)}
          />
          <Button
            icon={<Edit24Regular />}
            size="small"
            onClick={() => onEdit(config)}
          />
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
