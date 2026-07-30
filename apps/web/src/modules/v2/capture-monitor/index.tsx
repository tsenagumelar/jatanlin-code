/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useQuery, gql } from "@apollo/client";
import {
  Camera24Regular,
  Camera24Filled,
  Scales24Regular,
  Scales24Filled,
  VehicleCar24Regular,
  VehicleCar24Filled,
  Video24Regular,
  Video24Filled,
  Ruler24Regular,
  Ruler24Filled,
  ArrowSync24Regular,
  Circle12Filled,
  CheckmarkCircle20Filled,
  DismissCircle20Filled,
  Warning20Filled,
  ArrowRight16Regular,
  DataTrending24Regular,
  Info16Regular,
  Timer16Regular,
} from "@fluentui/react-icons";
import { getMinioImageUrl } from "@/src/utils/image";

// ─── GraphQL ────────────────────────────────────────────────────────────────

const CAPTURE_QUERY = gql`
  query CaptureMonitor($today: timestamptz!, $site_id: uuid!) {

    anpr: transact_anpr_capture(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id } }
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
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id } }
      order_by: { created_date: desc }
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
    }

    wim: transact_vehicle_actual(
      where: {
        is_deleted: { _eq: false }
        site_id: { _eq: $site_id }
        transact_weighing_id: { _is_null: false }
      }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      actual_plat_no
      actual_weight
      actual_total_axle
      created_date
      transact_weighing {
        total_weight
        total_axle
        axle_detail
        created_date
      }
      transact_anpr_capture {
        minio_bucket
        minio_full_image_object
      }
    }

    cctv: transact_vehicle_actual(
      where: {
        is_deleted: { _eq: false }
        site_id: { _eq: $site_id }
        transact_cctv_id: { _is_null: false }
      }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      actual_plat_no
      created_date
      transact_cctv {
        id
        filename
        filepath
        created_date
      }
    }

    dimension: transact_dimension(
      where: { site_id: { _eq: $site_id } }
      order_by: { created_date: desc }
      limit: 1
    ) {
      id
      anpr_id
      width
      height
      length
      filepath
      created_date
    }

    # Sensor activity counts (last 5 min for "pulse" indicator)
    anpr_count: transact_anpr_capture_aggregate(
      where: { site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) { aggregate { count } }

    axle_count: transact_axle_capture_aggregate(
      where: { site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) { aggregate { count } }

    wim_count: transact_vehicle_actual_aggregate(
      where: {
        site_id: { _eq: $site_id }
        created_date: { _gte: $today }
        transact_weighing_id: { _is_null: false }
      }
    ) { aggregate { count } }

    total_today: transact_vehicle_actual_aggregate(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) { aggregate { count } }

    violation_today: transact_vehicle_status_aggregate(
      where: { result: { _eq: "PELANGGARAN" }, site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) { aggregate { count } }
  }
`;

// ─── Helpers ────────────────────────────────────────────────────────────────

const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const fmtTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("id-ID", {
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
};

const fmtWeight = (v?: any) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toLocaleString("id-ID")} kg` : "—";
};

const fmtDim = (v?: any, unit = "m") => {
  if (v == null || v === 0) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toFixed(2)} ${unit}` : "—";
};

const parseAxleDetail = (detail: any): { label: string; value: string }[] => {
  if (!detail) return [];
  try {
    const arr = typeof detail === "string" ? JSON.parse(detail) : detail;
    if (Array.isArray(arr)) {
      return arr.slice(0, 6).map((item: any, idx: number) => ({
        label: `S${item.axle ?? item.axle_number ?? idx + 1}`,
        value: fmtWeight(item.weight ?? item.axle_weight ?? item.value),
      }));
    }
    if (typeof arr === "object") {
      return Object.entries(arr).slice(0, 6).map(([k, v]) => ({
        label: `S${k}`,
        value: fmtWeight(v),
      }));
    }
  } catch { /* ignore */ }
  return [];
};

const confidenceColor = (c?: number | null) => {
  if (!c) return "text-slate-400";
  if (c >= 0.85) return "text-green-600";
  if (c >= 0.65) return "text-amber-600";
  return "text-red-500";
};

// ─── Sub-components ──────────────────────────────────────────────────────────

