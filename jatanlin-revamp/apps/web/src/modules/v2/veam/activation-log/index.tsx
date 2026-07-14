"use client";

import React, { useState, useMemo } from "react";
import {
  CheckmarkCircle24Filled,
  DismissCircle24Filled,
  Warning24Filled,
  Filter24Regular,
  Search24Regular,
  ArrowDownload24Regular,
  Info24Regular,
  ShieldCheckmark24Regular,
  PlugConnected24Regular,
  ShieldDismiss24Regular,
  History24Regular,
} from "@fluentui/react-icons";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type LogLevel = "success" | "error" | "warning" | "info";
type LogEvent =
  | "license_activated"
  | "license_revoked"
  | "license_expired"
  | "device_registered"
  | "device_removed"
  | "connection_ok"
  | "connection_failed"
  | "scan_usb";

interface ActivationLogEntry {
  id: string;
  timestamp: string;
  event: LogEvent;
  level: LogLevel;
  actor: string;
  message: string;
  detail?: string;
  metadata?: Record<string, string>;
}

// ─────────────────────────────────────────────
// Seed data
// ─────────────────────────────────────────────
const LS_KEY = "veam_activation_log_v1";

function seedLogs(): ActivationLogEntry[] {
  return [
    {
      id: "log-001",
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      event: "license_activated",
      level: "success",
      actor: "Operator",
      message: "Lisensi VEAM berhasil diaktifkan",
      detail: "License ID: VEAM-2025-MST-001 | Expiry: 2026-12-31",
      metadata: { license_id: "VEAM-2025-MST-001", site_id: "e1123daf-a4db-4ee1-88da-ba9bff382f45" },
    },
    {
      id: "log-002",
      timestamp: new Date(Date.now() - 1.5 * 60 * 60 * 1000).toISOString(),
      event: "device_registered",
      level: "success",
      actor: "Operator",
      message: "Perangkat PWS-Unit-01 didaftarkan",
      detail: "IP: 10.0.43.40 | Serial: SN-PWS-2025-001",
      metadata: { device_type: "PWS", serial: "SN-PWS-2025-001" },
    },
    {
      id: "log-003",
      timestamp: new Date(Date.now() - 60 * 60 * 1000).toISOString(),
      event: "device_registered",
      level: "success",
      actor: "Operator",
      message: "Perangkat TIIC-Lajur-1 didaftarkan",
      detail: "IP: 10.0.43.30 | Serial: SN-TIIC-2025-001",
      metadata: { device_type: "TIIC", serial: "SN-TIIC-2025-001" },
    },
    {
      id: "log-004",
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      event: "connection_ok",
      level: "success",
      actor: "System",
      message: "Koneksi ke server pusat berhasil",
      detail: "Latency: 42ms | Endpoint: localhost:8080",
    },
    {
      id: "log-005",
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      event: "connection_failed",
      level: "error",
      actor: "System",
      message: "Gagal terhubung ke WIM Service",
      detail: "Timeout setelah 3000ms | URL: http://localhost:25000",
    },
    {
      id: "log-006",
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      event: "scan_usb",
      level: "info",
      actor: "Operator",
      message: "Scan USB dilakukan, tidak ada file .veam ditemukan",
    },
    {
      id: "log-007",
      timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
      event: "connection_ok",
      level: "success",
      actor: "System",
      message: "Semua endpoint terhubung",
      detail: "6/6 endpoint online",
    },
  ];
}

