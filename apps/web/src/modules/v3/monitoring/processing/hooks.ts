"use client";

import { gql, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useProcessing } from "@/src/contexts/ProcessingContext";
import { useSubscribeLatestAnprCaptureSubscription } from "@/src/graphql/hooks/transact-anpr-capture";
import { useSubscribeLatestAxleCaptureSubscription } from "@/src/graphql/hooks/transact-axle-capture";
import { useSubscribeLatestCctvSubscription } from "@/src/graphql/hooks/transact-cctv";
import { useSubscribeLatestWeighingSubscription } from "@/src/graphql/hooks/transact-vehicke-weight";
import { useSubscribeLatestDimensionSubscription } from "@/src/graphql/hooks/transact-vehicle-dimension";
import { useSubscribeLatestVehicleActualSubscription } from "@/src/graphql/hooks/transact-vehicle-actual";
import { getImageUrl, getMinioImageUrl } from "@/src/utils/image";
import { getAuthTokenCookie } from "@/src/utils/auth";
import {
  checkOdolViolation,
  getOdolTolerances,
  type VehicleActual,
  type VehicleClassLimit,
} from "@/src/utils/odol";
import type {
  V3DeviceConnection,
  V3DeviceStatus,
  V3ProcessingMetric,
  V3ProcessingPanelItem,
} from "./types";

const PROCESSING_QUERY = gql`
  query V3ProcessingLatest {
    system_runtime_config(
      where: {
        is_deleted: { _eq: false }
        config_key: {
          _in: [
            "ANPR_IP"
            "AXLE_IP"
            "CCTV_IP"
            "WIM_IP"
            "ANPR_FTP_HOST"
            "AXLE_FTP_HOST"
            "CCTV_TRIGGER_URL"
            "WEIGHING_TRIGGER_URL"
            "SITE_LATITUDE"
            "SITE_LONGITUDE"
          ]
        }
      }
    ) {
      config_key
      config_value
    }
    anpr: transact_anpr_capture(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      plate_no
      confidence
      location_code
      camera_id
      minio_bucket
      minio_full_image_object
      minio_plate_image_object
      created_date
    }
    axle: transact_axle_capture(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc_nulls_last }
      limit: 1
    ) {
      id
      plate_no
      total_axles
      total_wheels
      length_mm
      vehicle_category
      vehicle_body_type
      minio_bucket
      minio_image_object
      created_date
      captured_at
    }
    vehicle: transact_vehicle_actual(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      actual_plat_no
      actual_weight
      actual_total_axle
      actual_length
      actual_width
      actual_height
      location_address
      created_date
      transact_anpr_capture {
        id
        plate_no
        minio_bucket
        minio_full_image_object
        created_date
      }
      transact_axle_capture {
        id
        total_axles
        total_wheels
        length_mm
        vehicle_category
        vehicle_body_type
        minio_bucket
        minio_image_object
        created_date
        captured_at
      }
      transact_weighing {
        id
        total_weight
        total_axle
        axle_detail
        created_date
      }
      transact_dimension {
        id
        length
        width
        height
        created_date
      }
      transact_cctv {
        id
        filename
        filepath
        created_date
      }
      transact_vehicle_statuses(limit: 1, order_by: { created_date: desc }) {
        status
        result
        notes
        created_date
      }
    }
    classes: master_vehicle_class(
      where: { is_deleted: { _eq: false }, is_active: { _eq: true } }
      order_by: { total_axle: asc }
      limit: 100
    ) {
      id
      type
      total_axle
      class_2_weight
      class_3_weight
      length
      width
      height
    }
    configs: master_config(
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } }
      limit: 10
    ) {
      config_key
      config_value
    }
  }
`;

const PROCESSING_SESSION_QUERY = gql`
  query V3ProcessingSessionLatest($session_id: uuid!, $site_id: uuid) {
    anpr: transact_anpr_capture(
      where: {
        is_deleted: { _eq: false }
        session_id: { _eq: $session_id }
        site_id: { _eq: $site_id }
      }
      order_by: [{ updated_date: desc_nulls_last }, { created_date: desc }]
      limit: 1
    ) {
      id
      plate_no
      confidence
      captured_at
      minio_bucket
      minio_full_image_object
      site_id
      session_id
    }
    axle: transact_axle_capture(
      where: {
        is_deleted: { _eq: false }
        session_id: { _eq: $session_id }
        site_id: { _eq: $site_id }
      }
      order_by: [{ updated_date: desc_nulls_last }, { created_date: desc }]
      limit: 1
    ) {
      id
      total_axles
      total_wheels
      length_mm
      vehicle_category
      vehicle_body_type
      minio_bucket
      minio_image_object
      site_id
      session_id
    }
    weight: transact_weighing(
      where: {
        is_deleted: { _eq: false }
        session_id: { _eq: $session_id }
        site_id: { _eq: $site_id }
      }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      total_weight
      total_axle
      axle_detail
      created_date
      site_id
      session_id
    }
    dimension: transact_dimension(
      where: {
        is_deleted: { _eq: false }
        session_id: { _eq: $session_id }
        site_id: { _eq: $site_id }
      }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      length
      width
      height
      anpr_id
      filepath
      site_id
      session_id
    }
    cctv: transact_cctv(
      where: {
        is_deleted: { _eq: false }
        session_id: { _eq: $session_id }
        site_id: { _eq: $site_id }
      }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      filename
      filepath
      created_date
      site_id
      session_id
    }
  }
`;

