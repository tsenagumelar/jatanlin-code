/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useState } from 'react';
import {
  Button,
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  useId,
} from '@fluentui/react-components';
import {
  Add24Regular,
  ArrowSync24Regular,
  ArrowDownload24Regular,
} from '@fluentui/react-icons';
import {
  useVehicleClassList,
  useVehicleClassDelete,
} from './hooks';
import { VehicleClassTable } from './components/VehicleClassTable';
import { VehicleClassForm } from './components/VehicleClassForm';
import { VehicleClassFilters } from './components/VehicleClassFilters';
import { VehicleClassPagination } from './components/VehicleClassPagination';
import { VehicleClassDetailDialog } from './components/VehicleClassDetailDialog';
import { DeleteConfirmDialog } from './components/DeleteConfirmDialog';
import { ExportDialog } from '@/src/components/organisms';
import { exportToExcel, exportToPDF, ExportColumn } from '@/src/utils/export';
import moment from 'moment';
import type { VehicleClassData } from './types';

export const MasterVehicleClassModule: React.FC = () => {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editVehicleClass, setEditVehicleClass] = useState<VehicleClassData | null>(null);
  const [viewVehicleClass, setViewVehicleClass] = useState<VehicleClassData | null>(null);
  const [deleteVehicleClassId, setDeleteVehicleClassId] = useState<string | null>(null);
  const [deleteVehicleClassName, setDeleteVehicleClassName] = useState<string>('');
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    vehicleClasses,
    totalCount,
    loading,
    page,
    rowsPerPage,
    filters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    handleRefresh,
  } = useVehicleClassList();

  const { deleteVehicleClass } = useVehicleClassDelete();

  const handleAddVehicleClass = () => {
    setEditVehicleClass(null);
    setFormOpen(true);
  };

  const handleViewVehicleClass = (vehicleClass: VehicleClassData) => {
    setViewVehicleClass(vehicleClass);
    setDetailOpen(true);
  };

  const handleEditVehicleClass = (vehicleClass: VehicleClassData) => {
    setEditVehicleClass(vehicleClass);
    setFormOpen(true);
  };

  const handleDeleteClick = (vehicleClassId: string) => {
    const vehicleClass = vehicleClasses.find((v) => v.id === vehicleClassId);
    if (vehicleClass) {
      setDeleteVehicleClassId(vehicleClassId);
      setDeleteVehicleClassName(vehicleClass.type);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteVehicleClassId) return;

    setIsDeleting(true);
    try {
      await deleteVehicleClass(deleteVehicleClassId, () => {
        handleRefresh();
        setDeleteDialogOpen(false);
        setDeleteVehicleClassId(null);
        setDeleteVehicleClassName('');
        dispatchToast(
          <Toast>
            <ToastTitle>Kelas kendaraan berhasil dihapus</ToastTitle>
          </Toast>,
          { intent: 'success' }
        );
      });
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    } finally {
      setIsDeleting(false);
    }
  };

  const handleFormSuccess = () => {
    handleRefresh();
    dispatchToast(
      <Toast>
        <ToastTitle>
          {editVehicleClass
            ? 'Kelas kendaraan berhasil diperbarui'
            : 'Kelas kendaraan berhasil ditambahkan'}
        </ToastTitle>
      </Toast>,
      { intent: 'success' }
    );
  };

  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { header: 'Kode', key: 'code', width: 15 },
      { header: 'Tipe', key: 'type', width: 20 },
      { header: 'Deskripsi', key: 'description', width: 30 },
      { header: 'Jumlah Gandar', key: 'total_axle', width: 15 },
      { header: 'Berat', key: 'class_2_weight', width: 20 },
      { header: 'Panjang (m)', key: 'length', width: 12 },
      { header: 'Lebar (m)', key: 'width', width: 12 },
      { header: 'Tinggi (m)', key: 'height', width: 12 },
      { header: 'Status', key: 'is_active', width: 12 },
      { header: 'Diperbarui', key: 'updated_date', width: 18 },
    ];

    const exportData = vehicleClasses.map((vehicleClass) => ({
      ...vehicleClass,
      is_active: vehicleClass.is_active ? 'Aktif' : 'Tidak Aktif',
      updated_date: vehicleClass.updated_date
        ? moment(vehicleClass.updated_date).format('DD-MM-YYYY HH:mm')
        : '-',
    }));

    try {
      await exportToExcel(exportData, columns, {
        filename: `Master_Data_Kelas_Kendaraan_${moment().format(
          'YYYYMMDD_HHmmss'
        )}`,
        sheetName: 'Data Kelas Kendaraan',
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Data berhasil diekspor ke Excel</ToastTitle>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {error?.message || 'Gagal mengekspor data ke Excel'}
          </ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  const handleExportPDF = async () => {
    const columns: ExportColumn[] = [
      { header: 'Kode', key: 'code', width: 20 },
      { header: 'Tipe', key: 'type', width: 30 },
      { header: 'Deskripsi', key: 'description', width: 40 },
      { header: 'Jumlah Gandar', key: 'total_axle', width: 20 },
      { header: 'Berat', key: 'class_2_weight', width: 25 },
      { header: 'Dimensi (P×L×T m)', key: 'dimensions', width: 25 },
      { header: 'Status', key: 'is_active', width: 18 },
    ];

    const exportData = vehicleClasses.map((vehicleClass) => ({
      ...vehicleClass,
      dimensions: `${vehicleClass.length} × ${vehicleClass.width} × ${vehicleClass.height}`,
      is_active: vehicleClass.is_active ? 'Aktif' : 'Tidak Aktif',
    }));

    try {
      await exportToPDF(exportData, columns, {
        filename: `Master_Data_Kelas_Kendaraan_${moment().format(
          'YYYYMMDD_HHmmss'
        )}`,
        title: 'Master Data Kelas Kendaraan',
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Data berhasil diekspor ke PDF</ToastTitle>
        </Toast>,
        { intent: 'success' }
      );
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {error?.message || 'Gagal mengekspor data ke PDF'}
          </ToastTitle>
        </Toast>,
        { intent: 'error' }
      );
    }
  };

  return (
    <div className="flex flex-col h-full p-6 overflow-auto bg-slate-50">
      <Toaster toasterId={toasterId} />

      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Master Data Kelas Kendaraan
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Kelola data kelas kendaraan
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              appearance="subtle"
              icon={<ArrowSync24Regular />}
              onClick={handleRefresh}
            >
              Muat Ulang
            </Button>
            <Button
              appearance="subtle"
              icon={<ArrowDownload24Regular />}
              onClick={() => setExportDialogOpen(true)}
            >
              Ekspor
            </Button>
            <Button
              appearance="primary"
              icon={<Add24Regular />}
              onClick={handleAddVehicleClass}
            >
              Tambah Kelas Kendaraan
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <VehicleClassFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <VehicleClassTable
            vehicleClasses={vehicleClasses}
            loading={loading}
            onView={handleViewVehicleClass}
            onEdit={handleEditVehicleClass}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Pagination */}
        {!loading && vehicleClasses.length > 0 && (
          <div className="shrink-0">
            <VehicleClassPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}
      </div>

      {/* Detail Dialog */}
      <VehicleClassDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setViewVehicleClass(null);
        }}
        vehicleClass={viewVehicleClass}
      />

      {/* Form Dialog */}
      <VehicleClassForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        editVehicleClass={editVehicleClass}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteVehicleClassId(null);
          setDeleteVehicleClassName('');
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        vehicleClassName={deleteVehicleClassName}
      />

      {/* Export Dialog */}
      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
};

export default MasterVehicleClassModule;
