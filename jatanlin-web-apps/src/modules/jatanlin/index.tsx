/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Button } from "@fluentui/react-components";
import {
  ArrowSync24Regular,
  Play24Regular,
  ArrowDownload24Regular,
} from "@fluentui/react-icons";
import { ExportDialog } from "@/src/components/organisms";
import { exportToExcel, exportToPDF, ExportColumn } from "@/src/utils/export";
import moment from "moment";
import { useVehicleActualList } from "./hooks";
import { VehicleActualTable } from "./components/VehicleActualTable";
import { VehicleActualFilters } from "./components/VehicleActualFilters";
import { VehicleActualPagination } from "./components/VehicleActualPagination";
import type { VehicleActualData } from "./types";
import { useRouter } from "next/navigation";
import { useProcessing } from "@/src/contexts/ProcessingContext";

export const JatanlinModule: React.FC = () => {
  const router = useRouter();
  const [exportDialogOpen, setExportDialogOpen] = React.useState(false);
  const { resetProcessing } = useProcessing();

  type VehicleStatus = {
    status?: string | null;
    result?: string | null;
  };

  const {
    vehicleActuals,
    totalCount,
    loading,
    page,
    rowsPerPage,
    filters,
    handleChangePage,
    handleChangeRowsPerPage,
    handleFilterChange,
    handleRefresh,
  } = useVehicleActualList();

  const handleViewVehicle = (vehicle: VehicleActualData) => {
    // Navigate to detail page (will be created later)
    router.push(`/jatanlin/${vehicle.id}`);
  };

  const handleVerifyVehicle = (vehicle: VehicleActualData) => {
    // Navigate to verification page
    router.push(`/jatanlin/${vehicle.id}/verify`);
  };

  const handleStartSystem = () => {
    resetProcessing();
    router.push("/processing");
  };

  const formatDateTime = (dateString: string | null | undefined) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleString("id-ID", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getLatestStatus = (statuses: VehicleStatus[] | null | undefined): string => {
    if (!statuses || statuses.length === 0) return "pending";
    return statuses[0].status || "pending";
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "verified":
        return "Terverifikasi";
      case "rejected":
        return "Ditolak";
      case "draft":
        return "Draf";
      case "processing":
        return "Diproses";
      default:
        return "Menunggu";
    }
  };

  const getViolationType = (statuses: VehicleStatus[] | null | undefined) => {
    if (!statuses || statuses.length === 0) return "-";
    return statuses[0].result || "-";
  };

  const handleExportExcel = async () => {
    const columns: ExportColumn[] = [
      { header: "Plat Nomor", key: "plate_no", width: 18 },
      { header: "Waktu Kejadian", key: "captured_at", width: 22 },
      { header: "Dimensi (P×L×T m)", key: "dimensions", width: 22 },
      { header: "Berat (ton)", key: "weight", width: 12 },
      { header: "Jumlah Sumbu", key: "axle", width: 14 },
      { header: "Jenis Pelanggaran", key: "violation", width: 22 },
      { header: "Status", key: "status", width: 14 },
    ];

    const exportData = vehicleActuals.map((vehicle) => ({
      plate_no:
        vehicle.actual_plat_no ||
        vehicle.transact_anpr_capture?.plate_no ||
        "-",
      captured_at: formatDateTime(
        vehicle.transact_anpr_capture?.captured_at || vehicle.created_date
      ),
      dimensions: `${vehicle.actual_length || "-"} × ${
        vehicle.actual_width || "-"
      } × ${vehicle.actual_height || "-"}`,
      weight: vehicle.actual_weight || "-",
      axle: vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || "-",
      violation: getViolationType(vehicle.transact_vehicle_statuses),
      status: getStatusLabel(getLatestStatus(vehicle.transact_vehicle_statuses)),
    }));

    try {
      await exportToExcel(exportData, columns, {
        filename: `Transaksi_Jatanlin_${moment().format("YYYYMMDD_HHmmss")}`,
        sheetName: "Transaksi Jatanlin",
      });
    } catch {
      // ExportDialog already handled in master-user; keep silent here.
    }
  };

  const handleExportPDF = async () => {
    const columns: ExportColumn[] = [
      { header: "Plat Nomor", key: "plate_no", width: 26 },
      { header: "Waktu Kejadian", key: "captured_at", width: 28 },
      { header: "Dimensi (P×L×T m)", key: "dimensions", width: 26 },
      { header: "Berat (ton)", key: "weight", width: 16 },
      { header: "Jumlah Sumbu", key: "axle", width: 18 },
      { header: "Jenis Pelanggaran", key: "violation", width: 26 },
      { header: "Status", key: "status", width: 18 },
    ];

    const exportData = vehicleActuals.map((vehicle) => ({
      plate_no:
        vehicle.actual_plat_no ||
        vehicle.transact_anpr_capture?.plate_no ||
        "-",
      captured_at: formatDateTime(
        vehicle.transact_anpr_capture?.captured_at || vehicle.created_date
      ),
      dimensions: `${vehicle.actual_length || "-"} × ${
        vehicle.actual_width || "-"
      } × ${vehicle.actual_height || "-"}`,
      weight: vehicle.actual_weight || "-",
      axle: vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || "-",
      violation: getViolationType(vehicle.transact_vehicle_statuses),
      status: getStatusLabel(getLatestStatus(vehicle.transact_vehicle_statuses)),
    }));

    try {
      await exportToPDF(exportData, columns, {
        filename: `Transaksi_Jatanlin_${moment().format("YYYYMMDD_HHmmss")}`,
        title: "Transaksi Jatanlin",
      });
    } catch {
      // ExportDialog already handled in master-user; keep silent here.
    }
  };

  return (
    <div className="flex flex-col h-full p-6">
      {/* Header */}
      <div className="mb-4 shrink-0">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Jatanlin</h1>
            <p className="text-sm text-gray-600 mt-1">
              Monitoring transaksi kendaraan waktu nyata
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
              icon={<Play24Regular />}
              onClick={handleStartSystem}
            >
              Mulai Sistem
            </Button>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="shrink-0">
        <VehicleActualFilters
          filters={filters}
          onFilterChange={handleFilterChange}
        />
      </div>

      {/* Table Container - Takes remaining space */}
      <div className="flex-1 flex flex-col bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <VehicleActualTable
            vehicleActuals={vehicleActuals}
            loading={loading}
            onView={handleViewVehicle}
            onVerify={handleVerifyVehicle}
          />
        </div>

        {/* Pagination */}
        {!loading && vehicleActuals.length > 0 && (
          <div className="shrink-0">
            <VehicleActualPagination
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={handleChangePage}
              onRowsPerPageChange={handleChangeRowsPerPage}
            />
          </div>
        )}
      </div>

      <ExportDialog
        open={exportDialogOpen}
        onOpenChange={setExportDialogOpen}
        onExportExcel={handleExportExcel}
        onExportPDF={handleExportPDF}
      />
    </div>
  );
};

export default JatanlinModule;
