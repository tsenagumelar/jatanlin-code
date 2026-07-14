/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useQuery, gql } from "@apollo/client";
import {
  Camera24Regular,
  Scales24Regular,
  VehicleCar24Regular,
  Video24Regular,
  Shield24Regular,
  Circle12Filled,
  ArrowClockwise20Regular,
  Maximize20Regular,
  MoreVertical20Regular,
  CheckmarkCircle20Regular,
  Warning20Regular,
  ArrowRight16Regular,
} from "@fluentui/react-icons";
import { Tooltip } from "@fluentui/react-components";
import { getMinioImageUrl, getImageUrl } from "@/src/utils/image";

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const LATEST_QUERY = gql`
  query LiveViewLatest($today: timestamptz!, $site_id: uuid!) {
    # Latest ANPR capture
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

    # Latest axle capture
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

    # Latest vehicle actual (for WIM data)
    wim: transact_vehicle_actual(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id }, transact_weighing_id: { _is_null: false } }
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

    # Latest vehicle actual with CCTV
    cctv: transact_vehicle_actual(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id }, transact_cctv_id: { _is_null: false } }
      order_by: { created_date: desc }
      limit: 4
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

    # Today stats
    today_total: transact_vehicle_actual_aggregate(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) {
      aggregate { count }
    }
    today_violation: transact_vehicle_status_aggregate(
      where: { result: { _eq: "PELANGGARAN" }, site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) {
      aggregate { count }
    }
    today_done: transact_vehicle_status_aggregate(
      where: { result: { _in: ["SESUAI", "LULUS", "Normal"] }, site_id: { _eq: $site_id }, created_date: { _gte: $today } }
    ) {
      aggregate { count }
    }
    processing: transact_vehicle_actual_aggregate(
      where: { is_deleted: { _eq: false }, site_id: { _eq: $site_id }, transact_vehicle_statuses: { id: { _is_null: true } }, created_date: { _gte: $today } }
    ) {
      aggregate { count }
    }
  }
`;

// ─── Helpers ──────────────────────────────────────────────────────────────────
const startOfToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const fmtTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
};

const fmtKg = (v?: any) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? `${n.toLocaleString("id-ID")} kg` : "—";
};

// Parse axle_detail JSONB — could be array [{axle:1,weight:8200}, ...] or similar
const parseAxleDetail = (detail: any): { label: string; value: string }[] => {
  if (!detail) return [];
  try {
    const arr = typeof detail === "string" ? JSON.parse(detail) : detail;
    if (Array.isArray(arr)) {
      return arr.slice(0, 6).map((item: any, idx: number) => ({
        label: `Sumbu ${item.axle ?? item.axle_number ?? idx + 1}`,
        value: fmtKg(item.weight ?? item.axle_weight ?? item.value),
      }));
    }
    if (typeof arr === "object") {
      return Object.entries(arr).slice(0, 6).map(([k, v]) => ({
        label: `Sumbu ${k}`,
        value: fmtKg(v),
      }));
    }
  } catch {}
  return [];
};

// ─── Status Pill ─────────────────────────────────────────────────────────────
const SensorStatus = ({
  label,
  icon,
  online,
}: {
  label: string;
  icon: React.ReactNode;
  online: boolean;
}) => (
  <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 flex-1 min-w-0">
    <span className="text-slate-400 w-3.5 h-3.5 flex items-center justify-center shrink-0">{icon}</span>
    <div className="min-w-0 flex-1">
      <p className="text-[10px] font-semibold text-slate-600 truncate leading-tight">{label}</p>
      <div className="flex items-center gap-1">
        <Circle12Filled className={`w-1.5 h-1.5 shrink-0 ${online ? "text-green-500" : "text-red-400"}`} />
        <span className={`text-[9px] font-semibold ${online ? "text-green-600" : "text-red-500"}`}>
          {online ? "Online" : "Offline"}
        </span>
      </div>
    </div>
  </div>
);