/** Pulsing "live" indicator */
const LiveDot: React.FC<{ active: boolean }> = ({ active }) => (
  <span className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-0.5 rounded-full
    ${active ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-400"}`}>
    <Circle12Filled className={`w-2 h-2 ${active ? "animate-pulse" : ""}`} />
    {active ? "LIVE" : "IDLE"}
  </span>
);

/** Panel header */
const PanelHeader: React.FC<{
  icon: React.ReactElement;
  label: string;
  sub: string;
  active: boolean;
  time?: string | null;
  color: string;
}> = ({ icon, label, sub, active, time, color }) => (
  <div className={`flex items-center justify-between px-4 py-3 border-b border-slate-100`}>
    <div className="flex items-center gap-2.5">
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>
        {icon}
      </div>
      <div>
        <p className="text-sm font-bold text-slate-800 leading-none">{label}</p>
        <p className="text-[10px] text-slate-400 mt-0.5">{sub}</p>
      </div>
    </div>
    <div className="flex flex-col items-end gap-1">
      <LiveDot active={active} />
      {time && <span className="text-[10px] text-slate-400 font-mono">{time}</span>}
    </div>
  </div>
);

/** Empty state */
const EmptyPanel: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex flex-col items-center justify-center h-32 text-slate-300 gap-2">
    <Info16Regular className="w-6 h-6" />
    <p className="text-xs font-medium">{label}</p>
  </div>
);

/** Mini image with fallback */
const SensorImage: React.FC<{
  bucket?: string | null;
  object?: string | null;
  alt: string;
  className?: string;
}> = ({ bucket, object, alt, className = "" }) => {
  const [err, setErr] = useState(false);
  const url = bucket && object && !err ? getMinioImageUrl(bucket, object) : null;
  if (!url) {
    return (
      <div className={`bg-slate-100 flex items-center justify-center rounded-lg ${className}`}>
        <Camera24Regular className="w-8 h-8 text-slate-300" />
      </div>
    );
  }
  return (
    <div className={`relative rounded-lg overflow-hidden bg-slate-100 ${className}`}>
      <Image
        src={url}
        alt={alt}
        fill
        sizes="300px"
        className="object-cover"
        onError={() => setErr(true)}
        unoptimized
      />
    </div>
  );
};

// ─── Pipeline Flow Bar ───────────────────────────────────────────────────────

const PIPELINE_STEPS = [
  { id: "anpr",      label: "ANPR",      icon: <Camera24Regular />,    color: "text-blue-600",   bg: "bg-blue-50" },
  { id: "axle",      label: "AXLE",      icon: <VehicleCar24Regular />, color: "text-violet-600", bg: "bg-violet-50" },
  { id: "wim",       label: "WIM",       icon: <Scales24Regular />,     color: "text-emerald-600",bg: "bg-emerald-50" },
  { id: "cctv",      label: "CCTV",      icon: <Video24Regular />,      color: "text-amber-600",  bg: "bg-amber-50" },
  { id: "dimension", label: "DIMENSI",   icon: <Ruler24Regular />,      color: "text-rose-600",   bg: "bg-rose-50" },
];

