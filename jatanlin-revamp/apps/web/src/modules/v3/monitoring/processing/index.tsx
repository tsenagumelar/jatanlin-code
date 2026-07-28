"use client";

import Image from "next/image";
import Link from "next/link";
import {
  ArrowClockwise20Regular,
  Camera24Regular,
  Circle12Filled,
  Play20Regular,
  PlugDisconnected24Regular,
  Scales24Regular,
  ShieldCheckmark24Regular,
  VehicleTruckProfile24Regular,
  Video24Regular,
} from "@fluentui/react-icons";
import { V3DefaultPage } from "../../shared/DefaultPage";
import { useV3Processing } from "./hooks";
import type {
  V3DeviceConnection,
  V3ProcessingMetric,
  V3ProcessingPanelItem,
} from "./types";

const deviceIcons: Record<V3DeviceConnection["key"], React.ReactNode> = {
  anpr: <Camera24Regular />,
  axle: <VehicleTruckProfile24Regular />,
  cctv: <Video24Regular />,
  wim: <Scales24Regular />,
};

const statusStyle: Record<V3DeviceConnection["status"], string> = {
  online: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-700",
  offline: "border-red-200 bg-red-50 text-red-700",
};

const metricStyle: Record<V3ProcessingMetric["status"], string> = {
  normal: "bg-emerald-50 text-emerald-700",
  over: "bg-red-50 text-red-700",
  pending: "bg-slate-100 text-slate-500",
};

const statusLabel: Record<V3DeviceConnection["status"], string> = {
  online: "Online",
  warning: "Peringatan",
  offline: "Offline",
};

const metricStatusLabel: Record<V3ProcessingMetric["status"], string> = {
  normal: "Normal",
  over: "Melebihi",
  pending: "Menunggu",
};

