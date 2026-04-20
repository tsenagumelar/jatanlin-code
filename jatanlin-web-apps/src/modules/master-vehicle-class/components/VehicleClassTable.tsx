import React from 'react';
import {
  Button,
  Badge,
  Avatar,
} from '@fluentui/react-components';
import {
  Edit24Regular,
  Delete24Regular,
  Eye24Regular,
} from '@fluentui/react-icons';
import { DataTable, Column } from '@/src/components/organisms/DataTable';
import type { VehicleClassData } from '../types';

interface VehicleClassTableProps {
  vehicleClasses: VehicleClassData[];
  loading: boolean;
  onView: (vehicleClass: VehicleClassData) => void;
  onEdit: (vehicleClass: VehicleClassData) => void;
  onDelete: (vehicleClassId: string) => void;
}

const MINIO_URL = process.env.NEXT_PUBLIC_MINIO_URL || '';

const getVehicleImageUrl = (image: string | null | undefined) => {
  if (!image) {
    return '/polantas.png';
  }
  return `${MINIO_URL}/${image}`;
};

export const VehicleClassTable: React.FC<VehicleClassTableProps> = ({
  vehicleClasses,
  loading,
  onView,
  onEdit,
  onDelete,
}) => {
  const columns: Column<VehicleClassData>[] = [
    {
      key: 'image',
      header: '',
      width: '60px',
      render: (vehicleClass) => (
        <Avatar
          image={{ src: getVehicleImageUrl(vehicleClass.image) }}
          name={vehicleClass.type}
          size={56}
        />
      ),
    },
    {
      key: 'code',
      header: 'Kode',
      width: '120px',
      render: (vehicleClass) => <span>{vehicleClass.code}</span>,
    },
    {
      key: 'type',
      header: 'Tipe',
      width: '150px',
      render: (vehicleClass) => <span>{vehicleClass.type}</span>,
    },
    {
      key: 'description',
      header: 'Deskripsi',
      width: '200px',
      render: (vehicleClass) => <span>{vehicleClass.description}</span>,
    },
    {
      key: 'total_axle',
      header: 'Jumlah Sumbu',
      width: '120px',
      render: (vehicleClass) => {
        if(vehicleClass.total_axle >= 6){
          return <span>{'≥ 6'}</span>
        }
        return <span>{vehicleClass.total_axle}</span>
      },
    },
    {
      key: 'class_2_weight',
      header: 'Berat (kg)',
      width: '150px',
      render: (vehicleClass) => {
        const class2Weight =
          vehicleClass.class_2_weight != null
            ? Number(vehicleClass.class_2_weight).toLocaleString('id-ID')
            : '-';
        const class3Weight =
          vehicleClass.class_3_weight != null
            ? Number(vehicleClass.class_3_weight).toLocaleString('id-ID')
            : '-';

        if(vehicleClass.total_axle >= 6){
          return (
            <span>{class2Weight} kg / sumbu</span>
          )
        }
        if(vehicleClass.class_2_weight === vehicleClass.class_3_weight){
          return (
            <span>± {class2Weight} kg</span>
          )
        }
        return (
          <span>{class2Weight} kg - {class3Weight} kg</span>
        )
      },
    },
    {
      key: 'dimensions',
      header: 'Dimensi (P×L×T m)',
      width: '180px',
      render: (vehicleClass) => (
        <span>
          {vehicleClass.length} m × {vehicleClass.width} m × {vehicleClass.height} m
        </span>
      ),
    },
    {
      key: 'is_active',
      header: 'Status',
      width: '120px',
      render: (vehicleClass) =>
        vehicleClass.is_active ? (
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
      width: '150px',
      render: (vehicleClass) => (
        <div className="flex gap-2">
          <Button
            icon={<Eye24Regular />}
            size="small"
            onClick={() => onView(vehicleClass)}
          />
          <Button
            icon={<Edit24Regular />}
            size="small"
            onClick={() => onEdit(vehicleClass)}
          />
          <Button
            icon={<Delete24Regular />}
            size="small"
            onClick={() => onDelete(vehicleClass.id)}
          />
        </div>
      ),
    },
  ];

  return (
    <DataTable
      data={vehicleClasses}
      columns={columns}
      loading={loading}
      emptyMessage="Tidak ada data kelas kendaraan"
    />
  );
};
