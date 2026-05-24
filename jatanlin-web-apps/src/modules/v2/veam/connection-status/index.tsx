"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Laptop24Regular,
  Cloud24Regular,
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
  ArrowSync24Regular,
  WifiWarning24Regular,
  Scales24Regular,
  Camera24Regular,
  Ruler24Regular,
  Database24Regular,
  ArrowRight24Regular,
} from "@fluentui/react-icons";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type ConnStatus = "online" | "offline" | "degraded" | "checking";

interface EndpointStatus {
  id: string;
  label: string;
  host: string;
  type: "device" | "local" | "server";
  icon: React.ReactElement;
  status: ConnStatus;
  latency_ms?: number;
  last_check?: string;
  detail?: string;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
async function pingEndpoint(url: string): Promise<{ ok: boolean; latency: number; detail?: string }> {
  const start = performance.now();
  try {
    const res = await fetch(url, { method: "HEAD", signal: AbortSignal.timeout(3000) });
    const latency = Math.round(performance.now() - start);
    return { ok: res.ok || res.status < 500, latency };
  } catch (e: unknown) {
    const latency = Math.round(performance.now() - start);
    const errMsg = e instanceof Error ? e.message : "Timeout";
    return { ok: false, latency, detail: errMsg };
  }
}

const StatusIcon: React.FC<{ status: ConnStatus; size?: "sm" | "md" }> = ({ status, size = "md" }) => {
  const cls = size === "sm" ? "w-4 h-4" : "w-5 h-5";
  if (status === "checking") return <ArrowSync24Regular className={`${cls} text-blue-500 animate-spin`} />;
  if (status === "online")   return <CheckmarkCircle24Filled className={`${cls} text-green-500`} />;
  if (status === "degraded") return <Warning24Filled className={`${cls} text-amber-500`} />;
  return <DismissCircle24Filled className={`${cls} text-red-500`} />;
};

const StatusChip: React.FC<{ status: ConnStatus }> = ({ status }) => {
  const map: Record<ConnStatus, { label: string; cls: string }> = {
    online:   { label: "Online",    cls: "bg-green-100 text-green-700" },
    offline:  { label: "Offline",   cls: "bg-red-100 text-red-700" },
    degraded: { label: "Degraded",  cls: "bg-amber-100 text-amber-700" },
    checking: { label: "Checking…", cls: "bg-blue-100 text-blue-700" },
  };
  const cfg = map[status];
  return <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${cfg.cls}`}>{cfg.label}</span>;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const V2VeamConnectionStatusModule: React.FC = () => {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
  const hasuraUrl = process.env.NEXT_PUBLIC_HASURA_URL ?? "http://localhost:8080/v1/graphql";
  const minioUrl  = process.env.NEXT_PUBLIC_MINIO_URL ?? "http://localhost:9000";

  const [endpoints, setEndpoints] = useState<EndpointStatus[]>([
    { id: "api",    label: "Backend API",    host: apiUrl,    type: "local",  icon: <Laptop24Regular />,   status: "checking" },
    { id: "hasura", label: "Hasura GraphQL", host: hasuraUrl, type: "server", icon: <Database24Regular />, status: "checking" },
    { id: "minio",  label: "MinIO Storage",  host: minioUrl,  type: "server", icon: <Cloud24Regular />,    status: "checking" },
    { id: "anpr",   label: "ANPR Camera",    host: `http://${process.env.NEXT_PUBLIC_ANPR_IP ?? "10.0.43.30"}`, type: "device", icon: <Camera24Regular />, status: "checking" },
    { id: "axle",   label: "AXLE Sensor",    host: `http://${process.env.NEXT_PUBLIC_AXLE_IP ?? "10.0.43.40"}`, type: "device", icon: <Ruler24Regular />,  status: "checking" },
    { id: "wim",    label: "WIM Service",    host: `http://${process.env.NEXT_PUBLIC_WIM_IP ?? "51.79.173.213"}:25000`, type: "server", icon: <Scales24Regular />, status: "checking" },
  ]);

  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const [checking, setChecking] = useState(false);

  const checkAll = useCallback(async () => {
    setChecking(true);
    setEndpoints((prev) => prev.map((e) => ({ ...e, status: "checking" as ConnStatus })));

    const results = await Promise.all(
      endpoints.map(async (ep) => {
        const result = await pingEndpoint(ep.host);
        const status: ConnStatus = result.ok ? (result.latency > 500 ? "degraded" : "online") : "offline";
        return {
          ...ep,
          status,
          latency_ms: result.latency,
          last_check: new Date().toISOString(),
          detail: result.detail,
        };
      })
    );

    setEndpoints(results);
    setLastRefreshed(new Date());
    setChecking(false);
  }, [endpoints]);

  useEffect(() => {
    checkAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const deviceEndpoints = endpoints.filter((e) => e.type === "device");
  const localEndpoints  = endpoints.filter((e) => e.type === "local");
  const serverEndpoints = endpoints.filter((e) => e.type === "server");

  const allOnline = endpoints.every((e) => e.status === "online");
  const anyOffline = endpoints.some((e) => e.status === "offline");

  const overallStatus: ConnStatus = checking
    ? "checking"
    : allOnline ? "online" : anyOffline ? "offline" : "degraded";

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Connection Status</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Monitor koneksi perangkat ke laptop dan server pusat
            {lastRefreshed && (
              <span className="ml-2 text-slate-400">· Terakhir: {lastRefreshed.toLocaleTimeString("id-ID")}</span>
            )}
          </p>
        </div>
        <button
          onClick={checkAll}
          disabled={checking}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <ArrowSync24Regular className={`w-4 h-4 ${checking ? "animate-spin" : ""}`} />
          {checking ? "Memeriksa…" : "Refresh"}
        </button>
      </div>

      {/* Overall status banner */}
      <div className={`rounded-2xl border p-4 flex items-center gap-4
        ${overallStatus === "online" ? "border-green-200 bg-green-50/60" : overallStatus === "offline" ? "border-red-200 bg-red-50/60" : overallStatus === "checking" ? "border-blue-200 bg-blue-50/60" : "border-amber-200 bg-amber-50/60"}`}>
        <StatusIcon status={overallStatus} />
        <div>
          <p className="text-sm font-bold text-slate-800">
            {overallStatus === "online"   ? "Semua sistem terhubung" :
             overallStatus === "offline"  ? "Beberapa sistem tidak terhubung" :
             overallStatus === "checking" ? "Memeriksa koneksi…" :
             "Sebagian sistem terdegradasi"}
          </p>
          <p className="text-xs text-slate-500">
            {endpoints.filter((e) => e.status === "online").length} / {endpoints.length} endpoint online
          </p>
        </div>
        <div className="ml-auto">
          <StatusChip status={overallStatus} />
        </div>
      </div>

      {/* Topology diagram */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6">
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-5">Topologi Koneksi</p>
        <div className="flex items-stretch justify-between gap-2 overflow-x-auto pb-2">

          {/* Devices column */}
          <div className="flex flex-col gap-2 min-w-[150px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">Perangkat Lapangan</p>
            {deviceEndpoints.map((ep) => (
              <TopoNode key={ep.id} ep={ep} />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-slate-300 px-2">
            <ArrowRight24Regular className="w-5 h-5" />
          </div>

          {/* Local / laptop */}
          <div className="flex flex-col gap-2 min-w-[150px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">Laptop / Lokal</p>
            {localEndpoints.map((ep) => (
              <TopoNode key={ep.id} ep={ep} />
            ))}
          </div>

          <div className="flex flex-col items-center justify-center gap-1 text-slate-300 px-2">
            <ArrowRight24Regular className="w-5 h-5" />
          </div>

          {/* Server */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider text-center mb-1">Server Pusat</p>
            {serverEndpoints.map((ep) => (
              <TopoNode key={ep.id} ep={ep} />
            ))}
          </div>
        </div>
      </div>

      {/* Detail table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-100">
          <p className="text-sm font-semibold text-slate-700">Detail Endpoint</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50">
              <th className="text-left px-5 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Endpoint</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Host</th>
              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Latency</th>
              <th className="text-center px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Status</th>
              <th className="text-left px-4 py-2.5 text-xs font-bold text-slate-400 uppercase tracking-wider">Terakhir Cek</th>
            </tr>
          </thead>
          <tbody>
            {endpoints.map((ep) => (
              <tr key={ep.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                <td className="px-5 py-3">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 text-slate-400">{ep.icon}</span>
                    <span className="font-medium text-slate-800">{ep.label}</span>
                  </div>
                </td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500 max-w-[200px] truncate">{ep.host}</td>
                <td className="px-4 py-3 text-center">
                  {ep.latency_ms !== undefined ? (
                    <span className={`text-xs font-semibold ${ep.latency_ms > 500 ? "text-amber-600" : ep.latency_ms > 200 ? "text-slate-600" : "text-green-600"}`}>
                      {ep.latency_ms} ms
                    </span>
                  ) : (
                    <span className="text-slate-300 text-xs">—</span>
                  )}
                </td>
                <td className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-1.5">
                    <StatusIcon status={ep.status} size="sm" />
                    <StatusChip status={ep.status} />
                  </div>
                </td>
                <td className="px-4 py-3 text-xs text-slate-400">
                  {ep.last_check ? new Date(ep.last_check).toLocaleTimeString("id-ID") : "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Network note */}
      <div className="flex items-start gap-2 px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
        <WifiWarning24Regular className="w-4 h-4 shrink-0 mt-0.5 text-slate-400" />
        <p>Pengecekan koneksi menggunakan HTTP HEAD request dari browser. Perangkat yang tidak memiliki endpoint HTTP (seperti FTP camera) mungkin tampil Offline meski sebenarnya terhubung via FTP. Gunakan Activation Log untuk validasi data masuk.</p>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────
// Topology Node
// ─────────────────────────────────────────────
const TopoNode: React.FC<{ ep: EndpointStatus }> = ({ ep }) => {
  const statusCls: Record<ConnStatus, string> = {
    online:   "border-green-200 bg-green-50",
    offline:  "border-red-200 bg-red-50",
    degraded: "border-amber-200 bg-amber-50",
    checking: "border-blue-200 bg-blue-50",
  };
  return (
    <div className={`rounded-xl border-2 p-3 flex items-center gap-2 transition-colors ${statusCls[ep.status]}`}>
      <span className="w-4 h-4 text-slate-500 shrink-0">{ep.icon}</span>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-slate-700 truncate">{ep.label}</p>
        {ep.latency_ms !== undefined && (
          <p className="text-[10px] text-slate-400">{ep.latency_ms} ms</p>
        )}
      </div>
      <StatusIcon status={ep.status} size="sm" />
    </div>
  );
};
