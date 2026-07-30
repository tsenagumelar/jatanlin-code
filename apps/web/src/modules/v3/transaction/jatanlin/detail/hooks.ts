"use client";

import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetVehicleActualByIdQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import {
  checkOdolViolation,
  getOdolTolerances,
  type VehicleActual,
  type VehicleClassLimit,
} from "@/src/utils/odol";
import { getImageUrl, getMinioImageUrl } from "@/src/utils/image";
import type {
  V3DetailField,
  V3DetailMetric,
  V3JatanlinDetailProps,
  V3JatanlinDetailRecord,
  V3MediaItem,
} from "./types";

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatNumber(value?: string | number | null, fractionDigits = 2) {
  if (value === null || value === undefined || value === "") return "-";
  const numberValue = Number(value);
  if (Number.isNaN(numberValue)) return "-";

  return numberValue.toLocaleString("id-ID", {
    maximumFractionDigits: fractionDigits,
  });
}

function formatWeight(value?: string | number | null) {
  if (value === null || value === undefined || value === "") return "-";
  return `${formatNumber(Number(value) / 1000)} ton`;
}

function formatDimensions(record?: V3JatanlinDetailRecord | null) {
  const length = record?.actual_length ?? record?.transact_dimension?.length;
  const width = record?.actual_width ?? record?.transact_dimension?.width;
  const height = record?.actual_height ?? record?.transact_dimension?.height;

  if (
    length === null ||
    length === undefined ||
    width === null ||
    width === undefined ||
    height === null ||
    height === undefined
  ) {
    return "-";
  }

  return `${formatNumber(length, 1)} x ${formatNumber(width, 1)} x ${formatNumber(height, 1)} m`;
}

function getPlate(record?: V3JatanlinDetailRecord | null) {
  return record?.actual_plat_no || record?.transact_anpr_capture?.plate_no || "-";
}

function getAxle(record?: V3JatanlinDetailRecord | null) {
  return record?.transact_weighing?.total_axle || record?.actual_total_axle || "-";
}

function getLatestStatus(record?: V3JatanlinDetailRecord | null) {
  return record?.transact_vehicle_statuses?.[0] || null;
}

function getStatusLabel(status?: string | null) {
  if (status === "verified") return "Terverifikasi";
  if (status === "rejected") return "Ditolak";
  if (status === "draft") return "Draf";
  return "Menunggu";
}