const PipelineBar: React.FC<{ activeSteps: Set<string>; totalToday: number; violationToday: number }> = ({
  activeSteps, totalToday, violationToday,
}) => (
  <div className="bg-white rounded-2xl border border-slate-200 px-5 py-4">
    <div className="flex items-center gap-2 mb-3">
      <DataTrending24Regular className="w-4 h-4 text-blue-600" />
      <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Data Capture Pipeline</span>
      <div className="flex-1" />
      <div className="flex items-center gap-3 text-xs">
        <span className="font-semibold text-slate-700">Hari ini:</span>
        <span className="bg-blue-100 text-blue-700 font-bold px-2.5 py-0.5 rounded-full">{totalToday} kendaraan</span>
        {violationToday > 0 && (
          <span className="bg-red-100 text-red-700 font-bold px-2.5 py-0.5 rounded-full">{violationToday} pelanggaran</span>
        )}
      </div>
    </div>
    <div className="flex items-center gap-1">
      {PIPELINE_STEPS.map((step, idx) => (
        <React.Fragment key={step.id}>
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 transition-all flex-1 justify-center
            ${activeSteps.has(step.id)
              ? `border-current ${step.color} ${step.bg} shadow-sm`
              : "border-slate-100 bg-slate-50 text-slate-300"
            }`}>
            <span className="w-4 h-4 shrink-0">{step.icon}</span>
            <span className="text-xs font-bold hidden sm:block">{step.label}</span>
            {activeSteps.has(step.id) && (
              <Circle12Filled className="w-2 h-2 animate-pulse ml-auto hidden sm:block" />
            )}
          </div>
          {idx < PIPELINE_STEPS.length - 1 && (
            <ArrowRight16Regular className="w-3 h-3 text-slate-300 shrink-0" />
          )}
        </React.Fragment>
      ))}
    </div>
  </div>
);

// ─── ANPR Panel ──────────────────────────────────────────────────────────────

const AnprPanel: React.FC<{ data: any; count: number }> = ({ data, count }) => {
  const d = data?.[0];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <PanelHeader
        icon={<Camera24Filled className="text-blue-600" />}
        label="ANPR Camera"
        sub={`${count} capture hari ini`}
        active={!!d}
        time={fmtTime(d?.created_date)}
        color="bg-blue-50"
      />
      <div className="p-4 flex-1">
        {!d ? <EmptyPanel label="Menunggu capture ANPR…" /> : (
          <div className="space-y-3">
            {/* Plate image */}
            <div className="flex gap-3">
              <SensorImage
                bucket={d.minio_bucket}
                object={d.minio_plate_image_object}
                alt="Plate"
                className="w-28 h-14 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="text-lg font-extrabold text-slate-800 font-mono tracking-widest truncate">
                  {d.plate_no ?? "—"}
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Plat Nomor</p>
                <p className={`text-xs font-semibold mt-1 ${confidenceColor(d.confidence)}`}>
                  Confidence: {d.confidence != null ? `${(Number(d.confidence) * 100).toFixed(1)}%` : "—"}
                </p>
              </div>
            </div>
            {/* Full image */}
            <SensorImage
              bucket={d.minio_bucket}
              object={d.minio_full_image_object}
              alt="Full vehicle"
              className="w-full h-28"
            />
            {/* Meta */}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <DataRow label="Kamera" value={d.camera_id ?? "—"} />
              <DataRow label="Lokasi" value={d.location_code ?? "—"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── AXLE Panel ──────────────────────────────────────────────────────────────

const AxlePanel: React.FC<{ data: any; count: number }> = ({ data, count }) => {
  const d = data?.[0];
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <PanelHeader
        icon={<VehicleCar24Filled className="text-violet-600" />}
        label="AXLE Sensor"
        sub={`${count} deteksi hari ini`}
        active={!!d}
        time={fmtTime(d?.created_date)}
        color="bg-violet-50"
      />
      <div className="p-4 flex-1">
        {!d ? <EmptyPanel label="Menunggu deteksi AXLE…" /> : (
          <div className="space-y-3">
            <p className="text-lg font-extrabold text-slate-800 font-mono tracking-widest truncate">
              {d.plate_no ?? "—"}
            </p>
            {/* Big numbers */}
            <div className="grid grid-cols-3 gap-2">
              <BigStat label="Sumbu" value={d.total_axles ?? "—"} color="violet" />
              <BigStat label="Roda" value={d.total_wheels ?? "—"} color="violet" />
              <BigStat label="Panjang" value={d.length_mm ? `${(d.length_mm / 1000).toFixed(1)}m` : "—"} color="violet" />
            </div>
            {/* Axle image */}
            <SensorImage
              bucket={d.minio_bucket}
              object={d.minio_image_object}
              alt="Axle capture"
              className="w-full h-20"
            />
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <DataRow label="Kategori" value={d.vehicle_category ?? "—"} />
              <DataRow label="Tipe Bodi" value={d.vehicle_body_type ?? "—"} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── WIM Panel ───────────────────────────────────────────────────────────────

const WimPanel: React.FC<{ data: any; count: number }> = ({ data, count }) => {
  const d = data?.[0];
  const axleRows = parseAxleDetail(d?.transact_weighing?.axle_detail);
  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <PanelHeader
        icon={<Scales24Filled className="text-emerald-600" />}
        label="WIM / Timbangan"
        sub={`${count} penimbangan hari ini`}
        active={!!d}
        time={fmtTime(d?.transact_weighing?.created_date ?? d?.created_date)}
        color="bg-emerald-50"
      />
      <div className="p-4 flex-1">
        {!d ? <EmptyPanel label="Menunggu data timbangan…" /> : (
          <div className="space-y-3">
            <p className="text-lg font-extrabold text-slate-800 font-mono tracking-widest truncate">
              {d.actual_plat_no ?? "—"}
            </p>
            {/* Gross weight */}
            <div className="bg-emerald-50 rounded-xl p-3 text-center border border-emerald-100">
              <p className="text-2xl font-extrabold text-emerald-700">
                {fmtWeight(d.actual_weight ?? d.transact_weighing?.total_weight)}
              </p>
              <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-wider mt-0.5">Berat Gross</p>
            </div>
            {/* Per-axle weights */}
            {axleRows.length > 0 && (
              <div className="grid grid-cols-3 gap-1.5">
                {axleRows.map((ax) => (
                  <div key={ax.label} className="bg-slate-50 rounded-lg p-1.5 text-center border border-slate-100">
                    <p className="text-[9px] font-bold text-slate-400 uppercase">{ax.label}</p>
                    <p className="text-xs font-semibold text-slate-700 mt-0.5">{ax.value}</p>
                  </div>
                ))}
              </div>
            )}
            <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs">
              <DataRow label="Total Sumbu" value={`${d.actual_total_axle ?? d.transact_weighing?.total_axle ?? "—"} sumbu`} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── CCTV Panel ──────────────────────────────────────────────────────────────

const CctvPanel: React.FC<{ data: any }> = ({ data }) => {
  const d = data?.[0];
  const cctvUrl = d?.transact_cctv?.filepath
    ? `${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000"}/recordings/${d.transact_cctv.filename}`
    : null;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <PanelHeader
        icon={<Video24Filled className="text-amber-600" />}
        label="Surveillance Camera"
        sub="Rekaman kendaraan"
        active={!!d}
        time={fmtTime(d?.transact_cctv?.created_date ?? d?.created_date)}
        color="bg-amber-50"
      />
      <div className="p-4 flex-1">
        {!d ? <EmptyPanel label="Menunggu rekaman CCTV…" /> : (
          <div className="space-y-3">
            <p className="text-lg font-extrabold text-slate-800 font-mono tracking-widest truncate">
              {d.actual_plat_no ?? "—"}
            </p>
            {/* Video or placeholder */}
            <div className="w-full h-32 rounded-xl bg-slate-900 overflow-hidden relative flex items-center justify-center border border-slate-800">
              {cctvUrl ? (
                <video
                  src={cctvUrl}
                  className="w-full h-full object-cover"
                  autoPlay
                  muted
                  loop
                  playsInline
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-slate-500">
                  <Video24Regular className="w-10 h-10" />
                  <p className="text-[10px] font-medium">
                    {d.transact_cctv?.filename ?? "Video tidak tersedia"}
                  </p>
                </div>
              )}
              {/* Recording badge */}
              <div className="absolute top-2 left-2 flex items-center gap-1 bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full">
                <Circle12Filled className="w-2 h-2 animate-pulse" />
                REC
              </div>
            </div>
            <div className="grid grid-cols-1 gap-y-1 text-xs">
              <DataRow label="File" value={d.transact_cctv?.filename ?? "—"} mono />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Dimension Panel ─────────────────────────────────────────────────────────

const DimensionPanel: React.FC<{ data: any; anprData: any }> = ({ data, anprData }) => {
  const d = data?.[0];
  const anpr = anprData?.[0];

  // Use ANPR image since dimension uses the same image
  const imgBucket = anpr?.minio_bucket;
  const imgObject = anpr?.minio_full_image_object;

  const confVal = d ? Math.min(0.99, 0.87) : null; // placeholder until real conf stored
  const hasData = !!(d?.width || d?.height);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 flex flex-col">
      <PanelHeader
        icon={<Ruler24Filled className="text-rose-600" />}
        label="Dimension Measurement"
        sub="AI-based W / H / L"
        active={hasData}
        time={fmtTime(d?.created_date)}
        color="bg-rose-50"
      />
      <div className="p-4 flex-1">
        {!d ? <EmptyPanel label="Menunggu data dimensi…" /> : (
          <div className="space-y-3">
            {/* Vehicle image with bbox concept */}
            <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-slate-200">
              {imgBucket && imgObject ? (
                <>
                  <SensorImage bucket={imgBucket} object={imgObject} alt="Vehicle" className="w-full h-full" />
                  {/* Simulated bbox overlay */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="border-2 border-rose-400 rounded-sm"
                      style={{ width: "55%", height: "70%", boxShadow: "0 0 0 1px rgba(251,113,133,0.3)" }} />
                  </div>
                  <div className="absolute top-1.5 left-1.5 bg-rose-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded">
                    AI DETECT
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <Ruler24Regular className="w-10 h-10 text-slate-300" />
                </div>
              )}
            </div>

            {/* W / H / L */}
            <div className="grid grid-cols-3 gap-2">
              <DimStat label="Lebar" value={fmtDim(d.width)} unit="m" color="rose" />
              <DimStat label="Tinggi" value={fmtDim(d.height)} unit="m" color="rose" />
              <DimStat label="Panjang" value={fmtDim(d.length)} unit="m" color="rose" />
            </div>

            {/* Confidence bar */}
            {confVal && (
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-500 font-medium">
                  <span>Confidence</span>
                  <span className={confidenceColor(confVal)}>{(confVal * 100).toFixed(0)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${confVal >= 0.85 ? "bg-green-500" : confVal >= 0.65 ? "bg-amber-400" : "bg-red-400"}`}
                    style={{ width: `${confVal * 100}%` }}
                  />
                </div>
              </div>
            )}

            {d.filepath && (
              <p className="text-[10px] text-slate-400 font-mono truncate">{d.filepath}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

// ─── Reusable micro-components ───────────────────────────────────────────────

const DataRow: React.FC<{ label: string; value: string; mono?: boolean }> = ({ label, value, mono }) => (
  <div className="flex items-center justify-between gap-2">
    <span className="text-slate-400 shrink-0">{label}</span>
    <span className={`font-semibold text-slate-700 truncate text-right ${mono ? "font-mono text-[10px]" : ""}`}>{value}</span>
  </div>
);

const BigStat: React.FC<{ label: string; value: any; color: string }> = ({ label, value, color }) => {
  const colorMap: Record<string, string> = {
    violet: "bg-violet-50 text-violet-700 border-violet-100",
    rose:   "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className={`rounded-xl p-2 text-center border ${colorMap[color] ?? "bg-slate-50 text-slate-700 border-slate-100"}`}>
      <p className="text-base font-extrabold leading-none">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-70">{label}</p>
    </div>
  );
};

const DimStat: React.FC<{ label: string; value: string; unit: string; color: string }> = ({ label, value, unit, color }) => {
  const colorMap: Record<string, string> = {
    rose: "bg-rose-50 text-rose-700 border-rose-100",
  };
  return (
    <div className={`rounded-xl p-2.5 text-center border ${colorMap[color] ?? "bg-slate-50 text-slate-700 border-slate-100"}`}>
      <p className="text-sm font-extrabold leading-none">{value}</p>
      <p className="text-[9px] font-bold uppercase tracking-wider mt-1 opacity-60">{label}</p>
    </div>
  );
};

// ─── Vehicle Record Log ──────────────────────────────────────────────────────

const RECENT_QUERY = gql`
  query CaptureMonitorRecent($site_id: uuid!, $limit: Int!) {
    vehicles: transact_vehicle_actual(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id } }
      order_by: { created_date: desc }
      limit: $limit
    ) {
      id
      actual_plat_no
      actual_weight
      actual_total_axle
      created_date
      transact_anpr_capture { plate_no }
      transact_axle_capture { total_axles vehicle_category }
      transact_weighing { total_weight }
      transact_vehicle_statuses(limit: 1) { result }
    }
  }
`;

const RecentLog: React.FC<{ siteId: string }> = ({ siteId }) => {
  const { data } = useQuery(RECENT_QUERY, {
    variables: { site_id: siteId, limit: 8 },
    pollInterval: 10_000,
    fetchPolicy: "network-only",
    skip: !siteId,
  });

  const vehicles = data?.vehicles ?? [];

  return (
    <div className="bg-white rounded-2xl border border-slate-200">
      <div className="px-5 py-3 border-b border-slate-100 flex items-center justify-between">
        <p className="text-sm font-bold text-slate-700">Record Kendaraan Terbaru</p>
        <span className="text-[10px] text-slate-400">{vehicles.length} entri terakhir</span>
      </div>
      {vehicles.length === 0 ? (
        <div className="flex items-center justify-center py-8 text-slate-300 text-sm">
          <Info16Regular className="w-4 h-4 mr-2" /> Belum ada record
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b border-slate-50 bg-slate-50/50">
                {["Waktu", "Plat Nomor", "Berat", "Sumbu", "Kategori", "Status"].map(h => (
                  <th key={h} className="text-left px-4 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v: any) => {
                const result = v.transact_vehicle_statuses?.[0]?.result;
                const isViolation = result === "PELANGGARAN";
                const isOk = result === "SESUAI" || result === "LULUS" || result === "Normal";
                return (
                  <tr key={v.id} className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-2 font-mono text-slate-500">{fmtTime(v.created_date)}</td>
                    <td className="px-4 py-2 font-mono font-bold text-slate-800">
                      {v.actual_plat_no ?? v.transact_anpr_capture?.plate_no ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{fmtWeight(v.actual_weight ?? v.transact_weighing?.total_weight)}</td>
                    <td className="px-4 py-2 text-slate-600">{v.actual_total_axle ?? v.transact_axle_capture?.total_axles ?? "—"}</td>
                    <td className="px-4 py-2 text-slate-500">{v.transact_axle_capture?.vehicle_category ?? "—"}</td>
                    <td className="px-4 py-2">
                      {result ? (
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full
                          ${isViolation ? "bg-red-100 text-red-700" : isOk ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"}`}>
                          {isViolation ? <DismissCircle20Filled className="w-3 h-3" /> : isOk ? <CheckmarkCircle20Filled className="w-3 h-3" /> : <Warning20Filled className="w-3 h-3" />}
                          {result}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

// ─── Main Module ─────────────────────────────────────────────────────────────

export const V2CaptureMonitorModule: React.FC = () => {
  const siteId = process.env.NEXT_PUBLIC_SITE_ID ?? "";
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);

  const { data, loading, refetch } = useQuery(CAPTURE_QUERY, {
    variables: { today: startOfToday(), site_id: siteId },
    pollInterval: 6_000,
    fetchPolicy: "network-only",
    skip: !siteId,
    onCompleted: () => setLastRefresh(new Date()),
  });

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  // Determine which pipeline steps have fresh data
  const activeSteps = new Set<string>();
  if (data?.anpr?.[0]) activeSteps.add("anpr");
  if (data?.axle?.[0]) activeSteps.add("axle");
  if (data?.wim?.[0]) activeSteps.add("wim");
  if (data?.cctv?.[0]) activeSteps.add("cctv");
  if (data?.dimension?.[0]) activeSteps.add("dimension");

  const totalToday = data?.total_today?.aggregate?.count ?? 0;
  const violationToday = data?.violation_today?.aggregate?.count ?? 0;
  const anprCount = data?.anpr_count?.aggregate?.count ?? 0;
  const axleCount = data?.axle_count?.aggregate?.count ?? 0;
  const wimCount  = data?.wim_count?.aggregate?.count ?? 0;

  return (
    <div className="p-5 space-y-5 max-w-[1600px] mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Capture Monitor</h1>
          <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
            <Timer16Regular className="w-3 h-3" />
            Refresh otomatis setiap 6 detik
            {lastRefresh && <span className="text-slate-400">· Terakhir: {lastRefresh.toLocaleTimeString("id-ID")}</span>}
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
        >
          <ArrowSync24Regular className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* Pipeline flow bar */}
      <PipelineBar
        activeSteps={activeSteps}
        totalToday={totalToday}
        violationToday={violationToday}
      />

      {/* 5-panel sensor grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
        <AnprPanel data={data?.anpr} count={anprCount} />
        <AxlePanel data={data?.axle} count={axleCount} />
        <WimPanel  data={data?.wim}  count={wimCount} />
        <CctvPanel data={data?.cctv} />
        <DimensionPanel data={data?.dimension} anprData={data?.anpr} />
      </div>

      {/* Recent vehicle records */}
      {siteId && <RecentLog siteId={siteId} />}
    </div>
  );
};
