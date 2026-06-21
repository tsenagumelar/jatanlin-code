"use client";

import { useMemo, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import {
  useGetVehicleActualsQuery,
  useSoftDeleteVehicleActualMutation,
} from "@/src/graphql/hooks/transact-vehicle-actual";
import { useAppSelector } from "@/src/redux/hooks";
import {
  checkOdolViolation,
  getOdolTolerances,
  type VehicleActual,
  type VehicleClassLimit,
} from "@/src/utils/odol";
import { getMinioImageUrl } from "@/src/utils/image";
import type { Transact_Vehicle_Actual_Bool_Exp } from "@/src/graphql/schema/types";
import type { V3JatanlinFilters, V3JatanlinRow } from "./types";

const PAGE_SIZE = 10;

const initialFilters: V3JatanlinFilters = {
  search: "",
  violation: "",
  startDate: "",
  endDate: "",
};

const violationOptions = [
  { value: "", label: "All Violations" },
  { value: "Over Loading", label: "Over Loading" },
  { value: "Over Dimension", label: "Over Dimension" },
  { value: "Over Dimension & Over Loading", label: "OD & OL" },
  { value: "Normal", label: "Normal" },
  { value: "Pending", label: "Pending" },
];

function buildWhere(filters: V3JatanlinFilters): Transact_Vehicle_Actual_Bool_Exp {
  const conditions: Transact_Vehicle_Actual_Bool_Exp[] = [];
  const search = filters.search.trim();

  if (search) {
    conditions.push({
      _or: [
        { actual_plat_no: { _ilike: `%${search}%` } },
        { transact_anpr_capture: { plate_no: { _ilike: `%${search}%` } } },
      ],
    });
  }

  if (filters.startDate) {
    conditions.push({
      created_date: { _gte: new Date(filters.startDate).toISOString() },
    });
  }

  if (filters.endDate) {
    conditions.push({
      created_date: {
        _lte: new Date(`${filters.endDate}T23:59:59`).toISOString(),
      },
    });
  }

  return conditions.length > 0 ? { _and: conditions } : {};
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: string | number | null, fractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString("en-US", {
    maximumFractionDigits: fractionDigits,
  });
}

function getPlate(row: V3JatanlinRow) {
  return row.actual_plat_no || row.transact_anpr_capture?.plate_no || "-";
}

function getWeight(row: V3JatanlinRow) {
  if (row.actual_weight === null || row.actual_weight === undefined) return "-";
  return `${formatNumber(Number(row.actual_weight) / 1000)} ton`;
}

function getDimensions(row: V3JatanlinRow) {
  const length = row.actual_length ?? row.transact_dimension?.length;
  const width = row.actual_width ?? row.transact_dimension?.width;
  const height = row.actual_height ?? row.transact_dimension?.height;
  if (length === null || width === null || height === null) return "-";
  if (length === undefined || width === undefined || height === undefined) return "-";
  return `${formatNumber(length, 1)} x ${formatNumber(width, 1)} x ${formatNumber(height, 1)} m`;
}

function getAxle(row: V3JatanlinRow) {
  return row.transact_weighing?.total_axle || row.actual_total_axle || "-";
}

function getPhotoUrl(row: V3JatanlinRow) {
  const anpr = row.transact_anpr_capture;
  if (!anpr?.minio_bucket || !anpr.minio_full_image_object) return "";
  return getMinioImageUrl(anpr.minio_bucket, anpr.minio_full_image_object);
}

function getLatestStatusLabel(status: string) {
  if (status === "verified") return "Verified";
  if (status === "rejected") return "Rejected";
  if (status === "draft") return "Draft";
  return "Pending";
}

function getStatusTone(status: string) {
  if (status === "verified") return "bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "bg-red-50 text-red-700";
  if (status === "draft") return "bg-sky-50 text-sky-700";
  return "bg-amber-50 text-amber-700";
}

function getViolationTone(violation: string) {
  if (violation === "Normal") return "bg-emerald-50 text-emerald-700";
  if (violation === "Pending") return "bg-amber-50 text-amber-700";
  if (violation.includes("&")) return "bg-purple-50 text-purple-700";
  if (violation.includes("Loading")) return "bg-red-50 text-red-700";
  return "bg-orange-50 text-orange-700";
}

function getExportRows(rows: V3JatanlinRow[]) {
  return rows.map((row, index) => [
    String(index + 1),
    getPlate(row),
    formatDateTime(row.created_date),
    row.location_address || row.transact_anpr_capture?.location_code || "-",
    String(getAxle(row)),
    getWeight(row),
    getDimensions(row),
    row.violationType,
    getLatestStatusLabel(row.latestStatus),
  ]);
}

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(","),
    )
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function useV3Jatanlin() {
  const currentUser = useAppSelector((state) => state.login.user);
  const [filters, setFilters] = useState<V3JatanlinFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<V3JatanlinRow | null>(null);
  const where = useMemo(() => buildWhere(filters), [filters]);

  const vehicleActualsQuery = useGetVehicleActualsQuery({
    variables: { limit: 200, offset: 0, where },
    fetchPolicy: "network-only",
    pollInterval: 30_000,
  });
  const vehicleClassesQuery = useGetVehicleClassesQuery({
    variables: { limit: 100, offset: 0 },
    fetchPolicy: "cache-and-network",
  });
  const configsQuery = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
    fetchPolicy: "cache-and-network",
  });
  const [softDeleteVehicleActual, deleteState] =
    useSoftDeleteVehicleActualMutation();
  const isAdmin = [
    currentUser?.master_role.code,
    currentUser?.master_role.role_name,
  ].some((role) => role?.toLowerCase().includes("admin"));

  const rows = useMemo<V3JatanlinRow[]>(() => {
    const classes = vehicleClassesQuery.data?.master_vehicle_class ?? [];
    const tolerances = getOdolTolerances(configsQuery.data?.master_config);

    return (vehicleActualsQuery.data?.transact_vehicle_actual ?? []).map((row) => {
      const latestStatus = row.transact_vehicle_statuses?.[0];
      const verifiedResult =
        latestStatus?.status === "verified" ? latestStatus.result : null;
      let violationType = verifiedResult || "Pending";

      if (!verifiedResult) {
        const axleCount =
          row.transact_weighing?.total_axle || row.actual_total_axle || 0;
        const actualWeight = Number(row.actual_weight || 0);
        const actualLength = Number(
          row.actual_length || row.transact_dimension?.length || 0,
        );
        const actualWidth = Number(
          row.actual_width || row.transact_dimension?.width || 0,
        );
        const actualHeight = Number(
          row.actual_height || row.transact_dimension?.height || 0,
        );
        const vehicleClass = classes.find(
          (item) => item.total_axle === axleCount,
        );

        if (
          vehicleClass &&
          axleCount &&
          actualWeight &&
          actualLength &&
          actualWidth &&
          actualHeight
        ) {
          const actual: VehicleActual = {
            total_weight: actualWeight / 1000,
            length: actualLength,
            width: actualWidth,
            height: actualHeight,
          };
          const limit: VehicleClassLimit = {
            ...vehicleClass,
            class_2_weight: Number(vehicleClass.class_2_weight || 0) / 1000,
            class_3_weight: Number(vehicleClass.class_3_weight || 0) / 1000,
          };
          violationType = checkOdolViolation(actual, limit, {
            axleCount,
            toleranceWeightPercent: tolerances.weightPercent,
            toleranceDimPercent: tolerances.dimPercent,
          });
        }
      }

      return {
        ...row,
        violationType,
        latestStatus: latestStatus?.status || "pending",
      };
    });
  }, [
    configsQuery.data?.master_config,
    vehicleActualsQuery.data?.transact_vehicle_actual,
    vehicleClassesQuery.data?.master_vehicle_class,
  ]);

  const filteredRows = useMemo(() => {
    if (!filters.violation) return rows;
    return rows.filter((row) => row.violationType === filters.violation);
  }, [filters.violation, rows]);

  const totalCount = filteredRows.length;
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const pagedRows = filteredRows.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);
  const startRow = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, totalCount);

  const counts = useMemo(() => {
    return rows.reduce(
      (acc, row) => {
        if (row.violationType === "Normal") acc.normal++;
        else if (row.violationType === "Pending") acc.pending++;
        else acc.violations++;
        return acc;
      },
      { total: rows.length, violations: 0, normal: 0, pending: 0 },
    );
  }, [rows]);

  const updateFilter = (field: keyof V3JatanlinFilters, value: string) => {
    setFilters((current) => ({ ...current, [field]: value }));
    setPage(0);
  };

  const resetDates = () => {
    setFilters((current) => ({ ...current, startDate: "", endDate: "" }));
    setPage(0);
  };

  const openDeleteModal = (row: V3JatanlinRow) => {
    if (!isAdmin || !currentUser) return;
    setActionError(null);
    setDeleteTarget(row);
  };

  const closeDeleteModal = () => {
    if (!deleteState.loading) setDeleteTarget(null);
  };

  const confirmDelete = async () => {
    if (!isAdmin || !currentUser || !deleteTarget) return;

    setActionError(null);
    try {
      await softDeleteVehicleActual({
        variables: {
          id: deleteTarget.id,
          updated_by: currentUser.id,
        },
      });
      await vehicleActualsQuery.refetch();
      setDeleteTarget(null);
    } catch (deleteError) {
      setActionError(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete transaction.",
      );
    }
  };

  const handleExport = (format: "csv" | "pdf") => {
    const headers = [
      "No",
      "Plate No",
      "Time",
      "Location",
      "Axle",
      "Weight",
      "Dimensions",
      "Violation",
      "Status",
    ];
    const exportRows = getExportRows(filteredRows);

    if (exportRows.length === 0) {
      window.alert("No Jatanlin data to export.");
      return;
    }

    if (format === "csv") {
      downloadCsv("jatanlin-transactions.csv", [headers, ...exportRows]);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Jatanlin Transactions", 14, 14);
    autoTable(doc, {
      head: [headers],
      body: exportRows,
      startY: 22,
      styles: { fontSize: 8 },
      headStyles: { fillColor: [29, 78, 216] },
    });
    doc.save("jatanlin-transactions.pdf");
  };

  return {
    filters,
    rows: pagedRows,
    counts,
    page,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,
    startRow,
    endRow,
    isLoading:
      vehicleActualsQuery.loading ||
      vehicleClassesQuery.loading ||
      configsQuery.loading,
    isDeleting: deleteState.loading,
    isAdmin,
    error:
      actionError ||
      vehicleActualsQuery.error?.message ||
      vehicleClassesQuery.error?.message ||
      configsQuery.error?.message ||
      null,
    violationOptions,
    updateFilter,
    resetDates,
    setPage,
    handleExport,
    deleteTarget,
    openDeleteModal,
    closeDeleteModal,
    confirmDelete,
    getPlate,
    getWeight,
    getDimensions,
    getAxle,
    getPhotoUrl,
    getLatestStatusLabel,
    getStatusTone,
    getViolationTone,
    formatDateTime,
  };
}