function getStatusTone(status?: string | null) {
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

function isVideoUrl(url: string) {
  return /\.(mp4|webm|ogg|mov|m4v)$/i.test(url.split("?")[0] || "");
}

function getAnprFullImage(record?: V3JatanlinDetailRecord | null) {
  const anpr = record?.transact_anpr_capture;
  return getMinioImageUrl(anpr?.minio_bucket, anpr?.minio_full_image_object);
}

function getAnprPlateImage(record?: V3JatanlinDetailRecord | null) {
  const anpr = record?.transact_anpr_capture;
  return getMinioImageUrl(anpr?.minio_bucket, anpr?.minio_plate_image_object);
}

function getAxleImage(record?: V3JatanlinDetailRecord | null) {
  const axle = record?.transact_axle_capture;
  return getMinioImageUrl(axle?.minio_bucket, axle?.minio_image_object);
}

function getCctvUrl(record?: V3JatanlinDetailRecord | null) {
  return getImageUrl(record?.transact_cctv?.filepath || null);
}

function getViolation(
  record: V3JatanlinDetailRecord | null | undefined,
  classes: Array<VehicleClassLimit & { total_axle?: number | null }>,
  configs: Parameters<typeof getOdolTolerances>[0],
) {
  const latestStatus = getLatestStatus(record);
  if (latestStatus?.status === "verified" && latestStatus.result) {
    return latestStatus.result;
  }

  if (!record) return "Pending";

  const axleCount = Number(record.transact_weighing?.total_axle || record.actual_total_axle || 0);
  const actualWeight = Number(record.actual_weight || 0);
  const actualLength = Number(record.actual_length || record.transact_dimension?.length || 0);
  const actualWidth = Number(record.actual_width || record.transact_dimension?.width || 0);
  const actualHeight = Number(record.actual_height || record.transact_dimension?.height || 0);
  const vehicleClass = classes.find((item) => item.total_axle === axleCount);

  if (
    !vehicleClass ||
    !axleCount ||
    !actualWeight ||
    !actualLength ||
    !actualWidth ||
    !actualHeight
  ) {
    return "Pending";
  }

  const tolerances = getOdolTolerances(configs);
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

  return checkOdolViolation(actual, limit, {
    axleCount,
    toleranceWeightPercent: tolerances.weightPercent,
    toleranceDimPercent: tolerances.dimPercent,
  });
}

function getSummaryFields(record?: V3JatanlinDetailRecord | null): V3DetailField[] {
  return [
    { label: "ID Transaksi", value: String(record?.id || "-") },
    { label: "Session ID", value: String(record?.session_id || "-") },
    { label: "Waktu Dibuat", value: formatDateTime(record?.created_date) },
    { label: "Terakhir Diperbarui", value: formatDateTime(record?.updated_date) },
    {
      label: "Lokasi",
      value:
        record?.location_address ||
        record?.transact_anpr_capture?.location_code ||
        "-",
    },
  ];
}

function getSourceFields(record?: V3JatanlinDetailRecord | null) {
  return {
    anpr: [
      { label: "Nomor Plat", value: record?.transact_anpr_capture?.plate_no || "-" },
      { label: "Confidence", value: formatNumber(record?.transact_anpr_capture?.confidence, 2) },
      { label: "Camera ID", value: record?.transact_anpr_capture?.camera_id || "-" },
      { label: "Waktu Tangkapan", value: formatDateTime(record?.transact_anpr_capture?.captured_at) },
    ],
    axle: [
      { label: "Nomor Plat", value: record?.transact_axle_capture?.plate_no || "-" },
      { label: "Total Sumbu", value: String(record?.transact_axle_capture?.total_axles || "-") },
      { label: "Total Roda", value: String(record?.transact_axle_capture?.total_wheels || "-") },
      { label: "Tipe Kendaraan", value: record?.transact_axle_capture?.vehicle_body_type || "-" },
      {
        label: "Panjang",
        value: record?.transact_axle_capture?.length_mm
          ? `${formatNumber(record.transact_axle_capture.length_mm / 1000, 2)} m`
          : "-",
      },
    ],
    wim: [
      { label: "Total Berat", value: formatWeight(record?.transact_weighing?.total_weight) },
      { label: "Total Sumbu", value: String(record?.transact_weighing?.total_axle || "-") },
      { label: "Aktif", value: record?.transact_weighing?.is_active ? "Ya" : "Tidak" },
      { label: "Waktu Dibuat", value: formatDateTime(record?.transact_weighing?.created_date) },
    ],
    dimension: [
      { label: "Panjang", value: `${formatNumber(record?.transact_dimension?.length, 1)} m` },
      { label: "Lebar", value: `${formatNumber(record?.transact_dimension?.width, 1)} m` },
      { label: "Tinggi", value: `${formatNumber(record?.transact_dimension?.height, 1)} m` },
      { label: "Waktu Dibuat", value: formatDateTime(record?.transact_dimension?.created_date) },
    ],
  };
}

function getMetrics(record: V3JatanlinDetailRecord | null | undefined): V3DetailMetric[] {
  return [
    {
      label: "Nomor Plat",
      value: getPlate(record),
      helper: "Terdeteksi oleh ANPR",
      tone: "bg-blue-50 text-blue-700",
    },
    {
      label: "Berat Aktual",
      value: formatWeight(record?.actual_weight),
      helper: "Berat aktual kendaraan",
      tone: "bg-red-50 text-red-700",
    },
    {
      label: "Sumbu Aktual",
      value: String(getAxle(record)),
      helper: "Hasil sensor sumbu",
      tone: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Dimensi",
      value: formatDimensions(record),
      helper: "Panjang x lebar x tinggi",
      tone: "bg-violet-50 text-violet-700",
    },
  ];
}

function getMediaItems(record?: V3JatanlinDetailRecord | null): V3MediaItem[] {
  const anprUrl = getAnprFullImage(record);
  const plateUrl = getAnprPlateImage(record);
  const axleUrl = getAxleImage(record);
  const cctvUrl = getCctvUrl(record);

  return [
    anprUrl && {
      title: "Tangkapan Penuh ANPR",
      subtitle: "Tampilan kendaraan dari kamera ANPR",
      url: anprUrl,
      type: "image" as const,
    },
    plateUrl && {
      title: "Tangkapan Plat",
      subtitle: "Potongan plat yang terdeteksi",
      url: plateUrl,
      type: "image" as const,
    },
    axleUrl && {
      title: "Tangkapan Sumbu",
      subtitle: "Bukti sensor sumbu",
      url: axleUrl,
      type: "image" as const,
    },
    cctvUrl && {
      title: "Bukti CCTV",
      subtitle: record?.transact_cctv?.filename || "Bukti video atau gambar",
      url: cctvUrl,
      type: isVideoUrl(cctvUrl) ? ("video" as const) : ("image" as const),
    },
  ].filter(Boolean) as V3MediaItem[];
}

export function useV3JatanlinDetail({ id }: V3JatanlinDetailProps) {
  const vehicleActualQuery = useGetVehicleActualByIdQuery({
    variables: { id },
    fetchPolicy: "network-only",
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

  const record = vehicleActualQuery.data?.transact_vehicle_actual_by_pk || null;
  const latestStatus = getLatestStatus(record);
  const violation = getViolation(
    record,
    vehicleClassesQuery.data?.master_vehicle_class ?? [],
    configsQuery.data?.master_config,
  );

  return {
    record,
    latestStatus,
    violation,
    metrics: getMetrics(record),
    mediaItems: getMediaItems(record),
    summaryFields: getSummaryFields(record),
    sourceFields: getSourceFields(record),
    isLoading:
      vehicleActualQuery.loading ||
      vehicleClassesQuery.loading ||
      configsQuery.loading,
    error:
      vehicleActualQuery.error?.message ||
      vehicleClassesQuery.error?.message ||
      configsQuery.error?.message ||
      null,
    formatDateTime,
    getPlate,
    getStatusLabel,
    getStatusTone,
    getViolationTone,
    getViolationLabel,
  };
}
