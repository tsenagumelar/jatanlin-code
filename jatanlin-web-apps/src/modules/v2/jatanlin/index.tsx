"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search24Regular,
  Filter24Regular,
  ArrowRight16Regular,
  Clock24Regular,
  VehicleCar24Regular,
  Scales24Regular,
  Dismiss24Regular,
  ArrowLeft24Regular,
  ArrowRight24Regular,
  Camera24Regular,
} from "@fluentui/react-icons";
import { useGetVehicleActualsQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import { checkOdolViolation, getOdolTolerances } from "@/src/utils/odol";
import { getMinioImageUrl } from "@/src/utils/image";

type ViolationFilter = "all" | "over-loading" | "over-dimension" | "both" | "normal" | "pending";

const VIOLATION_LABELS: Record<string, string> = {
  "Over Loading": "Over Loading",
  "Over Dimension": "Over Dimension",
  "Over Dimension & Over Loading": "OD & OL",
  Normal: "Normal",
  Pending: "Pending",
};

const typeStyle: Record<string, string> = {
  "Over Loading": "bg-red-50 text-red-700 border border-red-200",
  "Over Dimension": "bg-orange-50 text-orange-700 border border-orange-200",
  "Over Dimension & Over Loading": "bg-purple-50 text-purple-700 border border-purple-200",
  Normal: "bg-green-50 text-green-700 border border-green-200",
  Pending: "bg-yellow-50 text-yellow-700 border border-yellow-100",
};

const filterTabs: { key: ViolationFilter; label: string }[] = [
  { key: "all", label: "Semua" },
  { key: "over-loading", label: "Over Loading" },
  { key: "over-dimension", label: "Over Dimension" },
  { key: "both", label: "OD & OL" },
  { key: "normal", label: "Normal" },
  { key: "pending", label: "Pending" },
];

const PAGE_SIZE = 10;

export const V2JatanlinModule: React.FC = () => {
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<ViolationFilter>("all");
  const [page, setPage] = useState(0);
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [showDateFilter, setShowDateFilter] = useState(false);

  const where = useMemo(() => {
    const conds: object[] = [{ is_deleted: { _eq: false } }];
    if (search.trim()) {
      conds.push({
        _or: [
          { actual_plat_no: { _ilike: `%${search.trim()}%` } },
          { transact_anpr_capture: { plate_no: { _ilike: `%${search.trim()}%` } } },
        ],
      });
    }
    if (dateFrom) conds.push({ created_date: { _gte: new Date(dateFrom).toISOString() } });
    if (dateTo) conds.push({ created_date: { _lte: new Date(dateTo + "T23:59:59").toISOString() } });
    return conds.length > 1 ? { _and: conds } : conds[0];
  }, [search, dateFrom, dateTo]);

  const { data, loading } = useGetVehicleActualsQuery({
    variables: { limit: 200, offset: 0, where },
    pollInterval: 30_000,
    fetchPolicy: "network-only",
  });

  const { data: classData } = useGetVehicleClassesQuery({ variables: { limit: 100, offset: 0 } });
  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
  });

  const rows = useMemo(() => {
    const classes = classData?.master_vehicle_class ?? [];
    const tolerances = getOdolTolerances(configData?.master_config);

    return (data?.transact_vehicle_actual ?? []).map((row) => {
      const dbResult = row.transact_vehicle_statuses?.[0]?.result;
      if (dbResult) return { ...row, violationType: dbResult as string };

      const axleCount = row.actual_total_axle ?? 0;
      const w = row.actual_weight;
      const l = row.actual_length;
      const wi = row.actual_width;
      const h = row.actual_height;

      if (!axleCount || w == null || l == null || wi == null || h == null)
        return { ...row, violationType: "Pending" };

      const vehicleClass =
        classes.find((c) => c.total_axle === axleCount) ??
        [...classes].sort(
          (a, b) => Math.abs(a.total_axle - axleCount) - Math.abs(b.total_axle - axleCount),
        )[0] ??
        null;

      if (!vehicleClass) return { ...row, violationType: "Pending" };

      const c2 = parseFloat(String(vehicleClass.class_2_weight ?? "0"));
      const c3 = parseFloat(String(vehicleClass.class_3_weight ?? "0"));

      const result = checkOdolViolation(
        { total_weight: parseFloat(w) / 1000, length: parseFloat(l), width: parseFloat(wi), height: parseFloat(h) },
        { ...vehicleClass, class_2_weight: (c2 / 1000).toString(), class_3_weight: (c3 / 1000).toString() },
        { axleCount, toleranceWeightPercent: tolerances.weightPercent, toleranceDimPercent: tolerances.dimPercent },
      );

      return { ...row, violationType: result as string };
    });
  }, [data, classData, configData]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return rows;
    return rows.filter((r) => {
      const t = r.violationType;
      if (activeFilter === "over-loading") return t === "Over Loading";
      if (activeFilter === "over-dimension") return t === "Over Dimension";
      if (activeFilter === "both") return t === "Over Dimension & Over Loading";
      if (activeFilter === "normal") return t === "Normal";
      if (activeFilter === "pending") return t === "Pending";
      return true;
    });
  }, [rows, activeFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const counts = useMemo(() => {
    const c = { ol: 0, od: 0, both: 0, normal: 0, pending: 0 };
    rows.forEach((r) => {
      if (r.violationType === "Over Loading") c.ol++;
      else if (r.violationType === "Over Dimension") c.od++;
      else if (r.violationType === "Over Dimension & Over Loading") c.both++;
      else if (r.violationType === "Normal") c.normal++;
      else c.pending++;
    });
    return c;
  }, [rows]);

  return (
    <div className="p-6 space-y-4 h-full overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Jatanlin</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            {loading ? "Memuat…" : `${rows.length} total kendaraan tercapture`}
          </p>
        </div>
      </div>

      {/* Summary chips */}
      <div className="flex items-center gap-2 flex-wrap">
        {[
          { label: `${counts.ol + counts.both} Over Loading`, style: "bg-red-50 text-red-700 border border-red-200" },
          { label: `${counts.od + counts.both} Over Dimension`, style: "bg-orange-50 text-orange-700 border border-orange-200" },
          { label: `${counts.normal} Normal`, style: "bg-green-50 text-green-700 border border-green-200" },
          { label: `${counts.pending} Pending Verifikasi`, style: "bg-yellow-50 text-yellow-700 border border-yellow-100" },
        ].map((chip) => (
          <span key={chip.label} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${chip.style}`}>
            {chip.label}
          </span>
        ))}
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48 max-w-sm">
          <Search24Regular className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari plat nomor…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(0); }}
            className="w-full pl-9 pr-8 py-2 text-sm rounded-lg border border-slate-200
                       bg-white text-slate-700 placeholder-slate-400
                       focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
          />
          {search && (
            <button
              onClick={() => { setSearch(""); setPage(0); }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <Dismiss24Regular className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => setShowDateFilter(!showDateFilter)}
          className={`flex items-center gap-2 px-3 py-2 text-sm rounded-lg border transition-colors
            ${showDateFilter || dateFrom || dateTo
              ? "bg-blue-50 border-blue-300 text-blue-700"
              : "bg-white border-slate-200 text-slate-600 hover:bg-slate-50"}`}
        >
          <Filter24Regular className="w-4 h-4" />
          Tanggal
        </button>

        {showDateFilter && (
          <>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => { setDateFrom(e.target.value); setPage(0); }}
              className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <span className="text-slate-400 text-sm">—</span>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => { setDateTo(e.target.value); setPage(0); }}
              className="text-sm px-3 py-2 rounded-lg border border-slate-200 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            {(dateFrom || dateTo) && (
              <button
                onClick={() => { setDateFrom(""); setDateTo(""); setPage(0); }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                Reset
              </button>
            )}
          </>
        )}
      </div>

      {/* Violation filter tabs */}
      <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1 w-fit">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveFilter(tab.key); setPage(0); }}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all
              ${activeFilter === tab.key ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-slate-400">Memuat data…</div>
        ) : paged.length === 0 ? (
          <div className="p-12 text-center">
            <VehicleCar24Regular className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-sm text-slate-400">Tidak ada data ditemukan</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/60">
                  <th className="text-left text-xs font-semibold text-slate-400 px-5 py-3 w-16">Foto</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Plat</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Waktu</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Sumbu</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Berat</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">P×L×T (m)</th>
                  <th className="text-left text-xs font-semibold text-slate-400 px-3 py-3">Pelanggaran</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {paged.map((row, i) => {
                  const anpr = row.transact_anpr_capture;
                  const axle = row.transact_axle_capture;
                  const plate = row.actual_plat_no ?? anpr?.plate_no ?? "—";
                  const weight =
                    row.actual_weight != null
                      ? `${(parseFloat(row.actual_weight) / 1000).toFixed(2)} ton`
                      : "—";
                  const axleCount = row.actual_total_axle ?? axle?.total_axles ?? "—";
                  const len =
                    row.actual_length ?? (axle?.length_mm != null ? axle.length_mm / 1000 : null);
                  const wid = row.actual_width;
                  const ht = row.actual_height;
                  const dim =
                    len != null && wid != null && ht != null
                      ? `${parseFloat(String(len)).toFixed(1)}×${parseFloat(String(wid)).toFixed(1)}×${parseFloat(String(ht)).toFixed(1)}`
                      : "—";
                  const time = row.created_date
                    ? new Date(row.created_date).toLocaleString("id-ID", {
                        day: "2-digit",
                        month: "2-digit",
                        year: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : "—";
                  const hasPhoto = anpr?.minio_bucket && anpr?.minio_full_image_object;
                  const violationType = row.violationType;

                  return (
                    <tr key={row.id ?? i} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors">
                      <td className="px-5 py-3">
                        <div className="w-12 h-10 rounded-md overflow-hidden bg-slate-100 border border-slate-200 flex items-center justify-center shrink-0">
                          {hasPhoto ? (
                            <div className="relative w-full h-full">
                              <Image
                                src={getMinioImageUrl(anpr!.minio_bucket!, anpr!.minio_full_image_object!)}
                                alt="ANPR"
                                fill
                                className="object-cover"
                              />
                            </div>
                          ) : (
                            <Camera24Regular className="w-5 h-5 text-slate-300" />
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-3 font-mono font-semibold text-slate-800 text-xs">{plate}</td>
                      <td className="px-3 py-3 text-slate-400 text-xs">
                        <span className="flex items-center gap-1">
                          <Clock24Regular className="w-3 h-3" /> {time}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs text-slate-600">
                        <span className="flex items-center gap-1">
                          <Scales24Regular className="w-3 h-3 text-slate-400" />
                          {axleCount}
                        </span>
                      </td>
                      <td className="px-3 py-3 text-xs font-semibold text-slate-700">{weight}</td>
                      <td className="px-3 py-3 text-xs text-slate-500 font-mono">{dim}</td>
                      <td className="px-3 py-3">
                        <span
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${typeStyle[violationType] ?? typeStyle["Pending"]}`}
                        >
                          {VIOLATION_LABELS[violationType] ?? violationType}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <Link
                          href={`/v2/jatanlin/${row.id}`}
                          className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-0.5 whitespace-nowrap"
                        >
                          Detail <ArrowRight16Regular className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-slate-100 flex items-center justify-between bg-slate-50/40">
            <span className="text-xs text-slate-400">
              {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} dari {filtered.length}
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0}
                className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowLeft24Regular className="w-4 h-4" />
              </button>
              <span className="text-xs text-slate-500 font-medium">
                {page + 1} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                disabled={page >= totalPages - 1}
                className="p-1 rounded text-slate-400 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ArrowRight24Regular className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default V2JatanlinModule;
