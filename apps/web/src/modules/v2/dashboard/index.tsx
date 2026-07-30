"use client";

import React, { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  ArrowDownload20Regular,
  ArrowUp20Regular, ArrowDown20Regular,
  ArrowRight16Regular,
  Warning24Regular, CheckmarkCircle24Regular,
  VehicleCar24Regular, VehicleTruck24Regular,
  Scales24Regular, Ruler20Regular,
  People24Regular,
} from "@fluentui/react-icons";
import { useGetVehicleActualsQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import {
  checkOdolViolation,
  getOdolTolerances,
  VehicleActual,
  VehicleClassLimit,
} from "@/src/utils/odol";

const TOP_OFFICERS = [
  { rank: 1, name: "Bripka Agus Setiawan",   count: 11, pct: 39.3 },
  { rank: 2, name: "Briptu Rini Wahyuni",    count: 7,  pct: 25.0 },
  { rank: 3, name: "Bripda Dwi Pranoto",     count: 5,  pct: 17.9 },
  { rank: 4, name: "Bripka Andi Kurniawan",  count: 3,  pct: 10.7 },
  { rank: 5, name: "Briptu Fajar Nugroho",   count: 2,  pct: 7.1  },
];

function pct(value: number, total: number) {
  return total > 0 ? Number(((value / total) * 100).toFixed(1)) : 0;
}

function formatShortDate(date: Date) {
  return date.toLocaleDateString("id-ID", { day: "2-digit", month: "short" });
}

function formatShortDateTime(dateString?: string | null) {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status?: string | null) {
  if (status === "verified") return "Selesai";
  if (status === "rejected") return "Ditolak";
  return "Diproses";
}

// ── Stat Card ─────────────────────────────────────────────────────────────────
function StatCard({
  icon, iconBg, label, value, trend, trendLabel,
}: {
  icon: React.ReactNode; iconBg: string;
  label: string; value: string | number;
  trend?: number; trendLabel?: string;
}) {
  const isUp = (trend ?? 0) >= 0;
  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-start gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-3xl font-extrabold text-slate-900 leading-none">{value}</p>
        {trend !== undefined && (
          <div className={`flex items-center gap-1 mt-2 text-xs font-semibold ${isUp ? "text-green-600" : "text-red-500"}`}>
            {isUp
              ? <ArrowUp20Regular className="w-3 h-3" />
              : <ArrowDown20Regular className="w-3 h-3" />}
            {Math.abs(trend)}% {trendLabel}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Highlight Strip Card ──────────────────────────────────────────────────────
function HighlightCard({
  iconBg, icon, label, primary, sub,
}: {
  iconBg: string; icon: React.ReactNode;
  label: string; primary: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
        <p className="text-sm font-extrabold text-slate-800 leading-tight">{primary}</p>
        {sub && <p className="text-[10px] text-slate-500 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────
export const V2DashboardModule: React.FC = () => {
  const { data: vehicleData } = useGetVehicleActualsQuery({
    variables: { limit: 500, offset: 0 },
    fetchPolicy: "network-only",
    pollInterval: 60_000,
  });
  const { data: vehicleClassesData } = useGetVehicleClassesQuery({
    variables: { limit: 100, offset: 0 },
    fetchPolicy: "cache-and-network",
  });
  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
    fetchPolicy: "cache-and-network",
  });

  const dashboard = useMemo(() => {
    const vehicles = vehicleData?.transact_vehicle_actual ?? [];
    const vehicleClasses = vehicleClassesData?.master_vehicle_class ?? [];
    const tolerances = getOdolTolerances(configData?.master_config);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    const todayStart = new Date(today);
    todayStart.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    const trendMap = new Map<string, { date: string; value: number }>();
    for (let i = 0; i < 7; i++) {
      const d = new Date(startDate);
      d.setDate(startDate.getDate() + i);
      trendMap.set(d.toISOString().split("T")[0], {
        date: formatShortDate(d),
        value: 0,
      });
    }

    const stats = {
      totalVehicles: 0,
      totalViolations: 0,
      todayViolations: 0,
      normal: 0,
      overweight: 0,
      overdimension: 0,
    };
    const locations = new Map<string, number>();
    const violations: Array<{
      id: string;
      no: number;
      time: string;
      plate: string;
      location: string;
      type: string;
      pasal: string;
      officer: string;
      status: string;
    }> = [];
    let heaviest = { weight: 0, plate: "-" };
    let largest = { volume: 0, dimensions: "-", plate: "-" };

    vehicles.forEach((vehicle) => {
      const createdDate = vehicle.created_date ? new Date(vehicle.created_date) : null;
      if (!createdDate || createdDate < startDate || createdDate > endDate) return;

      const axleCount = vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || 0;
      const vehicleClass = vehicleClasses.find((vc) => vc.total_axle === axleCount);
      const latestStatus = vehicle.transact_vehicle_statuses?.[0];
      const verificationStatus = latestStatus?.status || "pending";
      const actualWeight = Number(vehicle.actual_weight || 0);
      const actualLength = Number(vehicle.actual_length || vehicle.transact_dimension?.length || 0);
      const actualWidth = Number(vehicle.actual_width || vehicle.transact_dimension?.width || 0);
      const actualHeight = Number(vehicle.actual_height || vehicle.transact_dimension?.height || 0);
      const plate = vehicle.actual_plat_no || vehicle.transact_anpr_capture?.plate_no || "-";

      const actual: VehicleActual = {
        total_weight: actualWeight / 1000,
        length: actualLength,
        width: actualWidth,
        height: actualHeight,
      };

      let violationType = "Normal";
      if (vehicleClass) {
        const class2Weight = Number(vehicleClass.class_2_weight || 0);
        const class3Weight = Number(vehicleClass.class_3_weight || 0);
        const limit: VehicleClassLimit = {
          ...vehicleClass,
          class_2_weight: class2Weight / 1000,
          class_3_weight: class3Weight / 1000,
        };
        violationType = checkOdolViolation(actual, limit, {
          axleCount,
          toleranceWeightPercent: tolerances.weightPercent,
          toleranceDimPercent: tolerances.dimPercent,
        });
      }

      const verifiedResult = verificationStatus === "verified" ? latestStatus?.result : null;
      const effectiveViolationType =
        verificationStatus === "rejected" ? "Normal" : verifiedResult || violationType;

      stats.totalVehicles++;
      if (effectiveViolationType === "Normal") {
        stats.normal++;
      } else {
        stats.totalViolations++;
        if (createdDate >= todayStart) stats.todayViolations++;
        if (effectiveViolationType.includes("Loading")) stats.overweight++;
        if (effectiveViolationType.includes("Dimension")) stats.overdimension++;

        const dateKey = createdDate.toISOString().split("T")[0];
        const trend = trendMap.get(dateKey);
        if (trend) trend.value++;

        const location = vehicle.location_address || vehicle.transact_anpr_capture?.location_code || "-";
        locations.set(location, (locations.get(location) ?? 0) + 1);
        violations.push({
          id: String(vehicle.id),
          no: 0,
          time: formatShortDateTime(vehicle.created_date),
          plate,
          location,
          type: effectiveViolationType,
          pasal: effectiveViolationType.includes("Dimension") ? "Pasal 277" : "Pasal 278",
          officer: "-",
          status: statusLabel(verificationStatus),
        });
      }

      if (actualWeight > heaviest.weight) {
        heaviest = { weight: actualWeight, plate };
      }
      const volume = actualLength * actualWidth * actualHeight;
      if (volume > largest.volume) {
        largest = {
          volume,
          dimensions: `${actualLength || 0} x ${actualWidth || 0} x ${actualHeight || 0} m`,
          plate,
        };
      }
    });

    const locationData = Array.from(locations.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value, pct: pct(value, stats.totalViolations) }));

    const violationTypeData = [
      {
        name: "Pasal 277",
        label: "Kelebihan Dimensi",
        value: stats.overdimension,
        pct: pct(stats.overdimension, stats.totalViolations),
        color: "#ef4444",
      },
      {
        name: "Pasal 278",
        label: "Kelebihan Muatan",
        value: stats.overweight,
        pct: pct(stats.overweight, stats.totalViolations),
        color: "#f97316",
      },
      {
        name: "Normal",
        label: "Tidak Melanggar",
        value: stats.normal,
        pct: pct(stats.normal, stats.totalVehicles),
        color: "#22c55e",
      },
    ];

    return {
      stats,
      trendData: Array.from(trendMap.values()),
      locationData,
      violationTypeData,
      recentViolations: violations.slice(0, 5).map((row, index) => ({ ...row, no: index + 1 })),
      heaviest,
      largest,
    };
  }, [vehicleData, vehicleClassesData, configData]);

  const now = new Date();
  const dateStr = now.toLocaleDateString("id-ID", {
    weekday: "long", day: "numeric", month: "long", year: "numeric",
  });
  const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }) + " WIB";

  return (
    <div className="relative flex flex-col h-full bg-slate-50 overflow-auto">

      {/* Korlantas watermark */}
      <div className="pointer-events-none fixed top-0 right-0 w-96 h-96 opacity-[0.04] select-none z-0" aria-hidden>
        <Image src="/polantas.png" alt="" fill className="object-contain object-right-top" />
      </div>

      <div className="relative z-10 p-6 space-y-5">

        {/* ── Header ── */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Dashboard Unit</h1>
            <p className="text-sm text-slate-500 font-medium">JTL001 - Jakarta</p>
            <p className="text-xs text-slate-400 mt-0.5">{dateStr} · {timeStr}</p>
          </div>
          <button className="flex items-center gap-2 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 text-sm font-semibold px-4 py-2.5 rounded-xl shadow-sm transition hover:shadow">
            <ArrowDownload20Regular className="w-4 h-4" />
            Export Laporan
          </button>
        </div>

        {/* ── Stat Cards ── */}
        <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
          <StatCard
            iconBg="bg-red-50"
            icon={<Warning24Regular className="w-5 h-5 text-red-600" />}
            label="Total Penindakan" value={dashboard.stats.totalViolations} trendLabel="7 hari terakhir"
          />
          <StatCard
            iconBg="bg-amber-50"
            icon={<Warning24Regular className="w-5 h-5 text-amber-500" />}
            label="Pelanggaran Hari Ini" value={dashboard.stats.todayViolations} trendLabel="hari ini"
          />
          <StatCard
            iconBg="bg-green-50"
            icon={<CheckmarkCircle24Regular className="w-5 h-5 text-green-600" />}
            label="Kendaraan Normal" value={dashboard.stats.normal} trendLabel="7 hari terakhir"
          />
          <StatCard
            iconBg="bg-blue-50"
            icon={<VehicleTruck24Regular className="w-5 h-5 text-blue-600" />}
            label="Total Kendaraan" value={dashboard.stats.totalVehicles} trendLabel="7 hari terakhir"
          />
        </div>

        {/* ── Charts Row ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Trend Line Chart */}
          <div className="col-span-12 xl:col-span-5 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">Trend Penindakan 7 Hari Terakhir</h2>
            <ResponsiveContainer width="100%" height={190}>
              <LineChart data={dashboard.trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                />
                <YAxis
                  tick={{ fontSize: 10, fill: "#94a3b8" }}
                  axisLine={false} tickLine={false}
                />
                <Tooltip
                  contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  cursor={{ stroke: "#f1f5f9" }}
                />
                <Line
                  type="monotone" dataKey="value" stroke="#ef4444" strokeWidth={2.5}
                  dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
                  activeDot={{ r: 6, strokeWidth: 0 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Penindakan per Lokasi */}
          <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-800">Penindakan per Lokasi</h2>
              <span className="text-[10px] font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2.5 py-1 rounded-lg">
                7 Hari Terakhir
              </span>
            </div>
            <div className="space-y-3.5">
              {(dashboard.locationData.length > 0 ? dashboard.locationData : [{ name: "Belum ada data", value: 0, pct: 0 }]).map((loc) => (
                <div key={loc.name}>
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-slate-700 font-medium truncate flex-1 mr-3">{loc.name}</span>
                    <span className="shrink-0 font-bold text-slate-800">
                      {loc.value}{" "}
                      <span className="text-slate-400 font-normal">({loc.pct}%)</span>
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${loc.pct}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top 5 Petugas */}
          <div className="col-span-12 xl:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <h2 className="text-sm font-bold text-slate-800 mb-4">5 Petugas Penindak Terbanyak</h2>
            <div className="space-y-3.5">
              {TOP_OFFICERS.map((o) => (
                <div key={o.rank} className="flex items-center gap-2.5">
                  <span className="w-5 text-xs font-bold text-slate-400 shrink-0 text-right">{o.rank}.</span>
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center shrink-0">
                    <People24Regular className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-slate-700 truncate leading-tight">{o.name}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-bold text-slate-800">{o.count}</p>
                    <p className="text-[9px] text-slate-400">({o.pct}%)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Highlight Strip ── */}
        <div className="grid grid-cols-2 xl:grid-cols-5 gap-3">
          <HighlightCard
            iconBg="bg-indigo-50"
            icon={<Scales24Regular className="w-5 h-5 text-indigo-600" />}
            label="Berat Terberat"
            primary={`${dashboard.heaviest.weight.toLocaleString("id-ID")} kg`}
            sub={dashboard.heaviest.plate}
          />
          <HighlightCard
            iconBg="bg-violet-50"
            icon={<Ruler20Regular className="w-5 h-5 text-violet-600" />}
            label="Dimensi Terbesar" primary={dashboard.largest.dimensions} sub={dashboard.largest.plate}
          />
          <HighlightCard
            iconBg="bg-orange-50"
            icon={<Warning24Regular className="w-5 h-5 text-orange-600" />}
            label="Pelanggaran Terbanyak"
            primary={dashboard.stats.overdimension >= dashboard.stats.overweight ? "Pasal 277" : "Pasal 278"}
            sub={dashboard.stats.overdimension >= dashboard.stats.overweight ? "Kelebihan Dimensi" : "Kelebihan Muatan"}
          />
          <HighlightCard
            iconBg="bg-teal-50"
            icon={<VehicleTruck24Regular className="w-5 h-5 text-teal-600" />}
            label="Over Loading" primary={`${dashboard.stats.overweight} kasus`} sub="7 hari terakhir"
          />
          <HighlightCard
            iconBg="bg-green-50"
            icon={<VehicleCar24Regular className="w-5 h-5 text-green-600" />}
            label="Kendaraan Normal" primary={`${dashboard.stats.normal} kendaraan`} sub="7 hari terakhir"
          />
        </div>

        {/* ── Bottom Row ── */}
        <div className="grid grid-cols-12 gap-4">

          {/* Pelanggaran Terbaru */}
          <div className="col-span-12 xl:col-span-8 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="text-sm font-bold text-slate-800">Pelanggaran Terbaru</h2>
              <Link href="/v2/jatanlin"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
                Lihat Semua Penindakan <ArrowRight16Regular />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["No", "Waktu", "Plat Nomor", "Lokasi", "Pelanggaran", "Pasal", "Petugas", "Status", "Aksi"].map((h) => (
                      <th key={h} className="px-4 py-3 text-left text-[10px] font-bold text-slate-500 uppercase tracking-wide whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {dashboard.recentViolations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 text-slate-400 font-medium">{row.no}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{row.time}</td>
                      <td className="px-4 py-3 font-extrabold text-slate-800 font-mono tracking-wide">{row.plate}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.location}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap
                          ${row.type === "Over Dimension"
                            ? "bg-orange-50 text-orange-700"
                            : "bg-red-50 text-red-700"
                          }`}>
                          {row.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.pasal}</td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{row.officer}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full font-semibold text-[10px] whitespace-nowrap
                          ${row.status === "Diproses"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                          }`}>
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1.5">
                          {/* Eye */}
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path d="M10 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z" />
                              <path fillRule="evenodd" d="M.664 10.59a1.651 1.651 0 010-1.186A10.004 10.004 0 0110 3c4.257 0 7.893 2.66 9.336 6.41.147.381.146.804 0 1.186A10.004 10.004 0 0110 17c-4.257 0-7.893-2.66-9.336-6.41z" clipRule="evenodd" />
                            </svg>
                          </button>
                          {/* Doc */}
                          <button className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400 hover:text-slate-600">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3.5 h-3.5">
                              <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {dashboard.recentViolations.length === 0 && (
                    <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-slate-400">
                        Belum ada pelanggaran dalam 7 hari terakhir.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            <div className="px-5 py-3 border-t border-slate-50 flex items-center justify-between">
              <p className="text-xs text-slate-400">
                Menampilkan {dashboard.recentViolations.length} dari {dashboard.stats.totalViolations} penindakan
              </p>
              <Link href="/v2/jatanlin"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
                Lihat Semua <ArrowRight16Regular />
              </Link>
            </div>
          </div>

          {/* Jenis Pelanggaran */}
          <div className="col-span-12 xl:col-span-4 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-800">Jenis Pelanggaran</h2>
              <Link href="/v2/data-center"
                className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1 font-semibold">
                Lihat Detail <ArrowRight16Regular />
              </Link>
            </div>
            <ResponsiveContainer width="100%" height={160}>
              <PieChart>
                <Pie
                  data={dashboard.violationTypeData}
                  cx="50%" cy="50%"
                  innerRadius={46} outerRadius={68}
                  dataKey="value"
                  paddingAngle={2}
                >
                  {dashboard.violationTypeData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(v) => [v, "Kendaraan"]}
                  contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2.5 mt-1">
              {dashboard.violationTypeData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: item.color }} />
                    <div className="min-w-0">
                      <span className="font-semibold text-slate-700">{item.name}</span>
                      {item.label && (
                        <span className="text-slate-400 ml-1 text-[10px]">{item.label}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-2">
                    <span className="font-bold text-slate-800">{item.value}</span>
                    <span className="text-slate-400">({item.pct}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default V2DashboardModule;