// ─── Camera Panel ─────────────────────────────────────────────────────────────
const CameraPanel = ({
  title,
  badge = "LIVE",
  badgeColor = "green",
  children,
  overlayContent,
  imgSrc,
  noBg = false,
}: {
  title: string;
  badge?: string;
  badgeColor?: "green" | "blue" | "orange";
  children?: React.ReactNode;
  overlayContent?: React.ReactNode;
  imgSrc?: string | null;
  noBg?: boolean;
}) => {
  const badgeCls =
    badgeColor === "green"
      ? "bg-green-500"
      : badgeColor === "blue"
      ? "bg-blue-500"
      : "bg-orange-500";

  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden border border-slate-700 flex flex-col">
      {/* Panel header */}
      <div className="flex items-center justify-between px-3 py-2 bg-black/30">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 flex items-center justify-center text-white/70">
            <Camera24Regular />
          </div>
          <span className="text-[12px] font-bold text-white">{title}</span>
          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded text-white ${badgeCls} animate-pulse`}>
            {badge}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <button className="text-white/50 hover:text-white/80 transition-colors">
            <Maximize20Regular className="w-4 h-4" />
          </button>
          <button className="text-white/50 hover:text-white/80 transition-colors">
            <MoreVertical20Regular className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Camera feed area */}
      <div className="relative flex-1 min-h-0 aspect-video">
        {imgSrc ? (
          <Image
            src={imgSrc}
            alt={title}
            fill
            className="object-cover"
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
            unoptimized
          />
        ) : (
          <div className={`absolute inset-0 flex items-center justify-center ${noBg ? "" : "bg-slate-800"}`}>
            <div className="text-center">
              <Video24Regular className="w-10 h-10 text-slate-600 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500">Menunggu sinyal…</p>
            </div>
          </div>
        )}

        {/* Overlay data card */}
        {overlayContent && (
          <div className="absolute bottom-3 left-3 bg-black/75 backdrop-blur-sm rounded-lg p-2.5 text-white min-w-[140px]">
            {overlayContent}
          </div>
        )}

        {children}
      </div>
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────
const StatCard = ({
  icon,
  label,
  value,
  sub,
  iconColor = "text-blue-500",
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  iconColor?: string;
}) => (
  <div className="bg-white rounded-lg border border-slate-200 px-3 py-2.5 flex items-center gap-2.5 flex-1">
    <div className={`w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 ${iconColor}`}>
      <span className="w-4 h-4 flex items-center justify-center">{icon}</span>
    </div>
    <div className="min-w-0">
      <p className="text-[10px] text-slate-400 font-medium truncate">{label}</p>
      <p className="text-lg font-extrabold text-slate-800 leading-tight">{value}</p>
      {sub && <p className="text-[10px] text-slate-400">{sub}</p>}
    </div>
  </div>
);

// ─── Main Module ──────────────────────────────────────────────────────────────
export const V2LiveViewModule: React.FC = () => {
  const [now, setNow] = useState(new Date());
  const [cctvTab, setCctvTab] = useState(0);
  const [lastRefresh, setLastRefresh] = useState(new Date());

  // Tick clock every second
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const siteId = process.env.NEXT_PUBLIC_SITE_ID ?? "";

  const { data, loading, refetch } = useQuery(LATEST_QUERY, {
    variables: { today: startOfToday(), site_id: siteId },
    pollInterval: 8_000,
    fetchPolicy: "network-only",
    skip: !siteId,
    onCompleted: () => setLastRefresh(new Date()),
  });

  const handleRefresh = useCallback(() => { refetch(); }, [refetch]);

  // Extract data
  const anpr = data?.anpr?.[0];
  const axle = data?.axle?.[0];
  const wimVehicle = data?.wim?.[0];
  const wim = wimVehicle?.transact_weighing;
  const cctvVehicles = data?.cctv ?? [];

  const totalToday = data?.today_total?.aggregate?.count ?? 0;
  const totalViolation = data?.today_violation?.aggregate?.count ?? 0;
  const totalDone = data?.today_done?.aggregate?.count ?? 0;
  const totalProcessing = data?.processing?.aggregate?.count ?? 0;

  const anprImgUrl =
    anpr?.minio_bucket && anpr?.minio_full_image_object
      ? getMinioImageUrl(anpr.minio_bucket, anpr.minio_full_image_object)
      : null;

  const axleImgUrl =
    axle?.minio_bucket && axle?.minio_image_object
      ? getMinioImageUrl(axle.minio_bucket, axle.minio_image_object)
      : null;

  const wimImgUrl =
    wimVehicle?.transact_anpr_capture?.minio_bucket &&
    wimVehicle?.transact_anpr_capture?.minio_full_image_object
      ? getMinioImageUrl(
          wimVehicle.transact_anpr_capture.minio_bucket,
          wimVehicle.transact_anpr_capture.minio_full_image_object
        )
      : null;

  const cctvVehicle = cctvVehicles[cctvTab] ?? cctvVehicles[0];
  const cctvUrl = cctvVehicle?.transact_cctv?.filepath
    ? getImageUrl(cctvVehicle.transact_cctv.filepath)
    : null;

  const axleDetails = parseAxleDetail(wim?.axle_detail);

  const sensorsOnline = !loading;

  return (
    <div className="flex flex-col h-full bg-slate-100 overflow-y-auto">

      {/* ── Header (compact) ───────────────────────────────────────────────── */}
      <div className="bg-white border-b border-slate-200 px-4 py-2 shrink-0">
        {/* Top row: title + controls */}
        <div className="flex items-center gap-3">
          {/* Title */}
          <div className="flex items-center gap-2 shrink-0">
            <h1 className="text-sm font-extrabold text-slate-800">Live View</h1>
            <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 border border-green-200 px-1.5 py-0.5 rounded-full">
              <Circle12Filled className="w-1.5 h-1.5 animate-pulse" />
              LIVE
            </span>
            <span className="text-[10px] text-slate-400 hidden md:block">
              Terakhir diperbarui: {fmtTime(lastRefresh.toISOString())}
              <Circle12Filled className="w-1.5 h-1.5 text-green-500 inline ml-1" />
            </span>
          </div>

          {/* Sensor status pills — inline, after title */}
          <div className="flex items-center gap-1.5 flex-1 min-w-0 overflow-x-auto">
            <SensorStatus label="ANPR" icon={<Camera24Regular />} online={sensorsOnline && !!anpr} />
            <SensorStatus label="WIM / Timbangan" icon={<Scales24Regular />} online={sensorsOnline && !!wim} />
            <SensorStatus label="AXLE Sensor" icon={<VehicleCar24Regular />} online={sensorsOnline && !!axle} />
            <SensorStatus label="CCTV (Surveillance)" icon={<Video24Regular />} online={sensorsOnline && cctvVehicles.length > 0} />
            <SensorStatus label="Semua Sistem" icon={<Shield24Regular />} online={sensorsOnline} />
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="flex items-center border border-slate-200 rounded-lg overflow-hidden bg-white">
              <button className="p-1.5 bg-blue-50 text-blue-600 border-r border-slate-200">
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current"><rect x="2" y="2" width="7" height="7" rx="1"/><rect x="11" y="2" width="7" height="7" rx="1"/><rect x="2" y="11" width="7" height="7" rx="1"/><rect x="11" y="11" width="7" height="7" rx="1"/></svg>
              </button>
              <button className="p-1.5 text-slate-400 hover:bg-slate-50">
                <svg viewBox="0 0 20 20" className="w-3.5 h-3.5 fill-current"><rect x="2" y="3" width="16" height="3" rx="1"/><rect x="2" y="8.5" width="16" height="3" rx="1"/><rect x="2" y="14" width="16" height="3" rx="1"/></svg>
              </button>
            </div>
            <div className="flex items-center gap-1 border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-[11px] text-slate-500 cursor-default select-none">
              Filter Kamera
              <svg viewBox="0 0 16 16" className="w-3 h-3 fill-current text-slate-400"><path d="M4 6l4 4 4-4"/></svg>
            </div>
            <Tooltip content="Refresh" relationship="label">
              <button onClick={handleRefresh} className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-500 hover:text-blue-600 hover:border-blue-300 transition-colors">
                <ArrowClockwise20Regular className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
              </button>
            </Tooltip>
          </div>
        </div>
      </div>

      {/* ── Camera Grid ────────────────────────────────────────────────────── */}
      <div className="p-3 shrink-0">
        <div className="grid grid-cols-2 gap-3">

          {/* Panel 1: ANPR */}
          <CameraPanel
            title="ANPR (Pengenalan Plat)"
            imgSrc={anprImgUrl}
            overlayContent={
              <div className="space-y-1.5">
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Plat Terbaca</p>
                  <p className="text-lg font-extrabold tracking-widest leading-tight">
                    {anpr?.plate_no ?? "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Waktu</p>
                  <p className="text-[11px] font-semibold">{fmtTime(anpr?.created_date)}</p>
                </div>
                {anpr?.location_code && (
                  <div>
                    <p className="text-[9px] text-white/60 uppercase font-semibold">Arah</p>
                    <p className="text-[11px] font-semibold">{anpr.location_code}</p>
                  </div>
                )}
                {anpr?.confidence && (
                  <div className="pt-1 border-t border-white/20">
                    <p className="text-[9px] text-white/60">Confidence: <span className="text-white font-bold">{Math.round(Number(anpr.confidence))}%</span></p>
                  </div>
                )}
              </div>
            }
          />

          {/* Panel 2: AXLE Sensor */}
          <CameraPanel
            title="AXLE Sensor (Deteksi Sumbu)"
            imgSrc={axleImgUrl}
            overlayContent={
              <div className="space-y-1.5">
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Jumlah Sumbu</p>
                  <p className="text-2xl font-extrabold leading-tight">
                    {axle?.total_axles ?? "—"}
                  </p>
                </div>
                {axleDetails.length > 0 ? (
                  <div>
                    <p className="text-[9px] text-white/60 uppercase font-semibold mb-1">Berat per Sumbu</p>
                    <div className="space-y-0.5">
                      {axleDetails.map((d) => (
                        <div key={d.label} className="flex items-center justify-between gap-4">
                          <span className="text-[10px] text-white/70">{d.label}</span>
                          <span className="text-[10px] font-bold text-white">{d.value}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : axle?.total_wheels ? (
                  <div>
                    <p className="text-[9px] text-white/60">Roda: <span className="text-white font-bold">{axle.total_wheels}</span></p>
                    {axle.length_mm && (
                      <p className="text-[9px] text-white/60">Panjang: <span className="text-white font-bold">{(axle.length_mm / 1000).toFixed(2)} m</span></p>
                    )}
                  </div>
                ) : null}
                {wim?.total_weight && (
                  <div className="pt-1 border-t border-white/20">
                    <p className="text-[9px] text-white/60 uppercase font-semibold">Total Berat</p>
                    <p className="text-base font-extrabold text-green-400 leading-tight">
                      {fmtKg(wim.total_weight)}
                    </p>
                  </div>
                )}
                {/* Speed placeholder */}
                <div className="absolute bottom-3 right-3 text-[10px] text-white/60">
                  <span className="bg-black/50 px-1.5 py-0.5 rounded">
                    ⏱ {axle?.created_date ? fmtTime(axle.created_date) : "—"}
                  </span>
                </div>
              </div>
            }
          />

          {/* Panel 3: WIM */}
          <CameraPanel
            title="WIM / Timbangan (Berat Aktual)"
            imgSrc={wimImgUrl}
            overlayContent={
              <div className="space-y-1.5">
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Berat Aktual</p>
                  <p className="text-2xl font-extrabold text-blue-300 leading-tight">
                    {wim?.total_weight != null
                      ? fmtKg(wim.total_weight)
                      : wimVehicle?.actual_weight != null
                      ? fmtKg(wimVehicle.actual_weight)
                      : "—"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Status</p>
                  <p className="text-[11px] font-semibold">
                    {wim ? "Stabil" : "Menunggu data…"}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-white/60 uppercase font-semibold">Waktu</p>
                  <p className="text-[11px] font-semibold">{fmtTime(wim?.created_date ?? wimVehicle?.created_date)}</p>
                </div>
                {wimVehicle && (
                  <div className="pt-1 border-t border-white/20">
                    <span className="inline-flex items-center gap-1 bg-blue-600/80 text-white text-[10px] font-bold px-2 py-1 rounded-lg">
                      <CheckmarkCircle20Regular className="w-3.5 h-3.5" />
                      Proses Selesai
                    </span>
                  </div>
                )}
              </div>
            }
          />

          {/* Panel 4: CCTV */}
          <CameraPanel
            title="CCTV (Surveillance)"
            imgSrc={cctvUrl}
          >
            {/* CCTV tab switcher overlay at bottom */}
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent pt-6 pb-2 px-2">
              <div className="flex items-center gap-1 overflow-x-auto">
                {cctvVehicles.length > 0 ? (
                  cctvVehicles.map((v: any, i: number) => (
                    <button
                      key={v.id}
                      onClick={() => setCctvTab(i)}
                      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                        cctvTab === i
                          ? "bg-white text-slate-800"
                          : "text-white/70 hover:text-white bg-white/10"
                      }`}
                    >
                      CCTV {i + 1}{v.actual_plat_no ? ` – ${v.actual_plat_no}` : ""}
                    </button>
                  ))
                ) : (
                  ["CCTV 1 - Depan", "CCTV 2 - Belakang", "CCTV 3 - Samping Kiri", "CCTV 4 - Samping Kanan"].map((lbl, i) => (
                    <button
                      key={lbl}
                      onClick={() => setCctvTab(i)}
                      className={`shrink-0 text-[10px] font-semibold px-2 py-1 rounded-md transition-colors whitespace-nowrap ${
                        cctvTab === i
                          ? "bg-white text-slate-800"
                          : "text-white/70 hover:text-white bg-white/10"
                      }`}
                    >
                      {lbl}
                    </button>
                  ))
                )}
                <button className="ml-auto shrink-0 text-white/60 hover:text-white">
                  <ArrowRight16Regular className="w-4 h-4" />
                </button>
              </div>
            </div>
          </CameraPanel>
        </div>
      </div>

      {/* ── Informasi Singkat ───────────────────────────────────────────────── */}
      <div className="shrink-0 px-3 pb-3">
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide mb-1.5">Informasi Singkat</p>
        <div className="flex items-stretch gap-2 flex-wrap sm:flex-nowrap">
          <StatCard
            icon={<VehicleCar24Regular className="w-5 h-5" />}
            label="Total Kendaraan Hari Ini"
            value={totalToday}
            sub={totalToday > 0 ? `+${totalToday} dari kemarin` : "Belum ada data"}
            iconColor="text-blue-500"
          />
          <StatCard
            icon={<ArrowClockwise20Regular className="w-5 h-5" />}
            label="Sedang Diproses"
            value={totalProcessing}
            sub={totalToday > 0 ? `${Math.round((totalProcessing / Math.max(totalToday, 1)) * 100)}% dari total` : "—"}
            iconColor="text-amber-500"
          />
          <StatCard
            icon={<CheckmarkCircle20Regular className="w-5 h-5" />}
            label="Selesai Diproses"
            value={totalDone}
            sub={totalToday > 0 ? `${Math.round((totalDone / Math.max(totalToday, 1)) * 100)}% dari total` : "—"}
            iconColor="text-green-500"
          />
          <StatCard
            icon={<Warning20Regular className="w-5 h-5" />}
            label="Pelanggaran Hari Ini"
            value={totalViolation}
            sub={totalViolation > 0 ? `+${totalViolation} dari kemarin` : "Tidak ada pelanggaran"}
            iconColor="text-red-500"
          />
        </div>
      </div>
    </div>
  );
};

export default V2LiveViewModule;
