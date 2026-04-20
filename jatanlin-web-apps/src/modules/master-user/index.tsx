/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState } from "react";
import {
  Toast,
  ToastTitle,
  Toaster,
  useToastController,
  useId,
} from "@fluentui/react-components";
import {
  Add24Regular,
  ArrowSync24Regular,
  ArrowDownload24Regular,
} from "@fluentui/react-icons";
import { useUserList, useUserDelete } from "./hooks";
import { UserTable } from "./components/UserTable";
import { UserFilters } from "./components/UserFilters";
import { UserPagination } from "./components/UserPagination";
import { UserForm } from "./components/UserForm";
import { UserDetailDialog } from "./components/UserDetailDialog";
import { DeleteConfirmDialog } from "./components/DeleteConfirmDialog";
import { ExportDialog } from "@/src/components/organisms";
import { exportToExcel, exportToPDF, ExportColumn } from "@/src/utils/export";
import moment from "moment";
import type { UserData } from "./types";
import { Button } from "@/src/components/atoms";

export const MasterUserModule: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [exportDialogOpen, setExportDialogOpen] = useState(false);
  const [editUser, setEditUser] = useState<UserData | null>(null);
  const [viewUser, setViewUser] = useState<UserData | null>(null);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [deleteUserName, setDeleteUserName] = useState<string>("");
  const [isDeleting, setIsDeleting] = useState(false);

  const {
    users,
    totalCount,
    loading,
    page,
    rowsPerPage,
    filters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    handleRefresh,
  } = useUserList();

  const { deleteUser } = useUserDelete();

  const handleAddUser = () => {
    setEditUser(null);
    setFormOpen(true);
  };

  const handleViewUser = (user: UserData) => {
    setViewUser(user);
    setDetailOpen(true);
  };

  const handleEditUser = (user: UserData) => {
    setEditUser(user);
    setFormOpen(true);
  };

  const handleDeleteClick = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (user) {
      setDeleteUserId(userId);
      setDeleteUserName(user.full_name);
      setDeleteDialogOpen(true);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteUserId) return;

    setIsDeleting(true);
    try {
      await deleteUser(deleteUserId, () => {
        handleRefresh();
        setDeleteDialogOpen(false);
        setDeleteUserId(null);
        setDeleteUserName("");
        dispatchToast(
          <Toast>
            <ToastTitle>Pengguna berhasil dihapus</ToastTitle>
          </Toast>,
          { intent: "success" }
        );
      });
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>{error.message}</ToastTitle>
        </Toast>,
        { intent: "error" }
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
          {editUser
            ? "Pengguna berhasil diperbarui"
            : "Pengguna berhasil ditambahkan"}
        </ToastTitle>
      </Toast>,
      { intent: "success" }
    );
  };

  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { header: "Nama Pengguna", key: "username", width: 15 },
      { header: "Nama Lengkap", key: "full_name", width: 20 },
      { header: "No. Lencana", key: "badge_no", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "No. Telepon", key: "phone_number", width: 15 },
      { header: "Peran", key: "master_role.role_name", width: 20 },
      { header: "Status", key: "is_active", width: 12 },
      { header: "Diperbarui", key: "updated_date", width: 18 },
    ];

    const exportData = users.map((user) => ({
      ...user,
      is_active: user.is_active ? "Aktif" : "Tidak Aktif",
      updated_date: user.updated_date
        ? moment(user.updated_date).format("DD-MM-YYYY HH:mm")
        : "-",
    }));

    try {
      await exportToExcel(exportData, columns, {
        filename: `Master_Data_Pengguna_${moment().format("YYYYMMDD_HHmmss")}`,
        sheetName: "Data Pengguna",
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Data berhasil diekspor ke Excel</ToastTitle>
        </Toast>,
        { intent: "success" }
      );
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {error?.message || "Gagal mengekspor data ke Excel"}
          </ToastTitle>
        </Toast>,
        { intent: "error" }
      );
    }
  };

  const handleExportPDF = async () => {
    const columns: ExportColumn[] = [
      { header: "Nama Pengguna", key: "username", width: 30 },
      { header: "Nama Lengkap", key: "full_name", width: 40 },
      { header: "No. Lencana", key: "badge_no", width: 25 },
      { header: "Email", key: "email", width: 45 },
      { header: "Peran", key: "master_role.role_name", width: 35 },
      { header: "Status", key: "is_active", width: 20 },
    ];

    const exportData = users.map((user) => ({
      ...user,
      is_active: user.is_active ? "Aktif" : "Tidak Aktif",
    }));

    try {
      await exportToPDF(exportData, columns, {
        filename: `Master_Data_Pengguna_${moment().format("YYYYMMDD_HHmmss")}`,
        title: "Master Data Pengguna",
      });
      dispatchToast(
        <Toast>
          <ToastTitle>Data berhasil diekspor ke PDF</ToastTitle>
        </Toast>,
        { intent: "success" }
      );
    } catch (error: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>
            {error?.message || "Gagal mengekspor data ke PDF"}
          </ToastTitle>
        </Toast>,
        { intent: "error" }
      );
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      <Toaster toasterId={toasterId} />

      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Master Data Pengguna
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Kelola data pengguna sistem
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
              variant="primary"
              appearance="primary"
              icon={<Add24Regular />}
              onClick={handleAddUser}
            >
              Tambah Pengguna
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0 mb-4">
        <UserFilters filters={filters} onFilterChange={handleFilterChange} />
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <UserTable
            users={users}
            loading={loading}
            onView={handleViewUser}
            onEdit={handleEditUser}
            onDelete={handleDeleteClick}
          />
        </div>

        {/* Pagination */}
        {!loading && users.length > 0 && (
          <div className="shrink-0">
            <UserPagination
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
      <UserDetailDialog
        open={detailOpen}
        onClose={() => {
          setDetailOpen(false);
          setViewUser(null);
        }}
        user={viewUser}
      />

      {/* Form Dialog */}
      <UserForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSuccess={handleFormSuccess}
        editUser={editUser}
      />

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setDeleteUserId(null);
          setDeleteUserName("");
        }}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        userName={deleteUserName}
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

export default MasterUserModule;
