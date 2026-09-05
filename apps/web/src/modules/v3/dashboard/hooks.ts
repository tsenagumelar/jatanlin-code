import { useEffect, useMemo, useState } from "react";
import { getAuthTokenCookie } from "@/src/utils/auth";
import type { V3DashboardData } from "./types";

type DashboardResponse = {
  success: boolean;
  message?: string;
  data?: {
    timezone: string;
    metrics: {
      odol: number;
      violations: number;
      normal: number;
      today_violations: number;
      pending: number;
    };
    trend: Array<{
      date: string;
      over_dimension: number;
      over_loading: number;
      normal: number;
    }>;
    distribution: {
      over_dimension: number;
      over_loading: number;
      normal: number;
    };
    recent_violations: Array<{
      id: string;
      time: string;
      plate: string;
      location: string;
      result: string;
      officer: string;
      status: string;
    }>;
  };
};

function getViolationArticle(value: string) {
  const hasDimension = value.includes("Dimension");
  const hasLoading = value.includes("Loading");
  if (hasDimension && hasLoading) return "Pasal 277 & 278";
  if (hasDimension) return "Pasal 277";
  if (hasLoading) return "Pasal 278";
  return "-";
}

function formatDay(value: string) {
  return new Date(`${value}T00:00:00Z`).toLocaleDateString("id-ID", {
    timeZone: "UTC",
    day: "2-digit",
    month: "short",
  });
}

function formatDateTime(value: string, timeZone: string) {
  return new Date(value).toLocaleString("id-ID", {
    timeZone,
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

const emptyDashboard: V3DashboardData = {
  title: "Jatanlin",
  description: "Ringkasan operasional kendaraan ODOL dan pelanggaran.",
  metrics: [
    { label: "Kendaraan ODOL", value: 0, tone: "danger", icon: "odol" },
    { label: "Total Pelanggaran", value: 0, tone: "warning", icon: "violation" },
    { label: "Kendaraan Normal", value: 0, tone: "success", icon: "normal" },
    { label: "Pelanggaran Hari Ini", value: 0, tone: "info", icon: "today" },
  ],
  trendData: [],
  distributionData: [
    { name: "Over Dimension", value: 0, color: "#dc2626" },
    { name: "Over Loading", value: 0, color: "#f59e0b" },
    { name: "Normal", value: 0, color: "#059669" },
  ],
  recentViolations: [],
  heaviest: { plate: "-", value: "-", helper: "Kendaraan pelanggar terberat" },
  dimension: { plate: "-", value: "-", helper: "Dimensi kendaraan pelanggar: P x L x T" },
  topArticle: { plate: "-", value: "-", helper: "Pelanggaran paling sering berdasarkan pasal" },
  isLoading: true,
  error: null,
};

export function useV3Dashboard(): V3DashboardData {
  const [payload, setPayload] = useState<DashboardResponse["data"]>();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/api/dashboard/summary`,
          { headers: { Authorization: `Bearer ${getAuthTokenCookie() || ""}` } },
        );
        const body = (await response.json()) as DashboardResponse;
        if (!response.ok || !body.success || !body.data) {
          throw new Error(body.message || "Data dashboard tidak dapat dimuat.");
        }
        if (active) {
          setPayload(body.data);
          setError(null);
        }
      } catch (loadError) {
        if (active) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Data dashboard tidak dapat dimuat.",
          );
        }
      } finally {
        if (active) setIsLoading(false);
      }
    };

    void load();
    const interval = window.setInterval(load, 60_000);
    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return useMemo(() => {
    if (!payload) return { ...emptyDashboard, isLoading, error };

    return {
      ...emptyDashboard,
      metrics: [
        { label: "Kendaraan ODOL", value: payload.metrics.odol, tone: "danger", icon: "odol" },
        { label: "Total Pelanggaran", value: payload.metrics.violations, tone: "warning", icon: "violation" },
        { label: "Kendaraan Normal", value: payload.metrics.normal, tone: "success", icon: "normal" },
        { label: "Pelanggaran Hari Ini", value: payload.metrics.today_violations, tone: "info", icon: "today" },
      ],
      trendData: payload.trend.map((item) => ({
        date: formatDay(item.date),
        overDimension: item.over_dimension,
        overLoading: item.over_loading,
        normal: item.normal,
      })),
      distributionData: [
        { name: "Over Dimension", value: payload.distribution.over_dimension, color: "#dc2626" },
        { name: "Over Loading", value: payload.distribution.over_loading, color: "#f59e0b" },
        { name: "Normal", value: payload.distribution.normal, color: "#059669" },
      ],
      recentViolations: payload.recent_violations.map((row, index) => ({
        id: row.id,
        no: index + 1,
        time: formatDateTime(row.time, payload.timezone),
        plate: row.plate,
        location: row.location,
        type: row.result,
        article: getViolationArticle(row.result),
        officer: row.officer,
        status: row.status,
      })),
      isLoading,
      error,
    };
  }, [error, isLoading, payload]);
}
