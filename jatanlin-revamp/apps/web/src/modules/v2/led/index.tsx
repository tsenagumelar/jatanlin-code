/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useQuery, gql } from "@apollo/client";
import {
  FullScreenMaximize24Regular,
  FullScreenMinimize24Regular,
  CheckmarkCircle24Filled,
  Warning24Filled,
  VehicleTruck24Regular,
  Camera24Regular,
  Scales24Regular,
  ArrowsBidirectional24Regular,
  Circle12Filled,
  ArrowSync24Regular,
} from "@fluentui/react-icons";

// ── GraphQL ───────────────────────────────────────────────────────────────────
const LED_LATEST_QUERY = gql`
  query LedLatestVehicle {
    transact_vehicle_actual(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      actual_plat_no
      actual_weight
      actual_total_axle
      actual_length
      created_date
      transact_anpr_capture { id plate_no confidence }
      transact_weighing     { id total_weight total_axle }
      transact_axle_capture { id total_axles total_wheels vehicle_category vehicle_body_type length_mm }
      transact_vehicle_statuses(limit: 1, order_by: { created_at: desc }) {
        status result notes
      }
    }
  }
`;

const LED_RECENT_QUERY = gql`
  query LedRecentVehicles {
    transact_vehicle_actual(
      where: { is_deleted: { _eq: false } }
      order_by: { created_date: desc }
      limit: 9
    ) {
      id
      actual_plat_no
      actual_weight
      actual_total_axle
      created_date
      transact_vehicle_statuses(limit: 1, order_by: { created_at: desc }) {
        status result
      }
    }
  }
`;

const LED_TODAY_QUERY = gql`
  query LedTodayVehicles($start: timestamptz!) {
    transact_vehicle_actual(
      where: { is_deleted: { _eq: false }, created_date: { _gte: $start } }
    ) {
      id
      transact_vehicle_statuses(limit: 1, order_by: { created_at: desc }) {
        status result
      }
    }
  }
`;

