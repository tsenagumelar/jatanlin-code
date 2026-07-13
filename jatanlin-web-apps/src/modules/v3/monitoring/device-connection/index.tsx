"use client";

import { gql, useQuery } from "@apollo/client";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowClockwise24Regular,
  Camera24Regular,
  CheckmarkCircle24Filled,
  Circle12Filled,
  PlugDisconnected24Regular,
  Scales24Regular,
  VehicleTruckProfile24Regular,
  Video24Regular,
  Warning24Filled,
} from "@fluentui/react-icons";

type DeviceKey = "anpr" | "axle" | "cctv" | "wim";
type ProbeState = "checking" | "online" | "warning" | "offline";

interface RuntimeConfigRow {
  config_group: string;
  config_key: string;
  config_value: string | null;
}

interface LatestRow {
  created_date?: string | null;
  captured_at?: string | null;
  minio_bucket?: string | null;
  minio_full_image_object?: string | null;
  minio_image_object?: string | null;
  filepath?: string | null;
  filename?: string | null;
  plate_no?: string | null;
  camera_id?: string | null;
  total_axles?: number | null;
  total_weight?: number | null;
  total_axle?: number | null;
}

interface DeviceConnectionData {
  system_runtime_config: RuntimeConfigRow[];
  anpr: LatestRow[];
  axle: LatestRow[];
  cctv: LatestRow[];
  weighing: LatestRow[];
}

interface DeviceProbe {
  state: ProbeState;
  latencyMs?: number;
  checkedAt?: string;
  message: string;
}

type ProbeProtocol = "http" | "tcp";

interface ProbeTarget {
  target: string;
  protocol: ProbeProtocol;
}

interface LiveFeed {
  key: Exclude<DeviceKey, "wim">;
  title: string;
  subtitle: string;
  streamUrl: string;
  meta: string;
  device: DeviceViewModel;
}

interface WimLiveState {
  connected: boolean;
  connectionState: string;
  type?: string;
  mode?: number | null;
  directionLabel?: string | null;
  axle?: number | null;
  axleCount?: number | null;
  lastWeight?: number | null;
  totalWeight?: number | null;
  bridge1Weight?: number | null;
  bridge2Weight?: number | null;
  bridgeTotalWeight?: number | null;
  bridge1State?: number | null;
  bridge2State?: number | null;
  channel1Value?: number | null;
  channel2Value?: number | null;
  timeout?: number | null;
  load?: number | null;
  overload?: number | null;
  speed?: number | null;
  recordId?: number | null;
  updatedAt?: string | null;
  raw?: string | null;
  error?: string | null;
}

interface DeviceViewModel {
  key: DeviceKey;
  label: string;
  role: string;
  endpoint: string;
  source: string;
  latestAt?: string | null;
  latestLabel: string;
  status: ProbeState;
  latencyMs?: number;
  checkedAt?: string;
  message: string;
}

const DEFAULT_DEVICE_CONFIG: Record<string, string> = {
  ANPR_IP: "10.0.43.30",
  AXLE_IP: "10.0.43.30",
  CCTV_IP: "10.0.43.20",
  WIM_IP: "10.0.43.10:65002",
  ANPR_STREAM_URL: "http://10.0.43.30:9901/video.mjpeg",
  AXLE_STREAM_URL: "http://10.0.43.40:9901/video.mjpeg",
  CCTV_STREAM_URL: "rtsp://10.0.43.20:554/profile1",
  WIM_STREAM_URL: "/api/v3/wim-live",
};

const DEVICE_CONNECTION_QUERY = gql`
  query V3DeviceConnectionStatus {
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
            "CCTV_HTTP_PORT"
            "CCTV_RTSP_URL"
            "ANPR_STREAM_URL"
            "AXLE_STREAM_URL"
            "CCTV_STREAM_URL"
            "WIM_STREAM_URL"
            "WEIGHING_TRIGGER_URL"
          ]
        }
      }
    ) {
      config_group
      config_key
      config_value
    }
    anpr: transact_anpr_capture(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      created_date
      plate_no
      camera_id
      minio_bucket
      minio_full_image_object
    }
    axle: transact_axle_capture(
      where: { is_deleted: { _eq: false } }
      order_by: [{ created_date: desc_nulls_last }, { captured_at: desc_nulls_last }]
      limit: 1
    ) {
      created_date
      captured_at
      plate_no
      total_axles
      minio_bucket
      minio_image_object
    }
    cctv: transact_cctv(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      created_date
      filename
      filepath
    }
    weighing: transact_weighing(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      created_date
      total_weight
      total_axle
    }
  }
`;