type ProcessingQueryData = {
  system_runtime_config?: Array<{
    config_key?: string | null;
    config_value?: string | null;
  }>;
  anpr?: Array<Record<string, unknown>>;
  axle?: Array<Record<string, unknown>>;
  vehicle?: Array<Record<string, unknown>>;
  classes?: Array<Record<string, unknown>>;
  configs?: Array<{ config_key?: string | null; config_value?: string | null }>;
};

type ProbeProtocol = "http" | "tcp";

type ProbeTarget = {
  target: string;
  protocol: ProbeProtocol;
};

type DeviceProbe = {
  state: V3DeviceStatus;
  latencyMs?: number;
  checkedAt?: string;
  message: string;
};

const DEFAULT_DEVICE_CONFIG: Record<string, string> = {
  ANPR_IP: "10.0.43.30",
  AXLE_IP: "10.0.43.30",
  CCTV_IP: "10.0.43.20",
  WIM_IP: "10.0.43.10:65002",
};

const PROCESSING_WAIT_SECONDS = 130;

type ProcessingSessionQueryData = {
  anpr?: Array<Record<string, unknown>>;
  axle?: Array<Record<string, unknown>>;
  weight?: Array<Record<string, unknown>>;
  dimension?: Array<Record<string, unknown>>;
  cctv?: Array<Record<string, unknown>>;
};

function asString(value: unknown) {
  if (value === null || value === undefined || value === "") return "";
  return String(value);
}

function asNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatDateTime(value: unknown) {
  const text = asString(value);
  if (!text) return "-";
  return new Date(text).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatTime(value: unknown) {
  const text = asString(value);
  if (!text) return "-";
  return new Date(text).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function formatNumber(value: unknown, digits = 2) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return "-";
  return parsed.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function parseAxleDetail(detail: unknown): V3ProcessingPanelItem[] {
  if (!detail) return [];

  try {
    const parsed = typeof detail === "string" ? JSON.parse(detail) : detail;

    if (Array.isArray(parsed)) {
      return parsed.slice(0, 12).map((item, index) => {
        const row =
          item && typeof item === "object"
            ? (item as Record<string, unknown>)
            : {};
        const axleNo = row.axle ?? row.axle_number ?? row.no ?? index + 1;
        const weight =
          row.weight ?? row.axle_weight ?? row.value ?? row.total_weight;

        return {
          label: `Sumbu ${axleNo}`,
          value: Number.isFinite(Number(weight))
            ? `${formatNumber(Number(weight) / 1000, 2)} ton`
            : "-",
        };
      });
    }

    if (parsed && typeof parsed === "object") {
      return Object.entries(parsed as Record<string, unknown>)
        .slice(0, 12)
        .map(([key, value]) => ({
          label: `Sumbu ${key}`,
          value: Number.isFinite(Number(value))
            ? `${formatNumber(Number(value) / 1000, 2)} ton`
            : "-",
        }));
    }
  } catch {
    return [];
  }

  return [];
}

function configMap(rows: ProcessingQueryData["system_runtime_config"] = []) {
  return rows.reduce<Record<string, string>>(
    (acc, row) => {
      if (row.config_key) acc[row.config_key] = row.config_value ?? "";
      return acc;
    },
    { ...DEFAULT_DEVICE_CONFIG },
  );
}

function withDefaultPort(value?: string | null, defaultPort = "80") {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.includes("://")) {
    try {
      const url = new URL(trimmed);
      if (!url.port) url.port = defaultPort;
      return `${url.hostname}:${url.port}`;
    } catch {
      return trimmed;
    }
  }
  return trimmed.includes(":") ? trimmed : `${trimmed}:${defaultPort}`;
}

async function probeEndpoint(probe: ProbeTarget): Promise<DeviceProbe> {
  if (!probe.target) {
    return {
      state: "offline",
      checkedAt: new Date().toISOString(),
      message: "Endpoint belum dikonfigurasi",
    };
  }

  try {
    const params = new URLSearchParams({
      target: probe.target,
      protocol: probe.protocol,
      timeoutMs: "3000",
    });
    const response = await fetch(`/api/device-health?${params.toString()}`, {
      cache: "no-store",
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      latencyMs?: number;
      checkedAt?: string;
      message?: string;
    };

    return {
      state: payload.ok ? "online" : "offline",
      latencyMs: payload.latencyMs,
      checkedAt: payload.checkedAt || new Date().toISOString(),
      message:
        payload.message || (payload.ok ? "Probe merespons" : "Probe gagal"),
    };
  } catch (error) {
    return {
      state: "offline",
      checkedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Probe gagal",
    };
  }
}

function getNestedRecord(
  row: Record<string, unknown> | undefined,
  key: string,
) {
  const value = row?.[key];
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : undefined;
}

function getImageFromMinio(
  row?: Record<string, unknown> | null,
  imageKey = "minio_full_image_object",
) {
  return getMinioImageUrl(
    asString(row?.minio_bucket),
    asString(row?.[imageKey]),
  );
}

function getCctvUrl(cctv?: Record<string, unknown> | null) {
  return getImageUrl(asString(cctv?.filepath));
}

function metricStatus(
  actual: number,
  limit: number,
): V3ProcessingMetric["status"] {
  if (!actual || !limit) return "pending";
  return actual > limit ? "over" : "normal";
}

function formatSessionName(date: Date) {
  const pad = (value: number) => String(value).padStart(2, "0");
  return [
    date.getFullYear(),
    pad(date.getMonth() + 1),
    pad(date.getDate()),
    pad(date.getHours()),
    pad(date.getMinutes()),
    pad(date.getSeconds()),
  ].join("");
}

type ProcessingLocation = {
  latitude: number;
  longitude: number;
};

const DEFAULT_PROCESSING_LOCATION: ProcessingLocation = {
  latitude: -6.574698,
  longitude: 106.890234,
};

function configuredProcessingLocation(
  configs: Record<string, string>,
): ProcessingLocation {
  const latitude = Number(configs.SITE_LATITUDE);
  const longitude = Number(configs.SITE_LONGITUDE);
  if (
    Number.isFinite(latitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    Number.isFinite(longitude) &&
    longitude >= -180 &&
    longitude <= 180
  ) {
    return { latitude, longitude };
  }
  return DEFAULT_PROCESSING_LOCATION;
}

type OrchestratorSession = {
  id: string;
  status: string;
  started_at: string;
};

async function orchestratorRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const response = await fetch(`${apiUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${getAuthTokenCookie() || ""}`,
      ...init?.headers,
    },
  });
  const payload = await response.json().catch(() => null);
  if (!response.ok || !payload?.success) {
    throw new Error(payload?.message || "Transaction orchestrator request failed");
  }
  return payload.data as T;
}

