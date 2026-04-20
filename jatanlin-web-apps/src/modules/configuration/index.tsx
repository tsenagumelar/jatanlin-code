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
import { ArrowSync24Regular } from '@fluentui/react-icons';
import { useConfigList } from './hooks';
import { ConfigTable } from './components/ConfigTable';
import { ConfigEditDialog } from './components/ConfigEditDialog';
import { ConfigFilters } from './components/ConfigFilters';
import { ConfigPagination } from './components/ConfigPagination';
import { ConfigDetailDialog } from './components/ConfigDetailDialog';
import type { ConfigData } from './types';

export const ConfigurationModule: React.FC = () => {
  const toasterId = useId('toaster');
  const { dispatchToast } = useToastController(toasterId);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editConfig, setEditConfig] = useState<ConfigData | null>(null);
  const [viewConfig, setViewConfig] = useState<ConfigData | null>(null);

  const {
    configs,
    totalCount,
    loading,
    page,
    rowsPerPage,
    filters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    handleRefresh,
  } = useConfigList();

  const handleViewConfig = (config: ConfigData) => {
    setViewConfig(config);
    setDetailOpen(true);
  };

  const handleEditConfig = (config: ConfigData) => {
    setEditConfig(config);
    setEditDialogOpen(true);
  };

  const handleEditSuccess = () => {
    handleRefresh();
    dispatchToast(
      <Toast>
        <ToastTitle>Konfigurasi berhasil diperbarui</ToastTitle>
      </Toast>,
      { intent: 'success' }
    );
  };

  return (
    <div className="flex flex-col h-full p-6">
      <Toaster toasterId={toasterId} />

      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Konfigurasi</h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola konfigurasi sistem
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
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <ConfigFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <ConfigTable
            configs={configs}
            loading={loading}
            onView={handleViewConfig}
            onEdit={handleEditConfig}
          />
        </div>

        {/* Pagination */}
        {!loading && configs.length > 0 && (
          <div className="shrink-0">
            <ConfigPagination
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
      <ConfigDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setViewConfig(null);
        }}
        config={viewConfig}
      />

      {/* Edit Dialog */}
      <ConfigEditDialog
        open={editDialogOpen}
        onClose={() => setEditDialogOpen(false)}
        onSuccess={handleEditSuccess}
        editConfig={editConfig}
      />
    </div>
  );
};

export default ConfigurationModule;