function DeviceCard({ device }: { device: V3DeviceConnection }) {
  const isOnline = device.status === "online";

  return (
    <div className={`rounded-xl border px-3 py-3 ${statusStyle[device.status]}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white/80 text-lg">
            {deviceIcons[device.key]}
          </div>
          <div className="min-w-0">
            <p className="text-base font-extrabold">{device.label}</p>
            <p className="truncate text-sm font-semibold opacity-80">
              {device.description}
            </p>
          </div>
        </div>
        <Circle12Filled
          className={`mt-1 h-3 w-3 shrink-0 ${
            isOnline ? "text-emerald-500" : "text-current"
          } ${isOnline ? "animate-pulse" : ""}`}
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3 text-sm font-bold">
        <span>{statusLabel[device.status]}</span>
        <span>{device.lastSeen}</span>
      </div>
    </div>
  );
}

function DataPanel({
  title,
  subtitle,
  icon,
  media,
  items,
  compact = false,
  isLoading = false,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  media?: React.ReactNode;
  items: V3ProcessingPanelItem[];
  compact?: boolean;
  isLoading?: boolean;
}) {
  return (
    <section
      className={`min-w-0 overflow-hidden rounded-xl border border-slate-200 shadow-sm ${
        isLoading ? "bg-slate-100/90" : "bg-white"
      }`}
    >
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700">
            {icon}
          </div>
          <div className="min-w-0">
            <h2 className="truncate text-lg font-extrabold text-slate-950">
              {title}
            </h2>
          <p className="truncate text-sm font-semibold text-slate-500">
            {subtitle}
          </p>
        </div>
      </div>
        {isLoading && (
          <div className="flex shrink-0 items-center gap-2 rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-700">
            <span className="h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            Menunggu data
          </div>
        )}
      </div>

      <div
        className={`relative grid gap-3 p-4 ${
          compact ? "" : "xl:grid-cols-[1fr_1.1fr]"
        }`}
      >
        {media && <div className={`min-w-0 ${isLoading ? "opacity-45" : ""}`}>{media}</div>}
        <div className={`grid content-start gap-2 ${isLoading ? "opacity-45" : ""}`}>
          {items.map((item) => (
            <div
              key={item.label}
              className="flex items-center justify-between gap-3 rounded-lg bg-slate-50 px-3 py-2"
            >
              <span className="text-sm font-bold text-slate-500">
                {item.label}
              </span>
              <span className="min-w-0 truncate text-right text-sm font-extrabold text-slate-900">
                {item.value}
              </span>
            </div>
          ))}
        </div>
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-200/45 backdrop-blur-[1px]">
            <div className="flex flex-col items-center gap-3 rounded-xl border border-white/70 bg-white/60 px-5 py-4 text-slate-600 shadow-sm">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-slate-300 border-t-blue-700" />
              <span className="text-sm font-extrabold">Menunggu data...</span>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function ImageBox({ src, label }: { src?: string; label: string }) {
  return (
    <div className="relative flex aspect-video min-h-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
      {src ? (
        <Image src={src} alt={label} fill sizes="420px" className="object-cover" />
      ) : (
        <div className="text-center text-slate-400">
          <PlugDisconnected24Regular className="mx-auto h-9 w-9" />
          <p className="mt-2 text-sm font-bold">Menunggu {label}</p>
        </div>
      )}
    </div>
  );
}

function CctvBox({ src }: { src?: string }) {
  return (
    <div className="relative flex aspect-video min-h-40 items-center justify-center overflow-hidden rounded-lg border border-slate-200 bg-slate-950">
      {src ? (
        <video src={src} controls preload="metadata" className="h-full w-full object-cover" />
      ) : (
        <div className="text-center text-slate-400">
          <Video24Regular className="mx-auto h-9 w-9" />
          <p className="mt-2 text-sm font-bold">Menunggu bukti CCTV</p>
        </div>
      )}
    </div>
  );
}

function ResultPanel({
  metrics,
  violation,
  plateNo,
  vehicleId,
  status,
  onReset,
}: {
  metrics: V3ProcessingMetric[];
  violation: string;
  plateNo: string;
  vehicleId: string;
  status: string;
  onReset: () => void;
}) {
  const isViolation = violation !== "Normal" && violation !== "Pending";

  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-lg ${
              isViolation ? "bg-red-50 text-red-700" : "bg-emerald-50 text-emerald-700"
            }`}
          >
            <ShieldCheckmark24Regular />
          </div>
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              Aktual vs Batas Legal
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              Plat {plateNo} · Status {status}
            </p>
          </div>
        </div>

        <div
          className={`rounded-full px-4 py-2 text-sm font-extrabold ${
            isViolation
              ? "bg-red-50 text-red-700"
              : violation === "Pending"
                ? "bg-amber-50 text-amber-700"
                : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {violation}
        </div>
      </div>

      <div className="grid gap-3 p-4 md:grid-cols-4">
        {metrics.map((metric) => (
          <div key={metric.label} className="rounded-lg border border-slate-200 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-bold text-slate-500">{metric.label}</p>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${metricStyle[metric.status]}`}>
                {metricStatusLabel[metric.status]}
              </span>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-xs font-bold uppercase text-slate-400">Aktual</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">
                  {metric.actual}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 p-2">
                <p className="text-xs font-bold uppercase text-slate-400">Batas</p>
                <p className="mt-1 text-base font-extrabold text-slate-950">
                  {metric.limit}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 px-4 py-3">
        {vehicleId && (
          <Link
            href={`/transaction/jatanlin/verify/${vehicleId}`}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 text-sm font-bold text-white hover:bg-blue-800"
          >
            Lanjut Verifikasi
          </Link>
        )}
        <button
          type="button"
          onClick={onReset}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50"
        >
          Reset
        </button>
      </div>
    </section>
  );
}

