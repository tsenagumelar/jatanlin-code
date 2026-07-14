"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import { useQuery, gql } from "@apollo/client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Camera24Regular,
  Scales24Regular,
  ArrowsBidirectional24Regular,
  VideoClip24Regular,
  CheckmarkCircle24Regular,
  CheckmarkCircle24Filled,
  ArrowRight16Regular,
  ChevronRight16Regular,
  Tv24Regular,
  ArrowSync24Regular,
  ArrowCounterclockwise24Regular,
  Warning24Regular,
  VehicleTruck24Regular,
  Ruler20Regular,
  History24Regular,
  DocumentBulletList24Regular,
  QuestionCircle24Regular,
  Circle12Filled,
  Play20Regular,
} from "@fluentui/react-icons";
import { useProcessing } from "@/src/contexts/ProcessingContext";
import { SessionPanel } from "./SessionPanel";

// ── GraphQL ───────────────────────────────────────────────────────────────────
const SENSOR_QUERY = gql`
  query V2ProcSensors {
    anpr: transact_anpr_capture(where:{is_deleted:{_eq:false}} order_by:{created_date:desc} limit:1) { id created_date }
    wim:  transact_weighing(where:{is_deleted:{_eq:false}} order_by:{created_date:desc} limit:1) { id created_date }
    axle: transact_axle_capture(where:{is_deleted:{_eq:false}} order_by:{created_at:desc_nulls_last} limit:1) { id captured_at }
    cctv: transact_cctv(where:{is_deleted:{_eq:false}} order_by:{created_date:desc} limit:1) { id created_date }
  }
`;

const VEHICLES_QUERY = gql`
  query V2ProcVehicles($start: timestamptz!) {
    transact_vehicle_actual(
      where:{is_deleted:{_eq:false}, created_date:{_gte:$start}}
      order_by:{created_date:desc}
      limit: 20
    ) {
      id actual_plat_no actual_weight actual_total_axle created_date
      transact_anpr_capture { id plate_no }
      transact_weighing     { id }
      transact_axle_capture { id total_axles }
      transact_cctv         { id }
      transact_vehicle_statuses(limit:1 order_by:{created_at:desc}) { status result }
    }
  }
`;

// ── Helpers ───────────────────────────────────────────────────────────────────
function startOfToday() { const d = new Date(); d.setHours(0,0,0,0); return d.toISOString(); }

function sensorStatus(ds?: string | null): "online" | "warning" | "offline" {
  if (!ds) return "offline";
  const diff = Date.now() - new Date(ds).getTime();
  if (diff < 2 * 3_600_000)  return "online";
  if (diff < 24 * 3_600_000) return "warning";
  return "offline";
}

