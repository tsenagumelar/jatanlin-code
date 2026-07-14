import { useMemo } from "react";
import { gql, useQuery } from "@apollo/client";
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

const DASHBOARD_STATUS_QUERY = gql`
  query V3DashboardStatuses($startDate: timestamptz!) {
    transact_vehicle_status(
      where: {
        is_deleted: { _eq: false }
        created_date: { _gte: $startDate }
      }
      order_by: { created_date: desc }
      limit: 500
    ) {
      id
      status
      result
      created_date
      transact_vehicle_actual {
        id
        actual_plat_no
        actual_weight
        actual_length
        actual_width
        actual_height
        actual_total_axle
        location_address
        transact_anpr_capture {
          plate_no
          location_code
        }
      }
    }
  }
`;

type DashboardStatusRow = {
  id: string;
  status?: string | null;
  result?: string | null;
  created_date?: string | null;
  transact_vehicle_actual?: {
    id?: string | null;
    actual_plat_no?: string | null;
    actual_weight?: number | string | null;
    actual_length?: number | string | null;
    actual_width?: number | string | null;
    actual_height?: number | string | null;
    actual_total_axle?: number | null;
    location_address?: string | null;
    transact_anpr_capture?: {
      plate_no?: string | null;
      location_code?: string | null;
    } | null;
  } | null;
};

function formatShortDate(date: Date) {
  return date.toLocaleDateString("en-US", { day: "2-digit", month: "short" });
}

function dateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function formatShortDateTime(dateValue?: string | null) {
  if (!dateValue) return "-";
  return new Date(dateValue).toLocaleString("en-US", {
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

function getViolationArticle(value: string) {
  const hasDimension = value.includes("Dimension");
  const hasLoading = value.includes("Loading");

  if (hasDimension && hasLoading) return "Article 277 & 278";
  if (hasDimension) return "Article 277";
  if (hasLoading) return "Article 278";
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

  const statusQuery = useQuery<{ transact_vehicle_status: DashboardStatusRow[] }>(
    DASHBOARD_STATUS_QUERY,
    {
      variables: { startDate: dashboardRange.startDateIso },
      fetchPolicy: "network-only",
      pollInterval: 60_000,
    },
  );
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
    const statusRows = statusQuery.data?.transact_vehicle_status ?? [];
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

    statusRows.forEach((row) => {
      const result = row.result || "Normal";
      const isViolation = isViolationResult(result);
      const createdDate = row.created_date ? new Date(row.created_date) : null;
      const trend = createdDate ? trendMap.get(dateKey(createdDate)) : undefined;
      const actual = row.transact_vehicle_actual;
      const plate =
        actual?.actual_plat_no ||
        actual?.transact_anpr_capture?.plate_no ||
        "-";
      const article = getViolationArticle(result);

      if (isViolation) {
        odolVehicles++;
        totalViolations++;
        if (isToday(row.created_date)) todayViolations++;
        if (result.includes("Dimension")) {
          overDimension++;
          if (trend) trend.overDimension++;
        }
        if (result.includes("Loading")) {
          overLoading++;
          if (trend) trend.overLoading++;
        }
        articleCounts.set(article, (articleCounts.get(article) ?? 0) + 1);

        recentViolations.push({
          id: String(actual?.id || row.id),
          no: 0,
          time: formatShortDateTime(row.created_date),
          plate,
          location:
            actual?.location_address ||
            actual?.transact_anpr_capture?.location_code ||
            "-",
          type: result,
          article,
          officer: "-",
          status: row.status || "pending",
        });
      } else {
        normalVehicles++;
        if (trend) trend.normal++;
      }

      const actualWeight = Number(actual?.actual_weight || 0);
      if (isViolation && actualWeight > heaviest.weight) {
        heaviest = { plate, weight: actualWeight };
      }

      const actualLength = Number(actual?.actual_length || 0);
      const actualWidth = Number(actual?.actual_width || 0);
      const actualHeight = Number(actual?.actual_height || 0);
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

    vehicles.forEach((vehicle) => {
      if (statusRows.length > 0) return;

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
          type: effectiveResult,
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
          label: "ODOL Vehicles",
          value: odolVehicles,
          tone: "danger" as const,
          icon: "odol" as const,
        },
        {
          label: "Total Violations",
          value: totalViolations,
          tone: "warning" as const,
          icon: "violation" as const,
        },
        {
          label: "Normal Vehicles",
          value: normalVehicles,
          tone: "success" as const,
          icon: "normal" as const,
        },
        {
          label: "Today's Violations",
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
            ? `${(heaviest.weight / 1000).toLocaleString("en-US", {
                maximumFractionDigits: 2,
              })} ton`
            : "-",
        helper: "Heaviest violating vehicle",
      },
      dimension: {
        plate: dimension.plate,
        value: dimension.label,
        helper: "Violating vehicle dimensions: L x W x H",
      },
      topArticle: {
        plate: topArticleEntry?.[0] ?? "-",
        value: topArticleEntry ? `${topArticleEntry[1]} cases` : "-",
        helper: "Most frequent violation by article",
      },
    };
  }, [
    dashboardRange.startDate,
    configsQuery.data?.master_config,
    statusQuery.data?.transact_vehicle_status,
    vehicleActualsQuery.data?.transact_vehicle_actual,
    vehicleClassesQuery.data?.master_vehicle_class,
  ]);

  const error =
    statusQuery.error?.message ||
    vehicleActualsQuery.error?.message ||
    vehicleClassesQuery.error?.message ||
    configsQuery.error?.message ||
    null;

  return {
    title: "Jatanlin",
    description: "Operational summary for ODOL vehicles and violations.",
    metrics: dashboard.metrics,
    trendData: dashboard.trendData,
    distributionData: dashboard.distributionData,
    recentViolations: dashboard.recentViolations,
    heaviest: dashboard.heaviest,
    dimension: dashboard.dimension,
    topArticle: dashboard.topArticle,
    isLoading:
      vehicleActualsQuery.loading ||
      statusQuery.loading ||
      vehicleClassesQuery.loading ||
      configsQuery.loading,
    error,
  };
}