export function V3ProcessingPage() {
  const processing = useV3Processing();

  return (
    <V3DefaultPage
      title="Pemrosesan"
      breadcrumbs={[{ label: "Monitoring" }, { label: "Pemrosesan" }]}
      description="Pantau koneksi perangkat dan hasil pemrosesan kendaraan terbaru dalam satu layar."
    >
      {processing.error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {processing.error}
        </div>
      )}

      <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-slate-950">
              Koneksi Perangkat
            </h2>
            <p className="text-sm font-semibold text-slate-500">
              {processing.onlineCount}/4 perangkat online · Cek otomatis tiap 10 detik · Data terakhir {processing.lastUpdated}
              {processing.isStarted && !processing.isFinalized
                ? ` · Window tunggu ${processing.timeoutRemaining}s`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={processing.checkConnection}
              disabled={processing.isLoading}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-4 text-sm font-bold text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:bg-slate-100"
            >
              <ArrowClockwise20Regular className={processing.isLoading ? "animate-spin" : ""} />
              Cek Koneksi
            </button>
            <button
              type="button"
              onClick={processing.startProcessing}
              disabled={
                !processing.allConnectionsOnline ||
                processing.isStarted ||
                processing.isStarting ||
                processing.isRequestingLocation ||
                processing.isFinalizing
              }
              title={
                processing.allConnectionsOnline
                  ? undefined
                    : "Semua koneksi perangkat harus hijau sebelum mulai."
              }
              className={`inline-flex h-10 items-center justify-center gap-2 rounded-lg px-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:bg-slate-300 ${
                processing.isStarted
                  ? "bg-emerald-700 hover:bg-emerald-800"
                  : "bg-blue-700 hover:bg-blue-800"
              }`}
            >
              <Play20Regular />
              {processing.isRequestingLocation
                ? "Mendeteksi lokasi..."
                : processing.isStarting
                ? "Memulai..."
                : processing.isFinalizing
                  ? "Finalisasi..."
                : processing.isStarted
                  ? "Berjalan"
                  : "Mulai"}
            </button>
            <button
              type="button"
              role="switch"
              aria-checked={processing.isDemoMode}
              onClick={processing.toggleDemoMode}
              className={`inline-flex h-10 items-center gap-2 rounded-lg border px-3 text-sm font-bold transition ${
                processing.isDemoMode
                  ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                  : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              <span
                className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
                  processing.isDemoMode ? "bg-emerald-600" : "bg-slate-300"
                }`}
              >
                <span
                  className={`h-4 w-4 rounded-full bg-white transition ${
                    processing.isDemoMode ? "translate-x-4" : "translate-x-0"
                  }`}
                />
              </span>
              Demo
            </button>
          </div>
        </div>
        <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-4">
          {processing.devices.map((device) => (
            <DeviceCard key={device.key} device={device} />
          ))}
        </div>
      </section>

      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <div className="grid gap-4">
          <DataPanel
            title="ANPR"
            subtitle="Tangkapan plat nomor"
            icon={<Camera24Regular />}
            media={<ImageBox src={processing.anprImage} label="gambar ANPR" />}
            items={processing.anprItems}
            isLoading={processing.isAnprWaiting}
          />
          <DataPanel
            title="Sumbu"
            subtitle="Deteksi sumbu dan dimensi"
            icon={<VehicleTruckProfile24Regular />}
            media={<ImageBox src={processing.axleImage} label="gambar sumbu" />}
            items={processing.axleItems}
            isLoading={processing.isAxleWaiting}
          />
        </div>

        <div className="grid gap-4">
          <DataPanel
            title="WIM"
            subtitle="Data weight in motion"
            icon={<Scales24Regular />}
            items={processing.wimItems}
            compact
            isLoading={processing.isWimWaiting}
          />
          <DataPanel
            title="CCTV"
            subtitle="Video bukti"
            icon={<Video24Regular />}
            media={<CctvBox src={processing.cctvUrl} />}
            items={processing.cctvItems}
            isLoading={processing.isCctvWaiting}
          />
        </div>
      </div>

      <div className="mt-4">
        <ResultPanel
          metrics={processing.metrics}
          violation={processing.violation}
          plateNo={processing.plateNo}
          vehicleId={processing.vehicleId}
          status={processing.status}
          onReset={processing.resetCurrentProcessing}
        />
      </div>
    </V3DefaultPage>
  );
}