function browserSupportsLocation() {
  return typeof navigator !== "undefined" && "geolocation" in navigator;
}

function isLocationAllowedOrigin() {
  if (typeof window === "undefined") return true;
  return (
    window.isSecureContext ||
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  );
}

function requestProcessingLocation(): Promise<ProcessingLocation> {
  if (!browserSupportsLocation()) {
    return Promise.reject(
      new Error("Akses lokasi tidak tersedia di browser ini."),
    );
  }
  if (!isLocationAllowedOrigin()) {
    return Promise.reject(
      new Error(
        "Akses lokasi memerlukan HTTPS, atau buka aplikasi dari http://localhost:3000.",
      ),
    );
  }

  return new Promise((resolve, reject) => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          reject(
            new Error(
              "Izin lokasi wajib diberikan sebelum memulai pemrosesan.",
            ),
          );
          return;
        }
        if (error.code === error.TIMEOUT) {
          reject(new Error("Deteksi lokasi timeout. Silakan coba lagi."));
          return;
        }
        reject(new Error("Failed to detect current location."));
      },
      {
        enableHighAccuracy: true,
        timeout: 15_000,
        maximumAge: 0,
      },
    );
  });
}

export function useV3Processing() {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID || undefined;
  const processingContext = useProcessing();
  const {
    anprData,
    weightData,
    axleData,
    dimensionData,
    cctvData,
    sessionId,
    sessionStartTime,
    vehicleActualId,
    setAnprData,
    setWeightData,
    setAxleData,
    setDimensionData,
    setCctvData,
    setSessionStartTime,
    setSessionId,
    setSessionStatus,
    setIsProcessing,
    setVehicleActualId,
    setPhase,
    resetProcessing,
  } = processingContext;
  const [isStartingSession, setIsStartingSession] = useState(false);
  const [isFinalizingSession, setIsFinalizingSession] = useState(false);
  const finalizingSessionRef = useRef(false);
  const [lastManualCheck, setLastManualCheck] = useState<Date | null>(null);
  const [isStarted, setIsStarted] = useState(false);
  const [isFinalized, setIsFinalized] = useState(false);
  const [timeoutRemaining, setTimeoutRemaining] = useState(
    PROCESSING_WAIT_SECONDS,
  );
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const [processingLocation, setProcessingLocation] =
    useState<ProcessingLocation | null>(null);
  const [probes, setProbes] = useState<
    Record<V3DeviceConnection["key"], DeviceProbe>
  >({
    anpr: { state: "offline", message: "Belum dicek" },
    axle: { state: "offline", message: "Belum dicek" },
    cctv: { state: "offline", message: "Belum dicek" },
    wim: { state: "offline", message: "Belum dicek" },
  });
  const { data, loading, error, refetch } = useQuery<ProcessingQueryData>(
    PROCESSING_QUERY,
    {
      pollInterval: 10_000,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  );
  const configs = useMemo(
    () => configMap(data?.system_runtime_config),
    [data?.system_runtime_config],
  );

  useEffect(() => {
    let cancelled = false;
    void orchestratorRequest<OrchestratorSession | null>(
      "/api/transactions/sessions/recover",
    )
      .then((activeSession) => {
        if (cancelled || !activeSession) return;
        setSessionId(activeSession.id);
        setSessionStartTime(activeSession.started_at);
        setSessionStatus("IN_PROGRESS");
        setIsProcessing(true);
        setIsStarted(true);
        setIsFinalized(false);
        setPhase("processing");
      })
      .catch(() => {
        // Login/session errors remain handled by the existing authenticated shell.
      });
    return () => {
      cancelled = true;
    };
  }, [
    setIsProcessing,
    setPhase,
    setSessionId,
    setSessionStartTime,
    setSessionStatus,
  ]);
  const probeByDevice = useMemo<Record<V3DeviceConnection["key"], ProbeTarget>>(
    () => ({
      anpr: {
        target: withDefaultPort(configs.ANPR_IP || configs.ANPR_FTP_HOST, "80"),
        protocol: "tcp",
      },
      axle: {
        target: withDefaultPort(configs.AXLE_IP || configs.AXLE_FTP_HOST, "80"),
        protocol: "tcp",
      },
      cctv: {
        target: withDefaultPort(
          configs.CCTV_IP || configs.CCTV_TRIGGER_URL,
          "80",
        ),
        protocol: "tcp",
      },
      wim: {
        target: withDefaultPort(
          configs.WIM_IP || configs.WEIGHING_TRIGGER_URL,
          "65002",
        ),
        protocol: "tcp",
      },
    }),
    [configs],
  );
  const runProbes = useCallback(async () => {
    const entries = await Promise.all(
      (Object.keys(probeByDevice) as V3DeviceConnection["key"][]).map(
        async (key) => [key, await probeEndpoint(probeByDevice[key])] as const,
      ),
    );

    setProbes(
      Object.fromEntries(entries) as Record<
        V3DeviceConnection["key"],
        DeviceProbe
      >,
    );
  }, [probeByDevice]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void runProbes();
    }, 0);
    const timer = window.setInterval(() => {
      void runProbes();
    }, 10_000);

    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [runProbes]);
  const isContextStarted =
    processingContext.isProcessing ||
    processingContext.sessionStatus === "IN_PROGRESS";
  const isProcessingStarted = isStarted || isContextStarted;
  const isProcessingFinalized =
    !isProcessingStarted &&
    (isFinalized ||
      !!vehicleActualId ||
      processingContext.sessionStatus === "COMPLETED");
  const shouldListenSession = isProcessingStarted && !!sessionId;
  const { data: sessionPollData } = useQuery<ProcessingSessionQueryData>(
    PROCESSING_SESSION_QUERY,
    {
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !shouldListenSession,
      pollInterval: 2_000,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  );

  const { data: anprSubscriptionData } =
    useSubscribeLatestAnprCaptureSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !shouldListenSession,
    });
  const { data: weightSubscriptionData } =
    useSubscribeLatestWeighingSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !shouldListenSession,
    });
  const { data: axleSubscriptionData } =
    useSubscribeLatestAxleCaptureSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !shouldListenSession,
    });
  const { data: dimensionSubscriptionData } =
    useSubscribeLatestDimensionSubscription({
      variables: {
        session_id: sessionId as string,
        site_id: siteId,
      },
      skip: !shouldListenSession,
    });
  const { data: cctvSubscriptionData } = useSubscribeLatestCctvSubscription({
    variables: {
      session_id: sessionId as string,
      site_id: siteId,
    },
    skip: !shouldListenSession,
  });
  const { data: latestVehicleActualSubscriptionData } =
    useSubscribeLatestVehicleActualSubscription({
      variables: {
        site_id: siteId,
      },
      skip: !siteId,
    });
  const latestVehicleActualIdRef = useRef<string | null>(null);

  useEffect(() => {
    const latestVehicleActual =
      latestVehicleActualSubscriptionData?.transact_vehicle_actual?.[0];
    const latestVehicleActualId = latestVehicleActual?.id
      ? String(latestVehicleActual.id)
      : "";

    if (!latestVehicleActualId) return;
    if (latestVehicleActualIdRef.current === latestVehicleActualId) return;

    latestVehicleActualIdRef.current = latestVehicleActualId;
    void refetch();
  }, [latestVehicleActualSubscriptionData, refetch]);

  useEffect(() => {
    const anprData = anprSubscriptionData?.transact_anpr_capture?.[0];
    if (!anprData) return;
    if (
      (processingContext.anprData as Record<string, unknown> | null)?.id ===
      anprData.id
    )
      return;
    setAnprData({
      id: anprData.id,
      plate_no: anprData.plate_no ?? null,
      confidence: anprData.confidence ?? null,
      captured_at: anprData.captured_at ?? null,
      minio_bucket: anprData.minio_bucket ?? null,
      minio_full_image_object: anprData.minio_full_image_object ?? null,
      site_id: anprData.site_id ?? null,
      session_id: sessionId,
    });
  }, [
    anprSubscriptionData,
    processingContext.anprData,
    sessionId,
    setAnprData,
  ]);

  useEffect(() => {
    if (!shouldListenSession) return;

    const sessionAnpr = sessionPollData?.anpr?.[0];
    if (
      sessionAnpr &&
      asString(
        (processingContext.anprData as Record<string, unknown> | null)?.id,
      ) !== asString(sessionAnpr.id)
    ) {
      setAnprData(sessionAnpr);
    }

    const sessionWeight = sessionPollData?.weight?.[0];
    if (
      sessionWeight &&
      asString(
        (processingContext.weightData as Record<string, unknown> | null)?.id,
      ) !== asString(sessionWeight.id)
    ) {
      setWeightData(sessionWeight);
    }

    const sessionAxle = sessionPollData?.axle?.[0];
    if (
      sessionAxle &&
      asString(
        (processingContext.axleData as Record<string, unknown> | null)?.id,
      ) !== asString(sessionAxle.id)
    ) {
      setAxleData({
        ...sessionAxle,
        length: asNumber(sessionAxle.length_mm) / 1000,
      });
    }

    const sessionDimension = sessionPollData?.dimension?.[0];
    if (
      sessionDimension &&
      asString(
        (processingContext.dimensionData as Record<string, unknown> | null)?.id,
      ) !== asString(sessionDimension.id)
    ) {
      setDimensionData(sessionDimension);
    }

    const sessionCctv = sessionPollData?.cctv?.[0];
    if (
      sessionCctv &&
      asString(
        (processingContext.cctvData as Record<string, unknown> | null)?.id,
      ) !== asString(sessionCctv.id)
    ) {
      setCctvData(sessionCctv);
    }
  }, [
    processingContext.anprData,
    processingContext.axleData,
    processingContext.cctvData,
    processingContext.dimensionData,
    processingContext.weightData,
    sessionPollData,
    setAnprData,
    setAxleData,
    setCctvData,
    setDimensionData,
    setWeightData,
    shouldListenSession,
  ]);

  useEffect(() => {
    const weightData = weightSubscriptionData?.transact_weighing?.[0];
    if (!weightData) return;
    if (
      (processingContext.weightData as Record<string, unknown> | null)?.id ===
      weightData.id
    )
      return;
    setWeightData({
      id: weightData.id,
      total_weight: weightData.total_weight ?? null,
      total_axle: weightData.total_axle ?? null,
      axle_detail: weightData.axle_detail ?? null,
      created_date: weightData.created_date ?? null,
      session_id: sessionId,
    });
  }, [
    processingContext.weightData,
    sessionId,
    setWeightData,
    weightSubscriptionData,
  ]);

  useEffect(() => {
    const axleData = axleSubscriptionData?.transact_axle_capture?.[0];
    if (!axleData) return;
    if (
      (processingContext.axleData as Record<string, unknown> | null)?.id ===
      axleData.id
    )
      return;
    setAxleData({
      id: axleData.id,
      total_axles: axleData.total_axles ?? null,
      total_wheels: axleData.total_wheels ?? null,
      length_mm: axleData.length_mm ?? null,
      length: axleData.length_mm != null ? axleData.length_mm / 1000 : null,
      vehicle_category: axleData.vehicle_category ?? null,
      vehicle_body_type: axleData.vehicle_body_type ?? null,
      minio_bucket: axleData.minio_bucket ?? null,
      minio_image_object: axleData.minio_image_object ?? null,
      session_id: sessionId,
    });
  }, [
    axleSubscriptionData,
    processingContext.axleData,
    sessionId,
    setAxleData,
  ]);

  useEffect(() => {
    const dimensionData = dimensionSubscriptionData?.transact_dimension?.[0];
    if (!dimensionData) return;
    if (
      (processingContext.dimensionData as Record<string, unknown> | null)
        ?.id === dimensionData.id
    )
      return;
    setDimensionData({
      id: dimensionData.id,
      length: dimensionData.length ?? null,
      width: dimensionData.width ?? null,
      height: dimensionData.height ?? null,
      anpr_id: dimensionData.anpr_id ?? null,
      filepath: dimensionData.filepath ?? null,
      session_id: sessionId,
    });
  }, [
    dimensionSubscriptionData,
    processingContext.dimensionData,
    sessionId,
    setDimensionData,
  ]);

  useEffect(() => {
    const cctvData = cctvSubscriptionData?.transact_cctv?.[0];
    if (!cctvData) return;
    if (
      (processingContext.cctvData as Record<string, unknown> | null)?.id ===
      cctvData.id
    )
      return;
    setCctvData({
      id: cctvData.id,
      filename: cctvData.filename ?? null,
      filepath: cctvData.filepath ?? null,
      created_date: cctvData.created_date ?? null,
      site_id: cctvData.site_id ?? null,
      session_id: sessionId,
    });
  }, [
    cctvSubscriptionData,
    processingContext.cctvData,
    sessionId,
    setCctvData,
  ]);

  const anpr = data?.anpr?.[0];
  const axle = data?.axle?.[0];
  const vehicle = data?.vehicle?.[0];
  const vehicleAnpr = getNestedRecord(vehicle, "transact_anpr_capture");
  const vehicleAxle = getNestedRecord(vehicle, "transact_axle_capture");
  const weighing = getNestedRecord(vehicle, "transact_weighing");
  const cctv = getNestedRecord(vehicle, "transact_cctv");
  const latestStatus = Array.isArray(vehicle?.transact_vehicle_statuses)
    ? (vehicle?.transact_vehicle_statuses[0] as
        | Record<string, unknown>
        | undefined)
    : undefined;
  const liveAnpr = anprData as Record<string, unknown> | null;
  const liveWeight = weightData as Record<string, unknown> | null;
  const liveAxle = axleData as Record<string, unknown> | null;
  const liveDimension = dimensionData as Record<string, unknown> | null;
  const liveCctv = cctvData as Record<string, unknown> | null;

  const hasSessionData = !!(
    liveAnpr ||
    liveWeight ||
    liveAxle ||
    liveDimension ||
    liveCctv
  );

  const axleCount =
    asNumber(liveWeight?.total_axle) || asNumber(liveAxle?.total_axles);

  const vehicleClass = (data?.classes ?? []).find(
    (item: Record<string, unknown>) => asNumber(item.total_axle) === axleCount,
  );

  const actualWeightKg = asNumber(liveWeight?.total_weight);
  const actualWeightTon = actualWeightKg / 1000;
  const actualLength =
    asNumber(liveDimension?.length) || asNumber(liveAxle?.length);
  const actualWidth = asNumber(liveDimension?.width);
  const actualHeight = asNumber(liveDimension?.height);
  const legalWeightTon = asNumber(vehicleClass?.class_3_weight) / 1000;
  const legalLength = asNumber(vehicleClass?.length);
  const legalWidth = asNumber(vehicleClass?.width);
  const legalHeight = asNumber(vehicleClass?.height);

  const violation = (() => {
    if (vehicleActualId && asString(latestStatus?.result)) {
      return asString(latestStatus?.result);
    }
    if (
      !actualWeightTon ||
      !actualLength ||
      !actualWidth ||
      !actualHeight ||
      !vehicleClass
    ) {
      return "Pending";
    }

    const tolerances = getOdolTolerances(data?.configs);
    const actual: VehicleActual = {
      total_weight: actualWeightTon,
      length: actualLength,
      width: actualWidth,
      height: actualHeight,
    };
    const limit: VehicleClassLimit = {
      ...vehicleClass,
      class_3_weight: legalWeightTon,
    };

    return checkOdolViolation(actual, limit, {
      axleCount,
      toleranceWeightPercent: tolerances.weightPercent,
      toleranceDimPercent: tolerances.dimPercent,
    });
  })();

  const rawDevices: V3DeviceConnection[] = [
    {
      key: "anpr",
      label: "ANPR",
      description: "Pembaca plat nomor",
      status: probes.anpr.state,
      lastSeen: formatTime(anpr?.created_date || vehicleAnpr?.created_date),
    },
    {
      key: "axle",
      label: "Sumbu",
      description: "Sensor sumbu dan dimensi",
      status: probes.axle.state,
      lastSeen: formatTime(
        axle?.created_date ||
          axle?.captured_at ||
          vehicleAxle?.created_date ||
          vehicleAxle?.captured_at,
      ),
    },
    {
      key: "cctv",
      label: "CCTV",
      description: "Perekam bukti",
      status: probes.cctv.state,
      lastSeen: formatTime(cctv?.created_date),
    },
    {
      key: "wim",
      label: "WIM",
      description: "Penimbangan bergerak",
      status: probes.wim.state,
      lastSeen: formatTime(weighing?.created_date || vehicle?.created_date),
    },
  ];
  const devices: V3DeviceConnection[] = isDemoMode
    ? rawDevices.map((device) => ({
        ...device,
        status: "online",
        lastSeen: device.lastSeen === "-" ? "Demo online" : device.lastSeen,
      }))
    : rawDevices;

  const metrics: V3ProcessingMetric[] = [
    {
      label: "Berat",
      actual: actualWeightTon ? `${formatNumber(actualWeightTon, 2)} ton` : "-",
      limit: legalWeightTon ? `${formatNumber(legalWeightTon, 2)} ton` : "-",
      status: metricStatus(actualWeightTon, legalWeightTon),
    },
    {
      label: "Panjang",
      actual: actualLength ? `${formatNumber(actualLength, 2)} m` : "-",
      limit: legalLength ? `${formatNumber(legalLength, 2)} m` : "-",
      status: metricStatus(actualLength, legalLength),
    },
    {
      label: "Lebar",
      actual: actualWidth ? `${formatNumber(actualWidth, 2)} m` : "-",
      limit: legalWidth ? `${formatNumber(legalWidth, 2)} m` : "-",
      status: metricStatus(actualWidth, legalWidth),
    },
    {
      label: "Tinggi",
      actual: actualHeight ? `${formatNumber(actualHeight, 2)} m` : "-",
      limit: legalHeight ? `${formatNumber(legalHeight, 2)} m` : "-",
      status: metricStatus(actualHeight, legalHeight),
    },
  ];

  const anprItems: V3ProcessingPanelItem[] = [
    { label: "No. Plat", value: asString(liveAnpr?.plate_no) || "-" },
    {
      label: "Panjang",
      value: actualLength ? `${formatNumber(actualLength, 2)} m` : "-",
    },
    {
      label: "Lebar",
      value: actualWidth ? `${formatNumber(actualWidth, 2)} m` : "-",
    },
    {
      label: "Tinggi",
      value: actualHeight ? `${formatNumber(actualHeight, 2)} m` : "-",
    },
  ];

  const axleItems: V3ProcessingPanelItem[] = [
    { label: "Total Sumbu", value: axleCount ? `${axleCount}` : "-" },
    { label: "Total Roda", value: asString(liveAxle?.total_wheels) || "-" },
    {
      label: "Tipe Kendaraan",
      value: asString(liveAxle?.vehicle_category || vehicleClass?.type) || "-",
    },
    { label: "Tipe Bodi", value: asString(liveAxle?.vehicle_body_type) || "-" },
    {
      label: "Panjang Terdeteksi",
      value: actualLength ? `${formatNumber(actualLength, 2)} m` : "-",
    },
  ];

  const wimItems: V3ProcessingPanelItem[] = [
    {
      label: "Berat Aktual",
      value: actualWeightTon ? `${formatNumber(actualWeightTon, 2)} ton` : "-",
    },
    {
      label: "Berat Legal",
      value: legalWeightTon ? `${formatNumber(legalWeightTon, 2)} ton` : "-",
    },
    { label: "Kelas Kendaraan", value: asString(vehicleClass?.type) || "-" },
    { label: "Jumlah Sumbu", value: axleCount ? `${axleCount}` : "-" },
    { label: "Waktu Timbang", value: formatDateTime(liveWeight?.created_date) },
  ];
  const wimAxleItems = parseAxleDetail(liveWeight?.axle_detail);
  const wimLiveItems: V3ProcessingPanelItem[] = [
    {
      label: "Total Berat",
      value: actualWeightTon ? `${formatNumber(actualWeightTon, 2)} ton` : "-",
    },
    { label: "Jumlah Sumbu", value: axleCount ? `${axleCount}` : "-" },
    ...(wimAxleItems.length > 0
      ? wimAxleItems
      : [{ label: "Berat per Sumbu", value: "-" }]),
  ];

  const cctvItems: V3ProcessingPanelItem[] = [
    { label: "Nama File", value: asString(liveCctv?.filename) || "-" },
    { label: "No. Plat", value: asString(liveAnpr?.plate_no) || "-" },
    { label: "Waktu Rekam", value: formatDateTime(liveCctv?.created_date) },
    { label: "Status", value: liveCctv ? "Bukti tersedia" : "Menunggu bukti" },
  ];

  const checkConnection = async () => {
    setLastManualCheck(new Date());
    await Promise.all([refetch(), runProbes()]);
  };
  const allConnectionsOnline = devices.every(
    (device) => device.status === "online",
  );
  const startProcessing = async () => {
    if (isProcessingStarted || isRequestingLocation || isStartingSession) return;

    const now = new Date();
    setActionError(null);
    setIsRequestingLocation(true);
    setIsStartingSession(true);

    try {
      let location = configuredProcessingLocation(configs);
      try {
        location = await requestProcessingLocation();
      } catch {
        location = configuredProcessingLocation(configs);
      }
      setProcessingLocation(location);

      const mode = isDemoMode ? "DUMMY" : "REAL";
      const activeSession = await orchestratorRequest<OrchestratorSession>(
        "/api/transactions/sessions/start",
        {
          method: "POST",
          body: JSON.stringify({
            session_name: formatSessionName(now),
            source_modes: {
              ANPR: mode,
              AXLE: mode,
              WIM: mode,
              CCTV: mode,
              DIMENSION: mode,
            },
          }),
        },
      );

      setIsStarted(true);
      setIsFinalized(false);
      setTimeoutRemaining(PROCESSING_WAIT_SECONDS);
      setSessionId(activeSession.id);
      setVehicleActualId(null);
      setSessionStatus("IN_PROGRESS");
      setIsProcessing(true);
      setPhase("processing");
      setAnprData(null);
      setWeightData(null);
      setAxleData(null);
      setDimensionData(null);
      setCctvData(null);
      setSessionStartTime(activeSession.started_at);
    } catch (err) {
      setActionError(
        err instanceof Error
          ? err.message
          : "Failed to start processing session",
      );
      setIsStarted(false);
      setIsProcessing(false);
      setSessionStatus("IDLE");
      setPhase("init");
    } finally {
      setIsRequestingLocation(false);
      setIsStartingSession(false);
    }
  };
  const finalizeProcessing = useCallback(async () => {
    if (!sessionId || isFinalized || vehicleActualId || finalizingSessionRef.current)
      return;
    finalizingSessionRef.current = true;
    setIsFinalizingSession(true);
    try {
      const result = await orchestratorRequest<{ vehicle_actual_id: string }>(
        `/api/transactions/sessions/${sessionId}/finalize`,
        {
          method: "POST",
          body: JSON.stringify({
            latitude: processingLocation?.latitude,
            longitude: processingLocation?.longitude,
          }),
        },
      );
      setVehicleActualId(result.vehicle_actual_id);
      setSessionStatus("COMPLETED");
      setIsProcessing(false);
      setIsFinalized(true);
    } catch (err) {
      setActionError(
        err instanceof Error ? err.message : "Failed to finalize processing session",
      );
    } finally {
      finalizingSessionRef.current = false;
      setIsFinalizingSession(false);
    }
  }, [
    isFinalized,
    processingLocation,
    sessionId,
    setIsProcessing,
    setSessionStatus,
    setVehicleActualId,
    vehicleActualId,
  ]);

  useEffect(() => {
    if (!isProcessingStarted || !sessionId || isFinalized || vehicleActualId)
      return;

    const startedAtMs = sessionStartTime
      ? new Date(sessionStartTime).getTime()
      : Date.now();

    const updateRemaining = () => {
      const elapsedSeconds = Number.isFinite(startedAtMs)
        ? Math.floor((Date.now() - startedAtMs) / 1000)
        : 0;
      const remaining = Math.max(0, PROCESSING_WAIT_SECONDS - elapsedSeconds);
      setTimeoutRemaining(remaining);

      if (remaining === 0) {
        void finalizeProcessing();
      }

      return remaining;
    };

    updateRemaining();
    const timer = window.setInterval(() => {
      if (updateRemaining() === 0) {
        window.clearInterval(timer);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [
    finalizeProcessing,
    isFinalized,
    isProcessingStarted,
    sessionId,
    sessionStartTime,
    vehicleActualId,
  ]);

  const isSessionDataComplete = !!(
    liveAnpr &&
    liveWeight &&
    liveAxle &&
    liveDimension &&
    liveCctv
  );

  useEffect(() => {
    if (!isStarted || !sessionId || isFinalized || vehicleActualId) return;
    if (!isSessionDataComplete) return;

    const timer = window.setTimeout(() => {
      void finalizeProcessing();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [
    finalizeProcessing,
    isFinalized,
    isSessionDataComplete,
    isStarted,
    sessionId,
    vehicleActualId,
  ]);

  const resetCurrentProcessing = () => {
    resetProcessing();
    setIsStarted(false);
    setIsFinalized(false);
    setTimeoutRemaining(PROCESSING_WAIT_SECONDS);
    setLastManualCheck(null);
    setProcessingLocation(null);
  };

  return {
    isLoading: loading,
    isStarting: isStartingSession || isRequestingLocation,
    isRequestingLocation,
    isFinalizing: isFinalizingSession,
    error: actionError || error?.message || null,
    devices,
    allConnectionsOnline,
    onlineCount: devices.filter((device) => device.status === "online").length,
    lastManualCheck,
    lastUpdated: formatDateTime(vehicle?.created_date || anpr?.created_date),
    hasSessionData,
    isStarted: isProcessingStarted,
    isFinalized: isProcessingFinalized,
    timeoutRemaining,
    processingLocation,
    isAnprWaiting: isProcessingStarted && !isProcessingFinalized && !liveAnpr,
    isAxleWaiting: isProcessingStarted && !isProcessingFinalized && !liveAxle,
    isWimWaiting: isProcessingStarted && !isProcessingFinalized && !liveWeight,
    isCctvWaiting: isProcessingStarted && !isProcessingFinalized && !liveCctv,
    isDemoMode,
    startProcessing,
    resetCurrentProcessing,
    toggleDemoMode: () => setIsDemoMode((current) => !current),
    checkConnection,
    anprImage: getImageFromMinio(liveAnpr),
    axleImage: getImageFromMinio(liveAxle, "minio_image_object"),
    cctvUrl: getCctvUrl(liveCctv),
    anprItems,
    axleItems,
    wimItems,
    wimLiveItems,
    wimAxleItems,
    cctvItems,
    metrics,
    violation,
    vehicleId: vehicleActualId || "",
    plateNo: asString(liveAnpr?.plate_no) || "-",
    status:
      isProcessingStarted && !isProcessingFinalized
        ? "processing"
        : isProcessingFinalized
          ? asString(latestStatus?.status) || "completed"
          : "idle",
  };
}