const LED_SENSOR_QUERY = gql`
  query LedSensors {
    anpr: transact_anpr_capture(where: { is_deleted: { _eq: false } } order_by: { created_date: desc } limit: 1) { id created_date }
    wim:  transact_weighing(where: { is_deleted: { _eq: false } } order_by: { created_date: desc } limit: 1)    { id created_date }
    axle: transact_axle_capture(where: { is_deleted: { _eq: false } } order_by: { created_at: desc_nulls_last } limit: 1) { id captured_at }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

function sensorStatus(ds?: string | null): "online" | "warning" | "offline" {
  if (!ds) return "offline";
  const diff = Date.now() - new Date(ds).getTime();
  if (diff < 2 * 3_600_000) return "online";
  if (diff < 24 * 3_600_000) return "warning";
  return "offline";
}

function classifyResult(status?: string | null, result?: string | null): {
  label: string;
  color: string;
  bg: string;
  border: string;
  glow: string;
} {
  const r = (result ?? "").toLowerCase();
  const s = (status ?? "").toLowerCase();

  if (!s || s === "pending" || s === "proses") {
    return { label: "PROSES", color: "#94a3b8", bg: "rgba(148,163,184,0.1)", border: "rgba(148,163,184,0.3)", glow: "" };
  }
  if (r.includes("over dimension") && r.includes("over load")) {
    return { label: "OVER DIMENSI & MUATAN", color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.4)", glow: "0 0 40px rgba(168,85,247,0.3)" };
  }
  if (r.includes("over load")) {
    return { label: "OVER MUATAN", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", glow: "0 0 40px rgba(239,68,68,0.3)" };
  }
  if (r.includes("over dimension")) {
    return { label: "OVER DIMENSI", color: "#f97316", bg: "rgba(249,115,22,0.12)", border: "rgba(249,115,22,0.4)", glow: "0 0 40px rgba(249,115,22,0.3)" };
  }
  if (r.includes("normal") || s === "verified" || s === "normal" || s === "selesai") {
    return { label: "NORMAL", color: "#22c55e", bg: "rgba(34,197,94,0.1)", border: "rgba(34,197,94,0.3)", glow: "0 0 40px rgba(34,197,94,0.25)" };
  }
  if (s === "rejected") {
    return { label: "DITOLAK", color: "#ef4444", bg: "rgba(239,68,68,0.12)", border: "rgba(239,68,68,0.4)", glow: "0 0 40px rgba(239,68,68,0.3)" };
  }

  return { label: "PENDING", color: "#94a3b8", bg: "rgba(148,163,184,0.08)", border: "rgba(148,163,184,0.25)", glow: "" };
}

function formatWeight(w: any): string {
  const num = Number(w);
  if (!w || isNaN(num)) return "—";
  if (num > 1000) return (num / 1000).toFixed(2);
  return num.toFixed(2);
}

function formatLength(mm: any): string {
  const num = Number(mm);
  if (!mm || isNaN(num)) return "—";
  return (num / 1000).toFixed(2);
}

function fmtTime(ds?: string | null): string {
  if (!ds) return "—";
  return new Date(ds).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function fmtDate(ds?: string | null): string {
  if (!ds) return "—";
  return new Date(ds).toLocaleDateString("id-ID", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}

// ── Component ─────────────────────────────────────────────────────────────────
export const V2LedModule: React.FC = () => {
  const [isKiosk, setIsKiosk] = useState(false);
  const [clock, setClock] = useState("");
  const [todayStr] = useState(() => startOfToday());
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  // Live clock
  useEffect(() => {
    const tick = () =>
      setClock(new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Keyboard shortcut F = toggle fullscreen
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "f" || e.key === "F") setIsKiosk((v) => !v);
      if (e.key === "Escape" && isKiosk) setIsKiosk(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isKiosk]);

  // Queries
  const { data: latestData, refetch: refetchLatest } = useQuery(LED_LATEST_QUERY, {
    pollInterval: 5_000,
    fetchPolicy: "network-only",
    onCompleted: () => setLastUpdated(new Date()),
  });

  const { data: recentData } = useQuery(LED_RECENT_QUERY, {
    pollInterval: 5_000,
    fetchPolicy: "network-only",
  });

  const { data: todayData } = useQuery(LED_TODAY_QUERY, {
    variables: { start: todayStr },
    pollInterval: 15_000,
    fetchPolicy: "network-only",
  });

  const { data: sensorData } = useQuery(LED_SENSOR_QUERY, {
    pollInterval: 30_000,
    fetchPolicy: "network-only",
  });

  const manualRefresh = useCallback(() => refetchLatest(), [refetchLatest]);

  // ── Computed values ─────────────────────────────────────────────────────────
  const latest = latestData?.transact_vehicle_actual?.[0] ?? null;
  const recentList: any[] = recentData?.transact_vehicle_actual ?? [];
  const todayVehicles: any[] = todayData?.transact_vehicle_actual ?? [];

  const plate = latest?.actual_plat_no
    ?? latest?.transact_anpr_capture?.plate_no
    ?? "—";

  const weight = formatWeight(
    latest?.actual_weight ?? latest?.transact_weighing?.total_weight
  );
  const axles =
    latest?.actual_total_axle ?? latest?.transact_axle_capture?.total_axles ?? "—";
  const wheels = latest?.transact_axle_capture?.total_wheels ?? "—";
  const length = formatLength(
    latest?.actual_length ?? latest?.transact_axle_capture?.length_mm
  );
  const category = latest?.transact_axle_capture?.vehicle_category ?? "—";
  const bodyType = latest?.transact_axle_capture?.vehicle_body_type ?? null;

  const latestStatus = latest?.transact_vehicle_statuses?.[0] ?? null;
  const statusInfo = classifyResult(latestStatus?.status, latestStatus?.result);

  // Today stats
  const totalToday = todayVehicles.length;
  const normalToday = todayVehicles.filter((v: any) => {
    const s = v.transact_vehicle_statuses?.[0];
    const r = (s?.result ?? "").toLowerCase();
    const st = (s?.status ?? "").toLowerCase();
    return r.includes("normal") || st === "normal";
  }).length;
  const violationToday = todayVehicles.filter((v: any) => {
    const s = v.transact_vehicle_statuses?.[0];
    const r = (s?.result ?? "").toLowerCase();
    return r.includes("over");
  }).length;
  const pendingToday = totalToday - normalToday - violationToday;

  // Violation breakdown
  const overLoad = todayVehicles.filter((v: any) => {
    const r = (v.transact_vehicle_statuses?.[0]?.result ?? "").toLowerCase();
    return r.includes("over load") && !r.includes("dimension");
  }).length;
  const overDim = todayVehicles.filter((v: any) => {
    const r = (v.transact_vehicle_statuses?.[0]?.result ?? "").toLowerCase();
    return r.includes("over dimension") && !r.includes("load");
  }).length;
  const overBoth = todayVehicles.filter((v: any) => {
    const r = (v.transact_vehicle_statuses?.[0]?.result ?? "").toLowerCase();
    return r.includes("over dimension") && r.includes("over load");
  }).length;

  // Sensor statuses
  const anprStatus = sensorStatus(sensorData?.anpr?.[0]?.created_date);
  const wimStatus  = sensorStatus(sensorData?.wim?.[0]?.created_date);
  const axleStatus = sensorStatus(sensorData?.axle?.[0]?.captured_at);

  const sensorDot = (st: "online" | "warning" | "offline") => {
    if (st === "online")  return "#22c55e";
    if (st === "warning") return "#f59e0b";
    return "#ef4444";
  };

  // Site info from env
  const siteName     = process.env.NEXT_PUBLIC_SITE_NAME ?? "JATANLIN";
  const siteLocation = process.env.NEXT_PUBLIC_SITE_LOCATION ?? "—";
  const siteCode     = process.env.NEXT_PUBLIC_SITE_CODE ?? "—";

  // ── Render ──────────────────────────────────────────────────────────────────
  const containerClass = isKiosk
    ? "fixed inset-0 z-[9999] flex flex-col"
    : "flex flex-col w-full h-full min-h-[calc(100vh-64px)]";

  return (
    <div
      className={containerClass}
      style={{ background: "#050a14", color: "#e2e8f0", fontFamily: "'Inter', 'Segoe UI', sans-serif" }}
    >
      {/* ── TOP BAR ─────────────────────────────────────────────────────────── */}
      <div
        className="flex items-center justify-between shrink-0 px-8 py-3 border-b"
        style={{ borderColor: "rgba(255,255,255,0.08)", background: "rgba(0,0,0,0.4)" }}
      >
        {/* Left: Brand + Site */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div
              className="w-8 h-8 rounded flex items-center justify-center shrink-0"
              style={{ background: "rgba(59,130,246,0.2)", border: "1px solid rgba(59,130,246,0.4)" }}
            >
              <VehicleTruck24Regular style={{ color: "#60a5fa", width: 18, height: 18 }} />
            </div>
            <div>
              <div className="text-xs font-black tracking-[0.2em] uppercase" style={{ color: "#60a5fa", lineHeight: 1 }}>
                JATANLIN
              </div>
              <div className="text-[9px] font-medium tracking-widest uppercase" style={{ color: "#475569", lineHeight: 1.4 }}>
                KORLANTAS POLRI
              </div>
            </div>
          </div>
          <div className="h-5 w-px" style={{ background: "rgba(255,255,255,0.1)" }} />
          <div>
            <div className="text-sm font-bold tracking-wide" style={{ color: "#cbd5e1" }}>
              {siteName} — {siteLocation}
            </div>
            <div className="text-[10px] font-mono" style={{ color: "#475569" }}>{siteCode}</div>
          </div>
        </div>

        {/* Center: Sensor status */}
        <div className="flex items-center gap-5">
          {[
            { key: "ANPR", icon: <Camera24Regular style={{ width: 14, height: 14 }} />, status: anprStatus },
            { key: "WIM",  icon: <Scales24Regular style={{ width: 14, height: 14 }} />,  status: wimStatus },
            { key: "AXLE", icon: <ArrowsBidirectional24Regular style={{ width: 14, height: 14 }} />, status: axleStatus },
          ].map(({ key, icon, status }) => (
            <div key={key} className="flex items-center gap-1.5">
              <div style={{ color: "#64748b" }}>{icon}</div>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: "#64748b" }}>{key}</span>
              <Circle12Filled style={{ width: 8, height: 8, color: sensorDot(status) }} />
            </div>
          ))}
        </div>

        {/* Right: Clock + Controls */}
        <div className="flex items-center gap-4">
          <div className="text-right">
            <div className="text-2xl font-mono font-black tracking-wider leading-none" style={{ color: "#f1f5f9" }}>
              {clock}
            </div>
            <div className="text-[10px] font-medium mt-0.5" style={{ color: "#475569" }}>
              {fmtDate(new Date().toISOString())}
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={manualRefresh}
              className="p-1.5 rounded transition-colors"
              title="Refresh"
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#64748b",
              }}
            >
              <ArrowSync24Regular style={{ width: 14, height: 14 }} />
            </button>
            <button
              onClick={() => setIsKiosk((v) => !v)}
              className="p-1.5 rounded transition-colors"
              title={isKiosk ? "Keluar Kiosk (F)" : "Mode Kiosk (F)"}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#64748b",
              }}
            >
              {isKiosk
                ? <FullScreenMinimize24Regular style={{ width: 14, height: 14 }} />
                : <FullScreenMaximize24Regular style={{ width: 14, height: 14 }} />
              }
            </button>
          </div>
        </div>
      </div>

      {/* ── MAIN AREA ───────────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* ── LEFT: Current Vehicle ──────────────────────────────────────────── */}
        <div
          className="flex flex-col justify-between p-8"
          style={{ flex: "0 0 62%", borderRight: "1px solid rgba(255,255,255,0.07)" }}
        >
          {/* Label */}
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black tracking-[0.2em] uppercase mb-6"
              style={{ background: "rgba(99,102,241,0.15)", border: "1px solid rgba(99,102,241,0.3)", color: "#818cf8" }}
            >
              <Circle12Filled className="animate-pulse" style={{ width: 8, height: 8 }} />
              Kendaraan Terakhir Terdeteksi
            </div>

            {/* Plate Number — the hero element */}
            <div
              className="font-black leading-none tracking-[0.12em] uppercase mb-2 transition-all duration-500"
              style={{
                fontSize: "clamp(4rem, 9vw, 8rem)",
                color: plate === "—" ? "#334155" : "#f8fafc",
                textShadow: plate === "—" ? "none" : "0 0 60px rgba(248,250,252,0.15)",
                letterSpacing: "0.12em",
              }}
            >
              {plate}
            </div>

            {/* Waktu deteksi */}
            <div className="text-base font-mono mb-8" style={{ color: "#475569" }}>
              {fmtDate(latest?.created_date)} &nbsp;|&nbsp; {fmtTime(latest?.created_date)}
            </div>
          </div>

          {/* Metrics row */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            {/* Weight */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <Scales24Regular style={{ width: 16, height: 16, color: "#60a5fa" }} />
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569" }}>
                  Berat Kendaraan
                </span>
              </div>
              <div className="font-black leading-none" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#f1f5f9" }}>
                {weight}
              </div>
              <div className="text-sm font-semibold mt-1" style={{ color: "#60a5fa" }}>TON</div>
            </div>

            {/* Axles */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowsBidirectional24Regular style={{ width: 16, height: 16, color: "#34d399" }} />
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569" }}>
                  Sumbu / Roda
                </span>
              </div>
              <div className="font-black leading-none" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#f1f5f9" }}>
                {axles}
              </div>
              <div className="text-sm font-semibold mt-1" style={{ color: "#34d399" }}>
                {wheels !== "—" ? `${wheels} RODA` : "SUMBU"}
              </div>
            </div>

            {/* Length */}
            <div
              className="rounded-2xl p-5"
              style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <div className="flex items-center gap-2 mb-2">
                <ArrowsBidirectional24Regular style={{ width: 16, height: 16, color: "#fb923c" }} />
                <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#475569" }}>
                  Panjang
                </span>
              </div>
              <div className="font-black leading-none" style={{ fontSize: "clamp(2rem, 4vw, 3.5rem)", color: "#f1f5f9" }}>
                {length}
              </div>
              <div className="text-sm font-semibold mt-1" style={{ color: "#fb923c" }}>METER</div>
            </div>
          </div>

          {/* Classification + Status Badge */}
          <div className="flex items-end gap-4 flex-wrap">
            {/* Category badge */}
            {category !== "—" && (
              <div
                className="px-4 py-2 rounded-xl text-sm font-bold tracking-wide"
                style={{
                  background: "rgba(99,102,241,0.1)",
                  border: "1px solid rgba(99,102,241,0.25)",
                  color: "#a5b4fc",
                }}
              >
                {category}
                {bodyType && <span className="ml-2 opacity-60">· {bodyType}</span>}
              </div>
            )}

            {/* Status badge — main verdict */}
            <div
              className="px-6 py-3 rounded-2xl font-black tracking-[0.15em] uppercase transition-all duration-700"
              style={{
                fontSize: "clamp(1.1rem, 2.2vw, 1.75rem)",
                color: statusInfo.color,
                background: statusInfo.bg,
                border: `2px solid ${statusInfo.border}`,
                boxShadow: statusInfo.glow,
              }}
            >
              <div className="flex items-center gap-3">
                {statusInfo.label === "NORMAL" ? (
                  <CheckmarkCircle24Filled style={{ width: 22, height: 22 }} />
                ) : statusInfo.label !== "PROSES" && statusInfo.label !== "PENDING" ? (
                  <Warning24Filled style={{ width: 22, height: 22 }} />
                ) : null}
                {statusInfo.label}
              </div>
            </div>

            {/* Last updated */}
            {lastUpdated && (
              <div className="ml-auto text-[10px] font-mono" style={{ color: "#1e293b" }}>
                Update: {lastUpdated.toLocaleTimeString("id-ID")}
              </div>
            )}
          </div>
        </div>

        {/* ── RIGHT: Stats + Sensor ──────────────────────────────────────────── */}
        <div className="flex flex-col p-6 gap-4" style={{ flex: "0 0 38%", overflowY: "auto" }}>

          {/* Today stats header */}
          <div
            className="text-[9px] font-black tracking-[0.25em] uppercase pb-2 border-b"
            style={{ color: "#334155", borderColor: "rgba(255,255,255,0.06)" }}
          >
            Statistik Hari Ini
          </div>

          {/* Big numbers */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Total", value: totalToday, color: "#60a5fa" },
              { label: "Normal", value: normalToday, color: "#22c55e" },
              { label: "Pelanggaran", value: violationToday, color: "#ef4444" },
            ].map(({ label, value, color }) => (
              <div
                key={label}
                className="rounded-xl p-4 flex flex-col items-center justify-center text-center"
                style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
              >
                <div
                  className="font-black leading-none mb-1"
                  style={{ fontSize: "clamp(2rem, 3.5vw, 3rem)", color }}
                >
                  {value}
                </div>
                <div className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#334155" }}>
                  {label}
                </div>
              </div>
            ))}
          </div>

          {/* Pending */}
          {pendingToday > 0 && (
            <div
              className="rounded-xl px-4 py-3 flex items-center justify-between"
              style={{ background: "rgba(148,163,184,0.06)", border: "1px solid rgba(148,163,184,0.1)" }}
            >
              <span className="text-[10px] font-bold tracking-widest uppercase" style={{ color: "#334155" }}>
                Belum Diverifikasi
              </span>
              <span className="text-xl font-black" style={{ color: "#94a3b8" }}>{pendingToday}</span>
            </div>
          )}

          {/* Violation breakdown */}
          {violationToday > 0 && (
            <>
              <div
                className="text-[9px] font-black tracking-[0.25em] uppercase pb-2 border-b mt-2"
                style={{ color: "#334155", borderColor: "rgba(255,255,255,0.06)" }}
              >
                Rincian Pelanggaran
              </div>
              <div className="space-y-2">
                {[
                  { label: "Over Muatan", count: overLoad, color: "#ef4444" },
                  { label: "Over Dimensi", count: overDim, color: "#f97316" },
                  { label: "Over Dimensi & Muatan", count: overBoth, color: "#a855f7" },
                ].filter((x) => x.count > 0).map(({ label, count, color }) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                    <span className="flex-1 text-xs font-semibold" style={{ color: "#94a3b8" }}>{label}</span>
                    <span className="text-base font-black" style={{ color }}>{count}</span>
                    <div
                      className="h-1.5 rounded-full"
                      style={{
                        width: `${Math.max(4, (count / violationToday) * 80)}px`,
                        background: color,
                        opacity: 0.6,
                      }}
                    />
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Sensor Status */}
          <div
            className="text-[9px] font-black tracking-[0.25em] uppercase pb-2 border-b mt-2"
            style={{ color: "#334155", borderColor: "rgba(255,255,255,0.06)" }}
          >
            Status Sensor
          </div>
          <div className="space-y-2">
            {[
              { key: "ANPR Camera", icon: <Camera24Regular style={{ width: 14, height: 14 }} />, status: anprStatus },
              { key: "WIM Timbangan", icon: <Scales24Regular style={{ width: 14, height: 14 }} />, status: wimStatus },
              { key: "AXLE Sensor", icon: <ArrowsBidirectional24Regular style={{ width: 14, height: 14 }} />, status: axleStatus },
            ].map(({ key, icon, status }) => {
              const dotColor = sensorDot(status);
              const statusLabel = status === "online" ? "Online" : status === "warning" ? "Warning" : "Offline";
              return (
                <div key={key} className="flex items-center gap-3">
                  <div style={{ color: "#475569" }}>{icon}</div>
                  <span className="flex-1 text-xs font-semibold" style={{ color: "#64748b" }}>{key}</span>
                  <div className="flex items-center gap-1.5">
                    <div
                      className={status === "online" ? "animate-pulse" : ""}
                      style={{ width: 8, height: 8, borderRadius: "50%", background: dotColor }}
                    />
                    <span className="text-[10px] font-bold" style={{ color: dotColor }}>{statusLabel}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* LIVE indicator */}
          <div className="flex-1" />
          <div
            className="flex items-center justify-center gap-2 py-2 rounded-lg"
            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
          >
            <Circle12Filled
              className="animate-pulse"
              style={{ width: 8, height: 8, color: "#22c55e" }}
            />
            <span className="text-[10px] font-black tracking-[0.25em] uppercase" style={{ color: "#22c55e" }}>
              LIVE — Update setiap 5 detik
            </span>
          </div>
        </div>
      </div>

      {/* ── BOTTOM: Recent Vehicles ──────────────────────────────────────────── */}
      <div
        className="shrink-0 border-t"
        style={{ borderColor: "rgba(255,255,255,0.07)", background: "rgba(0,0,0,0.3)" }}
      >
        {/* Header */}
        <div
          className="px-8 py-2 flex items-center gap-3 border-b"
          style={{ borderColor: "rgba(255,255,255,0.05)" }}
        >
          <span className="text-[9px] font-black tracking-[0.25em] uppercase" style={{ color: "#334155" }}>
            Riwayat Kendaraan Terakhir
          </span>
          <div className="h-px flex-1" style={{ background: "rgba(255,255,255,0.04)" }} />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                {["No", "Plat Nomor", "Berat (Ton)", "Sumbu", "Status", "Waktu"].map((h) => (
                  <th
                    key={h}
                    className="px-6 py-2 text-left text-[9px] font-black tracking-[0.18em] uppercase"
                    style={{ color: "#1e293b" }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-xs" style={{ color: "#1e293b" }}>
                    Belum ada data kendaraan hari ini
                  </td>
                </tr>
              ) : (
                recentList.map((v: any, idx: number) => {
                  const vStatus = v.transact_vehicle_statuses?.[0];
                  const vInfo = classifyResult(vStatus?.status, vStatus?.result);
                  const vPlate = v.actual_plat_no ?? "—";
                  const vWeight = formatWeight(v.actual_weight);
                  const isFirst = idx === 0;

                  return (
                    <tr
                      key={v.id}
                      style={{
                        borderBottom: "1px solid rgba(255,255,255,0.04)",
                        background: isFirst ? "rgba(99,102,241,0.06)" : "transparent",
                      }}
                    >
                      <td className="px-6 py-2.5 text-xs font-mono" style={{ color: "#334155" }}>
                        {idx + 1}
                      </td>
                      <td className="px-6 py-2.5">
                        <span
                          className="text-sm font-black tracking-widest uppercase"
                          style={{ color: isFirst ? "#f1f5f9" : "#94a3b8" }}
                        >
                          {vPlate}
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-sm font-mono font-bold" style={{ color: "#64748b" }}>
                        {vWeight}
                      </td>
                      <td className="px-6 py-2.5 text-sm font-bold" style={{ color: "#64748b" }}>
                        {v.actual_total_axle ?? "—"}
                      </td>
                      <td className="px-6 py-2.5">
                        <span
                          className="px-2.5 py-0.5 rounded-full text-[10px] font-black tracking-wider uppercase"
                          style={{
                            color: vInfo.color,
                            background: vInfo.bg,
                            border: `1px solid ${vInfo.border}`,
                          }}
                        >
                          {vInfo.label}
                        </span>
                      </td>
                      <td className="px-6 py-2.5 text-xs font-mono" style={{ color: "#334155" }}>
                        {fmtTime(v.created_date)}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Kiosk hint */}
      {!isKiosk && (
        <div
          className="fixed bottom-4 right-4 px-3 py-1.5 rounded-full text-[10px] font-semibold pointer-events-none"
          style={{
            background: "rgba(0,0,0,0.7)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "#475569",
          }}
        >
          Tekan F untuk Mode Kiosk
        </div>
      )}
    </div>
  );
};

export default V2LedModule;
