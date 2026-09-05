"use client";

import { useMemo, useState } from "react";
import { useApolloClient } from "@apollo/client";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
  GetVehicleActualsDocument,
  type GetVehicleActualsQuery,
  useGetVehicleActualsQuery,
  useSoftDeleteVehicleActualMutation,
} from "@/src/graphql/hooks/transact-vehicle-actual";
import { useAppSelector } from "@/src/redux/hooks";
import { getMinioImageUrl } from "@/src/utils/image";
import type { Transact_Vehicle_Actual_Bool_Exp } from "@/src/graphql/schema/types";
import type { V3JatanlinFilters, V3JatanlinRow } from "./types";

const PAGE_SIZE = 10;
const EXPORT_BATCH_SIZE = 500;
const SITE_TIME_ZONE =
  process.env.NEXT_PUBLIC_SITE_TIMEZONE || "Asia/Jakarta";
const VERIFIED_RESULTS = [
  "Normal",
  "Over Dimension",
  "Over Loading",
  "Over Dimension & Over Loading",
];

const initialFilters: V3JatanlinFilters = {
  search: "",
  violation: "",
  startDate: "",
  endDate: "",
};

const violationOptions = [
  { value: "", label: "Semua Pelanggaran" },
  { value: "Over Loading", label: "Over Loading" },
  { value: "Over Dimension", label: "Over Dimension" },
  { value: "Over Dimension & Over Loading", label: "Over Dimension & Over Loading" },
  { value: "Normal", label: "Normal" },
  { value: "Pending", label: "Menunggu" },
];

function timeZoneOffset(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  const representedAsUtc = Date.UTC(
    Number(value.year),
    Number(value.month) - 1,
    Number(value.day),
    Number(value.hour),
    Number(value.minute),
    Number(value.second),
  );
  return representedAsUtc - date.getTime();
}

function siteDateBoundary(dateValue: string, nextDay: boolean, timeZone: string) {
  const [year, month, day] = dateValue.split("-").map(Number);
  const desiredUtc = Date.UTC(year, month - 1, day + (nextDay ? 1 : 0));
  let result = new Date(desiredUtc - timeZoneOffset(new Date(desiredUtc), timeZone));
  result = new Date(desiredUtc - timeZoneOffset(result, timeZone));
  return result.toISOString();
}