const deviceIcons: Record<DeviceKey, React.ReactNode> = {
  anpr: <Camera24Regular />,
  axle: <VehicleTruckProfile24Regular />,
  cctv: <Video24Regular />,
  wim: <Scales24Regular />,
};

const statusConfig: Record<
  ProbeState,
  { label: string; badge: string; panel: string; dot: string; icon: React.ReactNode }
> = {
  checking: {
    label: "Checking",
    badge: "bg-blue-100 text-blue-700",
    panel: "border-blue-200 bg-blue-50/60",
    dot: "bg-blue-400",
    icon: <Circle12Filled className="h-2.5 w-2.5 animate-pulse text-blue-500" />,
  },
  online: {
    label: "Connected",
    badge: "bg-emerald-100 text-emerald-700",
    panel: "border-emerald-200 bg-emerald-50/60",
    dot: "bg-emerald-400",
    icon: <CheckmarkCircle24Filled className="h-4 w-4 text-emerald-600" />,
  },
  warning: {
    label: "Degraded",
    badge: "bg-amber-100 text-amber-700",
    panel: "border-amber-200 bg-amber-50/70",
    dot: "bg-amber-400",
    icon: <Warning24Filled className="h-4 w-4 text-amber-600" />,
  },
  offline: {
    label: "Disconnected",
    badge: "bg-red-100 text-red-700",
    panel: "border-red-200 bg-red-50/70",
    dot: "bg-red-400",
    icon: <PlugDisconnected24Regular className="h-4 w-4 text-red-600" />,
  },
};

function configMap(rows: RuntimeConfigRow[] = []) {
  return rows.reduce<Record<string, string>>((acc, row) => {
    acc[row.config_key] = row.config_value ?? "";
    return acc;
  }, { ...DEFAULT_DEVICE_CONFIG });
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

function httpUrl(value?: string | null) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    return trimmed;
  }
  if (trimmed.startsWith("rtsp://")) {
    return "";
  }
  return `http://${trimmed}`;
}

function playableStreamUrl(value?: string | null) {
  const trimmed = (value ?? "").trim();
  if (!trimmed) return "";
  if (trimmed.startsWith("rtsp://")) return trimmed;
  return httpUrl(trimmed);
}

function isImageStream(url: string) {
  const lower = url.toLowerCase();
  return (
    lower.startsWith("rtsp://") ||
    lower.includes("mjpg") ||
    lower.includes("mjpeg") ||
    lower.includes("snapshot") ||
    lower.endsWith(".jpg") ||
    lower.endsWith(".jpeg") ||
    lower.endsWith(".png")
  );
}

function proxiedStreamUrl(device: Exclude<DeviceKey, "wim">, streamUrl: string) {
  if (!streamUrl) return "";
  const params = new URLSearchParams({
    device,
    target: streamUrl,
  });
  return `/api/v3/device-stream?${params.toString()}`;
}

function latestTimestamp(row?: LatestRow) {
  return row?.created_date || row?.captured_at || null;
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
}

function ageLabel(value?: string | null) {
  if (!value) return "No data yet";
  const diffMs = Date.now() - new Date(value).getTime();
  if (!Number.isFinite(diffMs) || diffMs < 0) return "Just now";
  const minutes = Math.floor(diffMs / 60_000);
  if (minutes < 1) return "Less than 1 minute ago";
  if (minutes < 60) return `${minutes} minutes ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hours ago`;
  return `${Math.floor(hours / 24)} days ago`;
}

function activityState(value?: string | null): ProbeState {
  if (!value) return "offline";
  const diffMs = Date.now() - new Date(value).getTime();
  if (diffMs < 5 * 60_000) return "online";
  if (diffMs < 30 * 60_000) return "warning";
  return "offline";
}

function mergeState(probe: DeviceProbe | undefined, latestAt?: string | null) {
  const dataState = activityState(latestAt);
  if (!probe) return dataState;
  if (probe.state === "checking") return "checking";
  if (probe.state === "online") return "online";
  if (dataState === "online" || dataState === "warning") return "warning";
  return probe.state;
}

