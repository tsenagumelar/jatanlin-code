import { useMemo } from "react";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetVehicleActualsQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import {
  checkOdolViolation,
  getOdolTolerances,
  type VehicleActual,
  type VehicleClassLimit,
} from "@/src/utils/odol";
import type { V3DashboardData } from "./types";

function formatShortDate(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDateTime(dateValue?: string | null) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isToday(dateValue?: string | null) {
  if (!dateValue) return false;

  const date = new Date(dateValue);
  const today = new Date();

  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
}

function isViolationResult(value?: string | null) {
  return Boolean(value && value !== "Normal");
}

function formatViolationLabel(value: string) {
  if (value === "Over Dimension & Over Loading") {
    return "Over Dimension & Over Loading";
  }
  if (value === "Over Dimension") return "Over Dimension";
  if (value === "Over Loading") return "Over Loading";
  if (value === "Pending") return "Menunggu";
  return value;
}

function getViolationArticle(value: string) {
  const hasDimension = value.includes("Dimension");
  const hasLoading = value.includes("Loading");

  if (hasDimension && hasLoading) return "Pasal 277 & 278";
  if (hasDimension) return "Pasal 277";
  if (hasLoading) return "Pasal 278";
  return "-";
}

export function useV3Dashboard(): V3DashboardData {
  const dashboardRange = useMemo(() => {
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);

    return {
      startDate,
      startDateIso: startDate.toISOString(),
    };
  }, []);

  const vehicleActualsQuery = useGetVehicleActualsQuery({
    variables: { limit: 500, offset: 0 },
    fetchPolicy: "network-only",
    pollInterval: 60_000,
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

  const dashboard = useMemo(() => {
    const vehicles = vehicleActualsQuery.data?.transact_vehicle_actual ?? [];
    const vehicleClasses = vehicleClassesQuery.data?.master_vehicle_class ?? [];
    const tolerances = getOdolTolerances(configsQuery.data?.master_config);

    const trendMap = new Map<
      string,
      {
        date: string;
        overDimension: number;
        overLoading: number;
        normal: number;
      }
    >();
    for (let i = 0; i < 7; i++) {
      const date = new Date(dashboardRange.startDate);
      date.setDate(dashboardRange.startDate.getDate() + i);
      trendMap.set(dateKey(date), {
        date: formatShortDate(date),
        overDimension: 0,
        overLoading: 0,
        normal: 0,
      });
    }

    let odolVehicles = 0;
    let totalViolations = 0;
    let normalVehicles = 0;
    let todayViolations = 0;
    let overDimension = 0;
    let overLoading = 0;
    const recentViolations: V3DashboardData["recentViolations"] = [];
    let heaviest = { plate: "-", weight: 0 };
    let dimension = { plate: "-", volume: 0, label: "-" };
    const articleCounts = new Map<string, number>();

    vehicles.forEach((vehicle) => {
      const createdDate = vehicle.created_date
        ? new Date(vehicle.created_date)
        : null;
      const latestStatus = vehicle.transact_vehicle_statuses?.[0];
      const verificationStatus = latestStatus?.status;
      const verifiedResult =
        verificationStatus === "verified" ? latestStatus?.result : null;

      const axleCount =
        vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || 0;
      const vehicleClass = vehicleClasses.find(
        (item) => item.total_axle === axleCount,
      );
      const actualWeight = Number(vehicle.actual_weight || 0);
      const actualLength = Number(
        vehicle.actual_length || vehicle.transact_dimension?.length || 0,
      );
      const actualWidth = Number(
        vehicle.actual_width || vehicle.transact_dimension?.width || 0,
      );
      const actualHeight = Number(
        vehicle.actual_height || vehicle.transact_dimension?.height || 0,
      );
      const plate =
        vehicle.actual_plat_no ||
        vehicle.transact_anpr_capture?.plate_no ||
        "-";

      let result = "Normal";

      if (vehicleClass) {
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

        result = checkOdolViolation(actual, limit, {
          axleCount,
          toleranceWeightPercent: tolerances.weightPercent,
          toleranceDimPercent: tolerances.dimPercent,
        });
      }

      const effectiveResult =
        verificationStatus === "rejected" ? "Normal" : verifiedResult || result;
      const isViolation = isViolationResult(effectiveResult);
      const trend = createdDate
        ? trendMap.get(dateKey(createdDate))
        : undefined;
      const article = getViolationArticle(effectiveResult);

      if (isViolation) {
        odolVehicles++;
        totalViolations++;
        if (isToday(vehicle.created_date)) {
          todayViolations++;
        }
        if (effectiveResult.includes("Dimension")) {
          overDimension++;
          if (trend) trend.overDimension++;
        }
        if (effectiveResult.includes("Loading")) {
          overLoading++;
          if (trend) trend.overLoading++;
        }
        articleCounts.set(article, (articleCounts.get(article) ?? 0) + 1);

        recentViolations.push({
          id: String(vehicle.id),
          no: 0,
          time: formatShortDateTime(vehicle.created_date),
          plate,
          location:
            vehicle.location_address ||
            vehicle.transact_anpr_capture?.location_code ||
            "-",
          type: formatViolationLabel(effectiveResult),
          article,
          officer: "-",
          status: verificationStatus || "pending",
        });
      } else {
        normalVehicles++;
        if (trend) trend.normal++;
      }

      if (isViolation && actualWeight > heaviest.weight) {
        heaviest = { plate, weight: actualWeight };
      }
      const volume = actualLength * actualWidth * actualHeight;
      if (isViolation && volume > dimension.volume) {
        dimension = {
          plate,
          volume,
          label: `${actualLength || 0} x ${actualWidth || 0} x ${
            actualHeight || 0
          } m`,
        };
      }
    });
    const topArticleEntry = Array.from(articleCounts.entries()).sort(
      (a, b) => b[1] - a[1],
    )[0];

    return {
      metrics: [
        {
          label: "Kendaraan ODOL",
          value: odolVehicles,
          tone: "danger" as const,
          icon: "odol" as const,
        },
        {
          label: "Total Pelanggaran",
          value: totalViolations,
          tone: "warning" as const,
          icon: "violation" as const,
        },
        {
          label: "Kendaraan Normal",
          value: normalVehicles,
          tone: "success" as const,
          icon: "normal" as const,
        },
        {
          label: "Pelanggaran Hari Ini",
          value: todayViolations,
          tone: "info" as const,
          icon: "today" as const,
        },
      ],
      trendData: Array.from(trendMap.values()),
      distributionData: [
        { name: "Over Dimension", value: overDimension, color: "#dc2626" },
        { name: "Over Loading", value: overLoading, color: "#f59e0b" },
        { name: "Normal", value: normalVehicles, color: "#059669" },
      ],
      recentViolations: recentViolations
        .slice(0, 10)
        .map((row, index) => ({ ...row, no: index + 1 })),
      heaviest: {
        plate: heaviest.plate,
        value:
          heaviest.weight > 0
            ? `${(heaviest.weight / 1000).toLocaleString("id-ID", {
                maximumFractionDigits: 2,
              })} ton`
            : "-",
        helper: "Kendaraan pelanggar terberat",
      },
      dimension: {
        plate: dimension.plate,
        value: dimension.label,
        helper: "Dimensi kendaraan pelanggar: P x L x T",
      },
      topArticle: {
        plate: topArticleEntry?.[0] ?? "-",
        value: topArticleEntry ? `${topArticleEntry[1]} kasus` : "-",
        helper: "Pelanggaran paling sering berdasarkan pasal",
      },
    };
  }, [
    dashboardRange.startDate,
    configsQuery.data?.master_config,
    vehicleActualsQuery.data?.transact_vehicle_actual,
    vehicleClassesQuery.data?.master_vehicle_class,
  ]);

  const error =
    vehicleActualsQuery.error?.message ||
    vehicleClassesQuery.error?.message ||
    configsQuery.error?.message ||
    null;

  return {
    title: "Jatanlin",
    description: "Ringkasan operasional kendaraan ODOL dan pelanggaran.",
    metrics: dashboard.metrics,
    trendData: dashboard.trendData,
    distributionData: dashboard.distributionData,
    recentViolations: dashboard.recentViolations,
    heaviest: dashboard.heaviest,
    dimension: dashboard.dimension,
    topArticle: dashboard.topArticle,
    isLoading:
      vehicleActualsQuery.loading ||
      vehicleClassesQuery.loading ||
      configsQuery.loading,
    error,
  };
}