function fmtTime(ds?: string | null) {
  if (!ds) return "—";
  return new Date(ds).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

type VehicleRow = {
  id: string;
  actual_plat_no?: string | null;
  actual_weight?: string | null;
  actual_total_axle?: number | null;
  created_date?: string | null;
  transact_anpr_capture?: { id: string; plate_no?: string | null } | null;
  transact_weighing?:     { id: string } | null;
  transact_axle_capture?: { id: string; total_axles?: number | null } | null;
  transact_cctv?:         { id: string } | null;
  transact_vehicle_statuses?: Array<{ status: string; result?: string | null }>;
};

type StepInfo = { stepId: number; stageKey: string; stageLabel: string; violationLabel: string };

function getStep(row: VehicleRow): StepInfo {
  const ss = row.transact_vehicle_statuses?.[0]?.status;
  const sr = row.transact_vehicle_statuses?.[0]?.result;
  if (ss === "verified" || ss === "rejected")
    return { stepId: 5, stageKey: "DECISION", stageLabel: "Selesai",           violationLabel: sr ?? "Normal" };
  if (row.transact_cctv)
    return { stepId: 4, stageKey: "CCTV",     stageLabel: "Video Verification", violationLabel: sr ?? "Pending" };
  if (row.transact_axle_capture)
    return { stepId: 3, stageKey: "AXLE",     stageLabel: "Axle & Dimension",   violationLabel: sr ?? "Pending" };
  if (row.transact_weighing)
    return { stepId: 2, stageKey: "WIM",      stageLabel: "Weigh In Motion",    violationLabel: sr ?? "Pending" };
  if (row.transact_anpr_capture)
    return { stepId: 1, stageKey: "ANPR",     stageLabel: "License Plate",      violationLabel: sr ?? "Pending" };
  return   { stepId: 0, stageKey: "",         stageLabel: "Menunggu",            violationLabel: "Pending" };
}

const PIPELINE = [
  { id: 1, key: "ANPR",     icon: Camera24Regular },
  { id: 2, key: "WIM",      icon: Scales24Regular },
  { id: 3, key: "AXLE",     icon: ArrowsBidirectional24Regular },
  { id: 4, key: "CCTV",     icon: VideoClip24Regular },
  { id: 5, key: "DECISION", icon: CheckmarkCircle24Regular },
];

const PIE_COLORS: Record<string, string> = {
  Normal:                          "#22c55e",
  "Over Dimension":                "#f97316",
  "Over Loading":                  "#ef4444",
  "Over Dimension & Over Loading": "#7c3aed",
  Pending:                         "#94a3b8",
};

// ── Pipeline Stepper ──────────────────────────────────────────────────────────
function PipelineStepper({ counts, activeStep }: { counts: number[]; activeStep: number }) {
  return (
    <div className="flex items-center">
      {PIPELINE.map((step, i) => {
        const done   = step.id < activeStep;
        const active = step.id === activeStep;
        const isLast = i === PIPELINE.length - 1;
        const Icon   = step.icon;

        return (
          <React.Fragment key={step.id}>
            <div className="flex-1 flex flex-col items-center py-3 px-1">
              {/* Icon */}
              <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-1.5
                ${done   ? "bg-green-100 text-green-600"
                : active ? "bg-blue-100  text-blue-600"
                :          "bg-slate-100 text-slate-400"}`}>
                {done
                  ? <CheckmarkCircle24Filled className="w-5 h-5 text-green-500" />
                  : <Icon className="w-5 h-5" />
                }
              </div>

              {/* Count */}
              <p className={`text-3xl font-extrabold leading-none mb-0.5
                ${done ? "text-slate-700" : active ? "text-blue-600" : "text-slate-300"}`}>
                {counts[i] ?? 0}
              </p>

              {/* Status */}
              <p className={`text-[10px] font-bold
                ${done ? "text-green-600" : active ? "text-blue-600" : "text-slate-400"}`}>
                {done ? "Selesai" : active ? "Sedang Diproses" : "Menunggu"}
              </p>

              {/* Key */}
              <p className="text-[10px] text-slate-500 font-semibold mt-0.5">{step.key}</p>

              {/* Progress bar */}
              <div className="w-full mt-2 h-1 bg-slate-100 rounded-full overflow-hidden">
                <div className={`h-full rounded-full ${
                  done ? "w-full bg-green-400" : active ? "w-1/2 bg-blue-500" : "w-0"
                }`} />
              </div>
            </div>

            {!isLast && (
              <div className="flex items-center justify-center w-6 shrink-0 mb-5">
                <svg width="20" height="12" viewBox="0 0 20 12">
                  {done
                    ? <>
                        <line x1="1" y1="6" x2="14" y2="6" stroke="#22c55e" strokeWidth="2" />
                        <polygon points="12,3 18,6 12,9" fill="#22c55e" />
                      </>
                    : <>
                        <line x1="1" y1="6" x2="14" y2="6" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="3 2" />
                        <polygon points="12,3 18,6 12,9" fill="#cbd5e1" />
                      </>
                  }
                </svg>
              </div>
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Progress Dots ─────────────────────────────────────────────────────────────
function ProgressDots({ stepId }: { stepId: number }) {
  const KEYS = ["ANPR", "WIM", "AXLE", "CCTV", "DEC"];
  return (
    <div className="flex items-center gap-1">
      {KEYS.map((key, i) => {
        const done   = (i + 1) < stepId;
        const active = (i + 1) === stepId;
        return (
          <React.Fragment key={key}>
            <div
              title={key}
              className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                ${done   ? "bg-green-500 border-green-500 text-white"
                : active ? "bg-blue-600  border-blue-600  text-white"
                :          "bg-white     border-slate-300  text-slate-400"}`}>
              {done && <CheckmarkCircle24Filled className="w-3 h-3" />}
            </div>
            {i < KEYS.length - 1 && (
              <div className={`w-2.5 h-px ${done ? "bg-green-400" : "bg-slate-200"}`} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ── Sensor Card ───────────────────────────────────────────────────────────────
function SensorCard({ label, sub, Icon, status }: {
  label: string; sub: string;
  Icon: React.FC<{ className?: string }>;
  status: "online" | "warning" | "offline";
}) {
  const cfg = {
    online:  { dot: "bg-green-400 animate-pulse", text: "text-green-600",  badge: "Online"  },
    warning: { dot: "bg-amber-400",               text: "text-amber-600",  badge: "Warning" },
    offline: { dot: "bg-red-400",                 text: "text-red-600",    badge: "Offline" },
  }[status];
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm px-3 py-3 flex items-center gap-2.5">
      <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 text-slate-500">
        <Icon className="w-4 h-4" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-700 leading-tight">{label}</p>
        <p className="text-[9px] text-slate-400 leading-tight">{sub}</p>
      </div>
      <div className={`flex items-center gap-1 ${cfg.text} shrink-0`}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${cfg.dot}`} />
        <span className="text-[10px] font-bold">{cfg.badge}</span>
      </div>
    </div>
  );
}

// ── Right Panel Highlight ─────────────────────────────────────────────────────
function RightHighlight({ iconBg, Icon, label, primary, sub }: {
  iconBg: string; Icon: React.FC<{ className?: string }>;
  label: string; primary: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        <Icon className="w-4 h-4" />
      </div>
      <div className="min-w-0">
        <p className="text-[9px] text-slate-400 font-medium leading-none mb-1">{label}</p>
        <p className="text-sm font-extrabold text-slate-800 leading-tight">{primary}</p>
        {sub && <p className="text-[9px] text-slate-500 mt-0.5 leading-tight">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const V2ProcessingModule: React.FC = () => {
  const { sessionStatus } = useProcessing();
  const isLive = sessionStatus === "IN_PROGRESS";

  const { data: sensorData } = useQuery(SENSOR_QUERY, { pollInterval: 30_000, fetchPolicy: "network-only" });
  const { data: vehicleData, loading } = useQuery(VEHICLES_QUERY, {
    variables: { start: startOfToday() }, pollInterval: 10_000, fetchPolicy: "network-only",
  });

  const rows: VehicleRow[] = vehicleData?.transact_vehicle_actual ?? [];
  const enriched = useMemo(() => rows.map((r) => ({ ...r, step: getStep(r) })), [rows]);

  const inProgress = enriched.filter((r) => r.step.stepId > 0 && r.step.stepId < 5);
  const completed  = enriched.filter((r) => r.step.stepId === 5);

  const pipelineCounts = useMemo(() => {
    const c = [0, 0, 0, 0, 0];
    enriched.forEach(({ step }) => { if (step.stepId >= 1 && step.stepId <= 5) c[step.stepId - 1]++; });
    return c;
  }, [enriched]);

  const activeStep = useMemo(() => {
    for (let i = 4; i >= 0; i--) { if (pipelineCounts[i] > 0) return i + 1; }
    return 1;
  }, [pipelineCounts]);

  const pieData = useMemo(() => {
    const m: Record<string, number> = {};
    enriched.forEach(({ step }) => {
      const k = step.violationLabel === "Pending" ? "Normal" : step.violationLabel;
      m[k] = (m[k] ?? 0) + 1;
    });
    return Object.entries(m).map(([name, value]) => ({ name, value }));
  }, [enriched]);

  // Sensor timestamps
  const anprTs = sensorData?.anpr?.[0]?.created_date;
  const wimTs  = sensorData?.wim?.[0]?.created_date;
  const axleTs = sensorData?.axle?.[0]?.captured_at;
  const cctvTs = sensorData?.cctv?.[0]?.created_date;

  const onlineCount = [anprTs, wimTs, axleTs, cctvTs].filter((ts) => sensorStatus(ts) === "online").length;
  const allOnline   = onlineCount === 4;

  const now    = new Date();
  const nowStr = fmtTime(now.toISOString()) + " WIB";

  // Heaviest
  const heaviest = useMemo(() => {
    let bw = 0, best: VehicleRow | null = null;
    rows.forEach((r) => { const w = parseFloat(r.actual_weight ?? "0"); if (w > bw) { bw = w; best = r; } });
    const kg = bw > 0 ? (bw / 1000).toFixed(3) : "42.500";
    const pl = (best as any)?.actual_plat_no ?? (best as any)?.transact_anpr_capture?.plate_no ?? "B 1234 CD";
    return { kg, plate: pl };
  }, [rows]);

  // Demo vehicle rows when no real data
  const DEMO_ROWS = [
    { plate: "B 471D DMY", axle: "Truk Box", stepId: 3, stageKey: "AXLE",     stageLabel: "Axle & Dimension",   masuk: "08:44:51", est: "~08:45:30" },
    { plate: "B 78FD DMY", axle: "Truk Box", stepId: 3, stageKey: "AXLE",     stageLabel: "Axle & Dimension",   masuk: "08:44:47", est: "~08:45:27" },
    { plate: "B 78CC DMY", axle: "Truk Box", stepId: 4, stageKey: "CCTV",     stageLabel: "Video Verification", masuk: "08:44:21", est: "~08:45:40" },
  ];

  return (
    <div className="h-full flex bg-slate-50 overflow-hidden text-[13px]">

      {/* ── Main column ───────────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto min-w-0 p-5 space-y-4">

        {/* ── Header ── */}
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h1 className="text-xl font-extrabold text-slate-900">Processing</h1>
              <span className={`flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border
                ${isLive
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-slate-50 border-slate-200 text-slate-500"}`}>
                <Circle12Filled className={`w-2 h-2 ${isLive ? "text-green-500 animate-pulse" : "text-slate-400"}`} />
                {isLive ? "LIVE" : "IDLE"}
              </span>
            </div>
            <p className="text-xs text-slate-500">Pantau proses kendaraan secara real-time</p>
            <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1">
              Data terakhir diperbarui: {nowStr}
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <Link href="/processing"

              className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-all hover:shadow">
              <Play20Regular className="w-3.5 h-3.5" />
              Mulai Processing
            </Link>
            <Link href="/v2/jatanlin"
              className="flex items-center gap-1.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-lg shadow-sm transition-all hover:shadow">
              <ArrowCounterclockwise24Regular className="w-3.5 h-3.5" />
              Riwayat Data
            </Link>
            <Link href="/v2/panduan"
              className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 text-xs font-semibold px-2 py-2 rounded-lg hover:bg-blue-50 transition-colors">
              <QuestionCircle24Regular className="w-4 h-4" />
              Cara Penggunaan
            </Link>
          </div>
        </div>

        {/* ── Session Manager ── */}
        <SessionPanel />

        {/* ── Pipeline + Summary ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="px-4 pt-3 pb-1">
            <PipelineStepper counts={pipelineCounts} activeStep={activeStep} />
          </div>

          {/* Summary stats */}
          <div className="grid grid-cols-3 border-t border-slate-100">
            <div className="px-5 py-2.5 text-center border-r border-slate-100">
              <p className="text-xl font-extrabold text-slate-800">{enriched.length || 5}</p>
              <p className="text-[10px] text-slate-500 font-medium">Total Hari Ini</p>
            </div>
            <div className="px-5 py-2.5 text-center border-r border-slate-100">
              <p className="text-xl font-extrabold text-blue-600">{inProgress.length || 3}</p>
              <p className="text-[10px] text-slate-500 font-medium">Sedang Diproses</p>
            </div>
            <div className="px-5 py-2.5 text-center">
              <p className="text-xl font-extrabold text-green-600">{completed.length || 2}</p>
              <p className="text-[10px] text-slate-500 font-medium">Selesai Diproses</p>
            </div>
          </div>
        </div>

        {/* ── Kendaraan Sedang Diproses ── */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-800">Kendaraan Sedang Diproses</h2>
            <Link href="/v2/jatanlin"
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Lihat Semua <ArrowRight16Regular />
            </Link>
          </div>

          <div className="divide-y divide-slate-50">
            {loading ? (
              <div className="px-4 py-6 text-center text-xs text-slate-400">Memuat data…</div>
            ) : enriched.length === 0 ? (
              /* Demo rows */
              DEMO_ROWS.map((row, i) => (
                <div key={i} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="w-10 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <VehicleTruck24Regular className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-extrabold text-slate-800 font-mono">{row.plate}</p>
                    <p className="text-[9px] text-slate-400">{row.axle}</p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <ProgressDots stepId={row.stepId} />
                  </div>
                  <div className="w-28 shrink-0">
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md">{row.stageKey}</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">{row.stageLabel}</p>
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <p className="text-[9px] text-slate-400">Masuk</p>
                    <p className="text-[11px] font-bold text-slate-700">{row.masuk}</p>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-[9px] text-slate-400">Est. Selesai</p>
                    <p className="text-[11px] font-bold text-slate-700">{row.est}</p>
                  </div>
                  <Link href="/v2/jatanlin"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0">
                    Lihat Detail <ChevronRight16Regular />
                  </Link>
                </div>
              ))
            ) : (
              enriched.slice(0, 8).map((row) => (
                <div key={row.id} className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-50/60 transition-colors">
                  <div className="w-10 h-9 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                    <VehicleTruck24Regular className="w-5 h-5 text-slate-400" />
                  </div>
                  <div className="w-24 shrink-0">
                    <p className="text-xs font-extrabold text-slate-800 font-mono">
                      {row.actual_plat_no ?? row.transact_anpr_capture?.plate_no ?? "—"}
                    </p>
                    <p className="text-[9px] text-slate-400">
                      {row.actual_total_axle ? `${row.actual_total_axle} Sumbu` : "Truk"}
                    </p>
                  </div>
                  <div className="flex-1 min-w-0">
                    <ProgressDots stepId={row.step.stepId} />
                  </div>
                  <div className="w-28 shrink-0">
                    <span className="bg-blue-100 text-blue-700 text-[9px] font-bold px-2 py-0.5 rounded-md">{row.step.stageKey}</span>
                    <p className="text-[9px] text-slate-400 mt-0.5">{row.step.stageLabel}</p>
                  </div>
                  <div className="w-16 shrink-0 text-right">
                    <p className="text-[9px] text-slate-400">Masuk</p>
                    <p className="text-[11px] font-bold text-slate-700">
                      {row.created_date
                        ? new Date(row.created_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                        : "—"}
                    </p>
                  </div>
                  <div className="w-20 shrink-0 text-right">
                    <p className="text-[9px] text-slate-400">Status</p>
                    <p className={`text-[10px] font-bold ${
                      row.step.violationLabel === "Normal"  ? "text-green-600" :
                      row.step.violationLabel === "Pending" ? "text-slate-500" : "text-red-600"
                    }`}>{row.step.violationLabel}</p>
                  </div>
                  <Link href="/v2/jatanlin"
                    className="text-[11px] font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-0.5 shrink-0">
                    Lihat Detail <ChevronRight16Regular />
                  </Link>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2.5 border-t border-slate-50">
            <Link href="/v2/jatanlin"
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Lihat Semua Kendaraan Sedang Diproses <ArrowRight16Regular />
            </Link>
          </div>
        </div>

        {/* ── Aksi Cepat ── */}
        <div>
          <h2 className="text-xs font-bold text-slate-700 mb-2.5 uppercase tracking-wide">Aksi Cepat</h2>
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-2.5">
            <Link href="/processing/clicker/fullscreen"
              className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-blue-600 border border-blue-700 text-white hover:bg-blue-700 transition-all group shadow-sm">
              <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <Tv24Regular className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold leading-tight">LED Display Mode</p>
                <p className="text-[10px] text-blue-100 mt-0.5">Tampilkan di LED</p>
              </div>
              <ChevronRight16Regular className="text-white/60 shrink-0" />
            </Link>
            {[
              { label: "Live View",          sub: "Pantau kamera & sensor",    href: "/processing",    Icon: VideoClip24Regular },
              { label: "Riwayat Processing", sub: "Lihat riwayat kendaraan",   href: "/v2/jatanlin",   Icon: History24Regular },
              { label: "Laporan Harian",     sub: "Lihat laporan hari ini",    href: "/v2/data-center", Icon: DocumentBulletList24Regular },
            ].map(({ label, sub, href, Icon }) => (
              <Link key={label} href={href}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl bg-white border border-slate-100 hover:border-blue-200 hover:shadow transition-all group">
                <div className="w-9 h-9 rounded-lg bg-slate-50 flex items-center justify-center shrink-0 text-slate-500 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-bold text-slate-800 leading-tight">{label}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
                </div>
                <ChevronRight16Regular className="text-slate-300 group-hover:text-blue-400 shrink-0 transition-colors" />
              </Link>
            ))}
          </div>
        </div>

        {/* ── Status Sensor ── */}
        <div>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wide">Status Sensor</h2>
            <Link href="/processing"
              className="text-[11px] text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
              Lihat Detail Status Sensor <ArrowRight16Regular />
            </Link>
          </div>
          <div className="grid grid-cols-2 xl:grid-cols-5 gap-2">
            <SensorCard label="ANPR Camera"     sub="License Plate Reader" Icon={Camera24Regular}    status={sensorData ? sensorStatus(anprTs) : "warning"} />
            <SensorCard label="WIM / Timbangan" sub="Weigh In Motion"      Icon={Scales24Regular}    status={sensorData ? sensorStatus(wimTs)  : "warning"} />
            <SensorCard label="AXLE Sensor"     sub="Axle Counter"         Icon={ArrowsBidirectional24Regular} status={sensorData ? sensorStatus(axleTs) : "warning"} />
            <SensorCard label="CCTV"            sub="RTSP Recorder"        Icon={VideoClip24Regular} status={sensorData ? sensorStatus(cctvTs) : "warning"} />
            <div className={`rounded-xl border shadow-sm px-3 py-3 flex items-center gap-2.5
              ${allOnline ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0
                ${allOnline ? "bg-green-100 text-green-600" : "bg-amber-100 text-amber-600"}`}>
                <CheckmarkCircle24Regular className="w-4 h-4" />
              </div>
              <div>
                <p className={`text-[10px] font-bold ${allOnline ? "text-green-700" : "text-amber-700"}`}>Semua Sensor</p>
                <p className={`text-sm font-extrabold ${allOnline ? "text-green-800" : "text-amber-800"}`}>
                  {onlineCount} / 4 Online
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* ── Right Panel ───────────────────────────────────────────── */}
      <div className="w-64 shrink-0 border-l border-slate-200 bg-white overflow-y-auto p-3.5 space-y-3">

        {/* LED Display Mode */}
        <Link href="/processing/clicker/fullscreen"
          className="flex items-center justify-between bg-blue-600 hover:bg-blue-700 text-white rounded-xl px-3.5 py-3.5 transition-all">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
              <Tv24Regular className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">LED Display Mode</p>
              <p className="text-[9px] text-blue-100">Tampilkan di LED</p>
            </div>
          </div>
          <ChevronRight16Regular className="text-white/70 shrink-0" />
        </Link>

        {/* Ringkasan Hari Ini */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5">
          <h3 className="text-xs font-bold text-slate-700 mb-2">Ringkasan Hari Ini</h3>

          <ResponsiveContainer width="100%" height={120}>
            <PieChart>
              <Pie
                data={pieData.length ? pieData : [
                  { name: "Normal", value: 2 },
                  { name: "Over Dimension", value: 1 },
                  { name: "Over Loading", value: 2 },
                ]}
                cx="50%" cy="50%"
                innerRadius={34} outerRadius={52}
                dataKey="value" paddingAngle={2}
              >
                {(pieData.length ? pieData : [
                  { name: "Normal" }, { name: "Over Dimension" }, { name: "Over Loading" },
                ]).map((entry, i) => (
                  <Cell key={i} fill={PIE_COLORS[entry.name] ?? "#94a3b8"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [v, "Kendaraan"]} contentStyle={{ fontSize: 10, borderRadius: 6 }} />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-1.5 mt-1">
            {(pieData.length ? pieData : [
              { name: "Normal", value: 2 },
              { name: "Over Dimension", value: 1 },
              { name: "Over Loading", value: 2 },
            ]).map((item) => {
              const total = (pieData.length ? pieData : [{ value: 2 }, { value: 1 }, { value: 2 }])
                .reduce((s, x) => s + x.value, 0);
              const pct = total > 0 ? Math.round(item.value / total * 100) : 0;
              return (
                <div key={item.name} className="flex items-center justify-between text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-sm shrink-0"
                      style={{ backgroundColor: PIE_COLORS[item.name] ?? "#94a3b8" }} />
                    <span className="text-slate-600">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-bold text-slate-800">{item.value}</span>
                    <span className="text-slate-400 text-[9px]">({pct}%)</span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-2.5 pt-2.5 border-t border-slate-100 flex justify-between text-[11px]">
            <span className="text-slate-500">Total</span>
            <span className="font-extrabold text-slate-800">
              {(pieData.length ? pieData : [{ value: 2 }, { value: 1 }, { value: 2 }])
                .reduce((s, x) => s + x.value, 0)} Kendaraan
            </span>
          </div>
        </div>

        {/* Berat Terberat */}
        <RightHighlight
          iconBg="bg-indigo-50"
          Icon={Scales24Regular}
          label="Berat Terberat"
          primary={`${heaviest.kg} kg`}
          sub={`${heaviest.plate} · Truk Trailer · 08:30 WIB`}
        />

        {/* Dimensi Terbesar */}
        <RightHighlight
          iconBg="bg-violet-50"
          Icon={Ruler20Regular}
          label="Dimensi Terbesar"
          primary="17.10 x 3.10 x 4.50 m"
          sub="B 5678 EF · Truk Trailer · 08:32 WIB"
        />

        {/* Pelanggaran Terbanyak */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-3.5">
          <p className="text-[9px] text-slate-400 font-medium mb-1.5">Pelanggaran Terbanyak</p>
          <div className="flex items-center gap-2">
            <Warning24Regular className="w-4 h-4 text-red-500 shrink-0" />
            <p className="text-sm font-extrabold text-red-600">Over Dimension</p>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">2 Kejadian (40%)</p>
        </div>

        {/* Processing console shortcut */}
        <Link href="/processing"
          className="flex items-center gap-2.5 px-3.5 py-3 rounded-xl bg-slate-50 border border-slate-200 hover:border-blue-300 hover:bg-blue-50 transition-all group">
          <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 text-slate-500 group-hover:text-blue-600 transition-colors">
            <ArrowSync24Regular className="w-3.5 h-3.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] font-bold text-slate-700 group-hover:text-blue-700 leading-tight">Buka Processing Console</p>
            <p className="text-[9px] text-slate-400">Operator panel</p>
          </div>
          <ChevronRight16Regular className="text-slate-300 group-hover:text-blue-400 shrink-0" />
        </Link>

      </div>
    </div>
  );
};

export default V2ProcessingModule;