async function probeEndpoint(probe: ProbeTarget): Promise<DeviceProbe> {
  if (!probe.target) {
    return {
      state: "offline",
      checkedAt: new Date().toISOString(),
      message: "Endpoint is not configured",
    };
  }

  try {
    const params = new URLSearchParams({
      target: probe.target,
      protocol: probe.protocol,
      timeoutMs: "3000",
    });
    const response = await fetch(`/api/v3/device-health?${params.toString()}`, {
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
      message: payload.message || (payload.ok ? "Probe responded" : "Probe failed"),
    };
  } catch (error) {
    return {
      state: "offline",
      checkedAt: new Date().toISOString(),
      message: error instanceof Error ? error.message : "Probe failed",
    };
  }
}

function StatusPill({ status }: { status: ProbeState }) {
  const config = statusConfig[status];

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold ${config.badge}`}
    >
      {config.icon}
      {config.label}
    </span>
  );
}

function LivePlaceholder({ icon }: { icon: React.ReactNode }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden bg-slate-950">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.12)_1px,transparent_1px)] bg-[size:44px_44px]" />
      <div className="absolute left-0 right-0 top-1/2 h-px bg-cyan-400/30 shadow-[0_0_28px_rgba(34,211,238,0.5)]" />
      <div className="relative flex flex-col items-center text-slate-500">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-slate-300">
          {icon}
        </div>
        <p className="mt-4 text-sm font-bold text-slate-400">Waiting live signal</p>
      </div>
    </div>
  );
}

function LiveViewPanel({ feed }: { feed: LiveFeed }) {
  const status = statusConfig[feed.device.status];
  const playableUrl = playableStreamUrl(feed.streamUrl);
  const streamSrc = proxiedStreamUrl(feed.key, playableUrl);

  return (
    <section className="relative min-h-[320px] overflow-hidden rounded-lg border border-slate-800 bg-slate-950 shadow-sm">
      <div className="absolute inset-0">
        {streamSrc && isImageStream(playableUrl) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={streamSrc}
            alt={feed.title}
            className="h-full w-full object-cover"
          />
        ) : streamSrc ? (
          <video
            src={streamSrc}
            autoPlay
            muted
            playsInline
            controls
            className="h-full w-full object-cover"
          />
        ) : (
          <LivePlaceholder icon={deviceIcons[feed.key]} />
        )}
      </div>

      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 bg-gradient-to-b from-black/80 via-black/35 to-transparent p-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${status.dot} ${feed.device.status === "online" ? "animate-pulse" : ""}`} />
            <h2 className="text-lg font-black text-white">{feed.title}</h2>
          </div>
          <p className="mt-1 truncate text-xs font-semibold text-white/60">
            {feed.subtitle}
          </p>
        </div>
        <StatusPill status={feed.device.status} />
      </div>

      <div className="absolute inset-x-0 bottom-0 grid gap-2 bg-gradient-to-t from-black/85 via-black/45 to-transparent p-4 sm:grid-cols-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Stream</p>
          <p className="mt-1 truncate font-mono text-xs font-semibold text-white/75">
            {feed.streamUrl || "Direct stream URL not configured"}
          </p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Last Data</p>
          <p className="mt-1 text-xs font-semibold text-white/75">{feed.device.latestLabel}</p>
        </div>
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">Info</p>
          <p className="mt-1 truncate text-xs font-semibold text-white/75">{feed.meta}</p>
        </div>
      </div>
    </section>
  );
}