function buildWhere(
  filters: V3JatanlinFilters,
  siteId: string,
  timeZone: string,
): Transact_Vehicle_Actual_Bool_Exp {
  const conditions: Transact_Vehicle_Actual_Bool_Exp[] = [
    { site_id: { _eq: siteId } },
  ];
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
      created_date: {
        _gte: siteDateBoundary(filters.startDate, false, timeZone),
      },
    });
  }

  if (filters.endDate) {
    conditions.push({
      created_date: {
        _lt: siteDateBoundary(filters.endDate, true, timeZone),
      },
    });
  }

  if (filters.violation === "Pending") {
    conditions.push({
      _or: [
        { verification_status: { _neq: "VERIFIED" } },
        {
          _not: {
            transact_vehicle_statuses: {
              is_active: { _eq: true },
              is_deleted: { _eq: false },
              status: { _eq: "verified" },
              result: { _in: VERIFIED_RESULTS },
            },
          },
        },
      ],
    });
  } else if (filters.violation) {
    conditions.push({
      verification_status: { _eq: "VERIFIED" },
      transact_vehicle_statuses: {
        is_active: { _eq: true },
        is_deleted: { _eq: false },
        status: { _eq: "verified" },
        result: { _eq: filters.violation },
      },
    });
  }

  return { _and: conditions };
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    timeZone: SITE_TIME_ZONE,
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: string | number | null, fractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  return Number(value).toLocaleString("id-ID", {
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
  const length = row.actual_length;
  const width = row.actual_width;
  const height = row.actual_height;
  if (length === null || width === null || height === null) return "-";
  if (length === undefined || width === undefined || height === undefined) return "-";
  return `${formatNumber(length, 1)} x ${formatNumber(width, 1)} x ${formatNumber(height, 1)} m`;
}

function getAxle(row: V3JatanlinRow) {
  return row.actual_total_axle || "-";
}

function getPhotoUrl(row: V3JatanlinRow) {
  const anpr = row.transact_anpr_capture;
  if (anpr?.minio_bucket && anpr.minio_full_image_object) {
    return getMinioImageUrl(anpr.minio_bucket, anpr.minio_full_image_object);
  }
  const axle = row.transact_axle_capture;
  if (axle?.minio_bucket && axle.minio_image_object) {
    return getMinioImageUrl(axle.minio_bucket, axle.minio_image_object);
  }
  return "";
}

function getLatestStatusLabel(status: string) {
  if (status === "verified") return "Terverifikasi";
  if (status === "rejected") return "Ditolak";
  if (status === "draft") return "Draf";
  return "Menunggu";
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

function getViolationLabel(violation: string) {
  if (violation === "Over Dimension & Over Loading") {
    return "Over Dimension & Over Loading";
  }
  if (violation === "Over Dimension") return "Over Dimension";
  if (violation === "Over Loading") return "Over Loading";
  if (violation === "Pending") return "Menunggu";
  return violation;
}

function getExportRows(rows: V3JatanlinRow[]) {
  return rows.map((row, index) => [
    String(index + 1),
    row.actual_plat_no || "-",
    formatDateTime(row.created_date),
    row.location_address || "-",
    String(getAxle(row)),
    getWeight(row),
    getDimensions(row),
    getViolationLabel(row.violationType),
    getLatestStatusLabel(row.latestStatus),
    row.completeness_status || "-",
    row.actual_data_origin || "-",
    row.missing_sources?.join(", ") || "-",
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
  const apolloClient = useApolloClient();
  const currentUser = useAppSelector((state) => state.login.user);
  const [filters, setFilters] = useState<V3JatanlinFilters>(initialFilters);
  const [page, setPage] = useState(0);
  const [actionError, setActionError] = useState<string | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<V3JatanlinRow | null>(null);
  const siteId = process.env.NEXT_PUBLIC_SITE_ID ?? "";
  const where = useMemo(
    () => buildWhere(filters, siteId, SITE_TIME_ZONE),
    [filters, siteId],
  );

  const vehicleActualsQuery = useGetVehicleActualsQuery({
    variables: { limit: PAGE_SIZE, offset: page * PAGE_SIZE, where },
    skip: !siteId,
    fetchPolicy: "network-only",
    pollInterval: 30_000,
  });
  const [softDeleteVehicleActual, deleteState] =
    useSoftDeleteVehicleActualMutation();
  const isAdmin = [
    currentUser?.master_role.code,
    currentUser?.master_role.role_name,
  ].some((role) => role?.toLowerCase().includes("admin"));

  const rows = useMemo<V3JatanlinRow[]>(() => {
    return (vehicleActualsQuery.data?.transact_vehicle_actual ?? []).map((row) => {
      const latestStatus = row.transact_vehicle_statuses?.[0];
      const latestStatusValue = latestStatus?.status?.toLowerCase() || "pending";
      const violationType =
        latestStatusValue === "verified" &&
        latestStatus?.result &&
        VERIFIED_RESULTS.includes(latestStatus.result)
          ? latestStatus.result
          : "Pending";

      return {
        ...row,
        violationType,
        latestStatus: latestStatusValue,
      };
    });
  }, [vehicleActualsQuery.data?.transact_vehicle_actual]);

  const totalCount =
    vehicleActualsQuery.data?.transact_vehicle_actual_aggregate.aggregate
      ?.count ?? 0;
  const totalPages = Math.max(Math.ceil(totalCount / PAGE_SIZE), 1);
  const startRow = totalCount === 0 ? 0 : page * PAGE_SIZE + 1;
  const endRow = Math.min((page + 1) * PAGE_SIZE, totalCount);

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
          : "Tidak dapat menghapus transaksi.",
      );
    }
  };

  const handleExport = async (format: "csv" | "pdf") => {
    const headers = [
      "No",
      "No. Plat",
      "Waktu",
      "Lokasi",
      "Sumbu",
      "Berat",
      "Dimensi",
      "Pelanggaran",
      "Status",
      "Kelengkapan",
      "Asal Data",
      "Source Tidak Masuk",
    ];
    const allRows: V3JatanlinRow[] = [];
    let offset = 0;
    let expectedCount = totalCount;
    do {
      const response = await apolloClient.query<GetVehicleActualsQuery>({
        query: GetVehicleActualsDocument,
        variables: { limit: EXPORT_BATCH_SIZE, offset, where },
        fetchPolicy: "network-only",
      });
      const batch = response.data.transact_vehicle_actual.map((row) => {
        const latestStatus = row.transact_vehicle_statuses?.[0];
        const latestStatusValue = latestStatus?.status?.toLowerCase() || "pending";
        return {
          ...row,
          latestStatus: latestStatusValue,
          violationType:
            latestStatusValue === "verified" &&
            latestStatus?.result &&
            VERIFIED_RESULTS.includes(latestStatus.result)
              ? latestStatus.result
              : "Pending",
        };
      });
      allRows.push(...batch);
      expectedCount =
        response.data.transact_vehicle_actual_aggregate.aggregate?.count ?? 0;
      offset += batch.length;
      if (batch.length === 0) break;
    } while (offset < expectedCount);

    const exportRows = getExportRows(allRows);

    if (exportRows.length === 0) {
      window.alert("Tidak ada data Jatanlin untuk diekspor.");
      return;
    }

    if (format === "csv") {
      downloadCsv("jatanlin-transactions.csv", [headers, ...exportRows]);
      return;
    }

    const doc = new jsPDF({ orientation: "landscape" });
    doc.setFontSize(14);
    doc.text("Transaksi Jatanlin", 14, 14);
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
    rows,
    page,
    pageSize: PAGE_SIZE,
    totalCount,
    totalPages,
    startRow,
    endRow,
    isLoading: vehicleActualsQuery.loading,
    isDeleting: deleteState.loading,
    isAdmin,
    error:
      actionError ||
      vehicleActualsQuery.error?.message ||
      (!siteId ? "NEXT_PUBLIC_SITE_ID belum dikonfigurasi." : null) ||
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
    getViolationLabel,
    formatDateTime,
  };
}