function loadLogs(): ActivationLogEntry[] {
  if (typeof window === "undefined") return seedLogs();
  try {
    const raw = localStorage.getItem(LS_KEY);
    if (!raw) {
      const seeds = seedLogs();
      localStorage.setItem(LS_KEY, JSON.stringify(seeds));
      return seeds;
    }
    return JSON.parse(raw);
  } catch {
    return seedLogs();
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
const EVENT_META: Record<LogEvent, { label: string; icon: React.ReactElement }> = {
  license_activated: { label: "Aktivasi Lisensi",  icon: <ShieldCheckmark24Regular /> },
  license_revoked:   { label: "Cabut Lisensi",     icon: <ShieldDismiss24Regular /> },
  license_expired:   { label: "Lisensi Kadaluarsa", icon: <Warning24Filled /> },
  device_registered: { label: "Daftar Perangkat",  icon: <PlugConnected24Regular /> },
  device_removed:    { label: "Hapus Perangkat",   icon: <PlugConnected24Regular /> },
  connection_ok:     { label: "Koneksi OK",         icon: <CheckmarkCircle24Filled /> },
  connection_failed: { label: "Koneksi Gagal",      icon: <DismissCircle24Filled /> },
  scan_usb:          { label: "Scan USB",           icon: <Info24Regular /> },
};

const LEVEL_CLS: Record<LogLevel, { dot: string; row: string; badge: string }> = {
  success: { dot: "bg-green-500",  row: "",                badge: "bg-green-100 text-green-700" },
  error:   { dot: "bg-red-500",    row: "bg-red-50/40",    badge: "bg-red-100 text-red-700" },
  warning: { dot: "bg-amber-500",  row: "bg-amber-50/30",  badge: "bg-amber-100 text-amber-700" },
  info:    { dot: "bg-blue-400",   row: "",                badge: "bg-blue-100 text-blue-700" },
};

const LevelIcon: React.FC<{ level: LogLevel }> = ({ level }) => {
  if (level === "success") return <CheckmarkCircle24Filled className="w-4 h-4 text-green-500" />;
  if (level === "error")   return <DismissCircle24Filled className="w-4 h-4 text-red-500" />;
  if (level === "warning") return <Warning24Filled className="w-4 h-4 text-amber-500" />;
  return <Info24Regular className="w-4 h-4 text-blue-500" />;
};

// ─────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────
export const V2VeamActivationLogModule: React.FC = () => {
  const [logs] = useState<ActivationLogEntry[]>(loadLogs);
  const [search, setSearch] = useState("");
  const [levelFilter, setLevelFilter] = useState<LogLevel | "all">("all");
  const [eventFilter, setEventFilter] = useState<LogEvent | "all">("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return logs
      .filter((l) => levelFilter === "all" || l.level === levelFilter)
      .filter((l) => eventFilter === "all" || l.event === eventFilter)
      .filter((l) =>
        !search ||
        l.message.toLowerCase().includes(search.toLowerCase()) ||
        l.actor.toLowerCase().includes(search.toLowerCase()) ||
        l.detail?.toLowerCase().includes(search.toLowerCase())
      )
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  }, [logs, levelFilter, eventFilter, search]);

  const handleExport = () => {
    const csv = [
      ["Timestamp", "Level", "Event", "Actor", "Message", "Detail"].join(","),
      ...filtered.map((l) =>
        [l.timestamp, l.level, l.event, l.actor, `"${l.message}"`, `"${l.detail ?? ""}"`].join(",")
      ),
    ].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement("a");
    a.href     = url;
    a.download = `veam-activation-log-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const summary = {
    total:   logs.length,
    success: logs.filter((l) => l.level === "success").length,
    error:   logs.filter((l) => l.level === "error").length,
    warning: logs.filter((l) => l.level === "warning").length,
    info:    logs.filter((l) => l.level === "info").length,
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Activation Log</h1>
          <p className="text-xs text-slate-500 mt-0.5">Riwayat aktivasi, registrasi perangkat, dan event koneksi VEAM</p>
        </div>
        <button
          onClick={handleExport}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors"
        >
          <ArrowDownload24Regular className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Summary chips */}
      <div className="flex flex-wrap gap-2">
        {(["all", "success", "error", "warning", "info"] as const).map((lv) => {
          const count = lv === "all" ? summary.total : summary[lv];
          const isActive = levelFilter === lv;
          const cls = lv === "all" ? "bg-slate-100 text-slate-600" : LEVEL_CLS[lv].badge;
          return (
            <button
              key={lv}
              onClick={() => setLevelFilter(lv)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border-2
                ${isActive ? "border-slate-400 shadow-sm scale-105" : "border-transparent"}
                ${cls}`}
            >
              {lv === "all" ? "Semua" : lv.charAt(0).toUpperCase() + lv.slice(1)} ({count})
            </button>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search24Regular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari pesan, aktor, detail…"
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-800
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400"
          />
        </div>
        <div className="relative">
          <Filter24Regular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
          <select
            value={eventFilter}
            onChange={(e) => setEventFilter(e.target.value as LogEvent | "all")}
            className="pl-9 pr-4 py-2 rounded-xl border border-slate-200 bg-slate-50 text-sm text-slate-700
              focus:outline-none focus:ring-2 focus:ring-blue-300 focus:border-blue-400 appearance-none cursor-pointer"
          >
            <option value="all">Semua Event</option>
            {Object.entries(EVENT_META).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 text-slate-400 gap-2">
            <History24Regular className="w-10 h-10" />
            <p className="text-sm font-medium">Tidak ada log yang cocok dengan filter</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                <th className="w-8 px-4" />
                <th className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Waktu</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Event</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Pesan</th>
                <th className="text-left px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Aktor</th>
                <th className="text-center px-3 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider">Level</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <React.Fragment key={log.id}>
                  <tr
                    className={`border-b border-slate-50 hover:bg-slate-50/80 cursor-pointer transition-colors ${LEVEL_CLS[log.level].row}`}
                    onClick={() => setExpandedId(expandedId === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3">
                      <span className={`w-2 h-2 rounded-full inline-block ${LEVEL_CLS[log.level].dot}`} />
                    </td>
                    <td className="px-3 py-3 text-xs text-slate-500 whitespace-nowrap font-mono">
                      {new Date(log.timestamp).toLocaleString("id-ID", { hour12: false })}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1.5 text-slate-600">
                        <span className="w-3.5 h-3.5 shrink-0">{EVENT_META[log.event].icon}</span>
                        <span className="text-xs font-medium">{EVENT_META[log.event].label}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-slate-800 font-medium">{log.message}</td>
                    <td className="px-3 py-3 text-xs text-slate-500">{log.actor}</td>
                    <td className="px-3 py-3 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <LevelIcon level={log.level} />
                      </div>
                    </td>
                  </tr>
                  {expandedId === log.id && (
                    <tr className="bg-slate-50/80 border-b border-slate-100">
                      <td colSpan={6} className="px-8 py-3 text-xs text-slate-600 space-y-1">
                        {log.detail && (
                          <p className="font-mono bg-slate-100 px-3 py-2 rounded-lg">{log.detail}</p>
                        )}
                        {log.metadata && (
                          <div className="flex flex-wrap gap-2 mt-1.5">
                            {Object.entries(log.metadata).map(([k, v]) => (
                              <span key={k} className="bg-white border border-slate-200 px-2 py-0.5 rounded-md text-[10px]">
                                <span className="text-slate-400">{k}: </span>
                                <span className="font-mono font-semibold text-slate-700">{v}</span>
                              </span>
                            ))}
                          </div>
                        )}
                        <p className="text-slate-400 text-[10px] pt-1">ID: {log.id}</p>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <p className="text-xs text-slate-400 text-right">
        Menampilkan {filtered.length} dari {logs.length} log · Klik baris untuk detail
      </p>
    </div>
  );
};