function DeviceCard({ device }: { device: DeviceViewModel }) {
  const config = statusConfig[device.status];

  return (
    <article className={`rounded-xl border p-4 shadow-sm ${config.panel}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 shadow-sm">
            {deviceIcons[device.key]}
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold text-slate-950">
              {device.label}
            </h2>
            <p className="mt-0.5 text-sm font-semibold text-slate-500">
              {device.role}
            </p>
          </div>
        </div>
        <StatusPill status={device.status} />
      </div>

      <dl className="mt-5 grid gap-3 text-sm">
        <div className="rounded-lg border border-white/70 bg-white/80 p-3">
          <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
            Probe Endpoint
          </dt>
          <dd className="mt-1 break-all font-mono text-xs font-semibold text-slate-700">
            {device.endpoint || "-"}
          </dd>
          <p className="mt-1 break-all text-xs font-medium text-slate-500">
            Source: {device.source}
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-lg border border-white/70 bg-white/80 p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Last Probe
            </dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {formatDateTime(device.checkedAt)}
            </dd>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {device.latencyMs ? `${device.latencyMs} ms` : device.message}
            </p>
          </div>
          <div className="rounded-lg border border-white/70 bg-white/80 p-3">
            <dt className="text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
              Last Data
            </dt>
            <dd className="mt-1 font-semibold text-slate-800">
              {device.latestLabel}
            </dd>
            <p className="mt-1 text-xs font-medium text-slate-500">
              {formatDateTime(device.latestAt)}
            </p>
          </div>
        </div>
      </dl>
    </article>
  );
}

function formatWeightRawKg(value?: number | null) {
  if (typeof value !== "number") return "-";
  return `${value.toLocaleString("en-US")} kg`;
}

export function V3DeviceConnectionPage() {
  const [probes, setProbes] = useState<Record<DeviceKey, DeviceProbe>>({
    anpr: { state: "checking", message: "Waiting for first probe" },
    axle: { state: "checking", message: "Waiting for first probe" },
    cctv: { state: "checking", message: "Waiting for first probe" },
    wim: { state: "checking", message: "Waiting for first probe" },
  });
  const [wimLive, setWimLive] = useState<WimLiveState>({
    connected: false,
    connectionState: "Opening stream",
    updatedAt: null,
  });
  const { data, loading, error, refetch } = useQuery<DeviceConnectionData>(
    DEVICE_CONNECTION_QUERY,
    {
      pollInterval: 5_000,
      fetchPolicy: "network-only",
      notifyOnNetworkStatusChange: true,
    },
  );

  const configs = useMemo(
    () => configMap(data?.system_runtime_config),
    [data?.system_runtime_config],
  );

  useEffect(() => {
    const streamUrl = configs.WIM_STREAM_URL?.trim();
    if (!streamUrl) {
      const timer = window.setTimeout(() => {
        setWimLive({
          connected: false,
          connectionState: "Not configured",
          updatedAt: new Date().toISOString(),
          error: "WIM stream endpoint is not configured",
        });
      }, 0);
      return () => window.clearTimeout(timer);
    }

    const source = new EventSource(streamUrl);

    const handleMessage = (event: MessageEvent<string>) => {
      try {
        const payload = JSON.parse(event.data) as WimLiveState;
        setWimLive({
          ...payload,
          error: null,
          updatedAt: payload.updatedAt || new Date().toISOString(),
        });
      } catch {
        setWimLive((current) => ({
          ...current,
          error: "Invalid WIM stream payload",
          updatedAt: new Date().toISOString(),
        }));
      }
    };

    source.addEventListener("status", handleMessage);
    source.addEventListener("wim", handleMessage);
    source.addEventListener("vehicle", handleMessage);
    source.onerror = () => {
      setWimLive((current) => ({
        ...current,
        connected: false,
        connectionState: "Stream disconnected",
        error: "Cannot connect to WIM stream endpoint",
        updatedAt: new Date().toISOString(),
      }));
    };

    return () => {
      source.close();
    };
  }, [configs.WIM_STREAM_URL]);

  const probeByDevice = useMemo<Record<DeviceKey, ProbeTarget>>(
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
        target: withDefaultPort(configs.CCTV_IP, "80"),
        protocol: "tcp",
      },
      wim: {
        target: withDefaultPort(configs.WIM_IP || configs.WEIGHING_TRIGGER_URL, "65002"),
        protocol: "tcp",
      },
    }),
    [configs],
  );

  const runProbes = useCallback(async () => {
    setProbes((current) => ({
      anpr: { ...current.anpr, state: "checking", message: "Checking network" },
      axle: { ...current.axle, state: "checking", message: "Checking network" },
      cctv: { ...current.cctv, state: "checking", message: "Checking network" },
      wim: { ...current.wim, state: "checking", message: "Checking network" },
    }));

    const entries = await Promise.all(
      (Object.keys(probeByDevice) as DeviceKey[]).map(async (key) => [
        key,
        await probeEndpoint(probeByDevice[key]),
      ] as const),
    );

    setProbes(Object.fromEntries(entries) as Record<DeviceKey, DeviceProbe>);
  }, [probeByDevice]);

  useEffect(() => {
    const initial = window.setTimeout(() => {
      void runProbes();
    }, 0);
    const timer = window.setInterval(() => {
      void runProbes();
    }, 5_000);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(timer);
    };
  }, [runProbes]);

  const devices = useMemo<DeviceViewModel[]>(() => {
    const latestByDevice: Record<DeviceKey, string | null> = {
      anpr: latestTimestamp(data?.anpr?.[0]),
      axle: latestTimestamp(data?.axle?.[0]),
      cctv: latestTimestamp(data?.cctv?.[0]),
      wim: latestTimestamp(data?.weighing?.[0]),
    };

    const base: Array<Omit<DeviceViewModel, "status" | "latencyMs" | "checkedAt" | "message" | "latestLabel">> = [
      {
        key: "anpr",
        label: "ANPR",
        role: "License plate reader and FTP watcher source",
        endpoint: probeByDevice.anpr.target,
        source: configs.ANPR_IP || configs.ANPR_FTP_HOST || "-",
        latestAt: latestByDevice.anpr,
      },
      {
        key: "axle",
        label: "AXLE / VAC",
        role: "Axle counter and vehicle dimension source",
        endpoint: probeByDevice.axle.target,
        source: configs.AXLE_IP || configs.AXLE_FTP_HOST || "-",
        latestAt: latestByDevice.axle,
      },
      {
        key: "cctv",
        label: "CCTV",
        role: "Evidence recorder service",
        endpoint: probeByDevice.cctv.target,
        source: configs.CCTV_IP || configs.CCTV_TRIGGER_URL || "-",
        latestAt: latestByDevice.cctv,
      },
      {
        key: "wim",
        label: "WIM",
        role: "Weight in Motion trigger and weighing data",
        endpoint: probeByDevice.wim.target,
        source: configs.WIM_IP || configs.WEIGHING_TRIGGER_URL || "-",
        latestAt: latestByDevice.wim,
      },
    ];

    return base.map((device) => {
      const probe = probes[device.key];
      const liveStatus =
        device.key === "wim" && wimLive.updatedAt
          ? wimLive.connected
            ? "online"
            : probe?.state === "online"
              ? "warning"
              : "offline"
          : undefined;
      return {
        ...device,
        status: liveStatus ?? mergeState(probe, device.latestAt),
        latencyMs: probe?.latencyMs,
        checkedAt: device.key === "wim" ? wimLive.updatedAt || probe?.checkedAt : probe?.checkedAt,
        message:
          device.key === "wim"
            ? wimLive.error || wimLive.connectionState || probe?.message || "Waiting for WIM stream"
            : probe?.message ?? "Waiting for probe",
        latestLabel: ageLabel(device.latestAt),
      };
    });
  }, [configs, data, probeByDevice, probes, wimLive]);

  const onlineCount = devices.filter((device) => device.status === "online").length;
  const warningCount = devices.filter((device) => device.status === "warning").length;
  const offlineCount = devices.filter((device) => device.status === "offline").length;
  const deviceByKey = Object.fromEntries(
    devices.map((device) => [device.key, device]),
  ) as Record<DeviceKey, DeviceViewModel>;
  const latestAnpr = data?.anpr?.[0];
  const latestAxle = data?.axle?.[0];
  const latestCctv = data?.cctv?.[0];
  const latestWeighing = data?.weighing?.[0];
  const wimTotalWeight =
    wimLive.bridgeTotalWeight ?? wimLive.totalWeight ?? latestWeighing?.total_weight;
  const wimTotalAxle = wimLive.axleCount ?? latestWeighing?.total_axle;
  const wimLastAxle = wimLive.axle ?? wimLive.axleCount;
  const hasBridgeWeight =
    typeof wimLive.bridge1Weight === "number" ||
    typeof wimLive.bridge2Weight === "number";
  const liveFeeds: LiveFeed[] = [
    {
      key: "anpr",
      title: "ANPR Live View",
      subtitle: "License plate reader camera",
      streamUrl: configs.ANPR_STREAM_URL,
      meta: latestAnpr?.plate_no
        ? `Plate ${latestAnpr.plate_no}`
        : latestAnpr?.camera_id
          ? `Camera ${latestAnpr.camera_id}`
          : "No plate capture",
      device: deviceByKey.anpr,
    },
    {
      key: "axle",
      title: "AXLE / VAC Live View",
      subtitle: "Axle counter and dimension capture",
      streamUrl: configs.AXLE_STREAM_URL,
      meta: latestAxle?.total_axles
        ? `${latestAxle.total_axles} axles detected`
        : latestAxle?.plate_no
          ? `Plate ${latestAxle.plate_no}`
          : "No axle capture",
      device: deviceByKey.axle,
    },
    {
      key: "cctv",
      title: "CCTV Live View",
      subtitle: "Evidence recorder stream",
      streamUrl: configs.CCTV_STREAM_URL || configs.CCTV_RTSP_URL,
      meta: latestCctv?.filename || "No evidence video",
      device: deviceByKey.cctv,
    },
  ];

  return (
    <main className="min-h-screen bg-slate-950 p-3 text-white sm:p-4">
      <div className="flex min-h-[calc(100vh-2rem)] flex-col gap-3">
        <header className="flex shrink-0 flex-col gap-3 rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 shadow-sm sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-300">
              Monitoring / Device Connection
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight text-white">
              Realtime Device Wall
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                Connected
              </p>
              <p className="text-lg font-black text-emerald-300">{onlineCount}/4</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                Degraded
              </p>
              <p className="text-lg font-black text-amber-300">{warningCount}</p>
            </div>
            <div className="rounded-lg border border-white/10 bg-white/5 px-3 py-2">
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/35">
                Offline
              </p>
              <p className="text-lg font-black text-red-300">{offlineCount}</p>
            </div>
            <button
              type="button"
              onClick={() => {
                void refetch();
                void runProbes();
              }}
              className="inline-flex h-12 items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 text-sm font-bold text-white hover:bg-white/15 disabled:opacity-50"
              disabled={loading}
            >
              <ArrowClockwise24Regular className="h-5 w-5 text-cyan-300" />
              Refresh
            </button>
          </div>
        </header>

        {error && (
          <div className="shrink-0 rounded-lg border border-amber-300/40 bg-amber-400/10 px-4 py-2 text-sm font-semibold text-amber-100">
            GraphQL status data is unavailable: {error.message}
          </div>
        )}

        <section className="grid flex-1 gap-3 xl:grid-cols-[1.3fr_1.3fr_1fr]">
          <div className="grid min-h-[640px] gap-3 lg:grid-rows-2">
            <LiveViewPanel feed={liveFeeds[0]} />
            <LiveViewPanel feed={liveFeeds[1]} />
          </div>

          <div className="grid min-h-[640px] gap-3 lg:grid-rows-[1.35fr_0.65fr]">
            <LiveViewPanel feed={liveFeeds[2]} />
            <section className="rounded-lg border border-slate-800 bg-slate-900 p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-white/10 text-cyan-200">
                    <Scales24Regular />
                  </div>
                  <div>
                    <h2 className="text-lg font-black">WIM</h2>
                    <p className="text-xs font-semibold text-white/45">
                      Weight in Motion
                    </p>
                  </div>
                </div>
                <StatusPill status={deviceByKey.wim.status} />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Total Weight
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {formatWeightRawKg(wimTotalWeight)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    {hasBridgeWeight ? "Bridge 1" : "Total Axle"}
                  </p>
                  <p className="mt-2 text-2xl font-black text-white">
                    {hasBridgeWeight ? formatWeightRawKg(wimLive.bridge1Weight) : wimTotalAxle ?? "-"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {hasBridgeWeight && typeof wimLive.bridge1State === "number" ? `State ${wimLive.bridge1State}` : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    {hasBridgeWeight ? "Bridge 2" : "Last Axle"}
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {hasBridgeWeight ? formatWeightRawKg(wimLive.bridge2Weight) : wimLastAxle ?? "-"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {hasBridgeWeight && typeof wimLive.bridge2State === "number"
                      ? `State ${wimLive.bridge2State}`
                      : formatWeightRawKg(wimLive.lastWeight)}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Mode
                  </p>
                  <p className="mt-2 text-xl font-black text-white">
                    {wimLive.mode ? `MODE ${wimLive.mode}` : wimLive.type || "-"}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {wimLive.directionLabel || "Direction -"} {typeof wimLive.timeout === "number" ? `- ${wimLive.timeout}s` : ""}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Live WIM Stream
                  </p>
                  <p className="mt-2 text-sm font-bold text-white">
                    {configs.WIM_STREAM_URL}
                  </p>
                  <p className="mt-1 text-xs font-semibold text-white/45">
                    {wimLive.error || `${wimLive.connectionState} - ${formatDateTime(wimLive.updatedAt || deviceByKey.wim.latestAt)}`}
                  </p>
                </div>
                <div className="rounded-lg border border-white/10 bg-white/5 p-3 sm:col-span-2">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-white/35">
                    Last Raw Frame
                  </p>
                  <p className="mt-2 line-clamp-3 break-all font-mono text-xs font-semibold text-white/60">
                    {wimLive.raw || "Waiting WIM frame"}
                  </p>
                </div>
              </div>
            </section>
          </div>

          <aside className="grid min-h-[640px] gap-3 content-start">
            {devices.map((device) => (
              <DeviceCard key={device.key} device={device} />
            ))}
          </aside>
        </section>
      </div>
    </main>
  );
}
