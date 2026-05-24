"use client";

import React, { useState } from "react";
import {
  Search20Regular,
  Filter20Regular,
  ArrowDownload20Regular,
  Eye20Regular,
  ChevronLeft20Regular,
  ChevronRight20Regular,
  VehicleCar24Regular,
  Warning24Regular,
  Scales24Regular,
  CheckmarkCircle24Regular,
} from "@fluentui/react-icons";
import Link from "next/link";

// ─── Dummy Data ───────────────────────────────────────────────────────────────
const dummy = Array.from({ length: 20 }, (_, i) => ({
  id: `WIM-2025-${String(42 - i).padStart(4, "0")}`,
  plate: ["B 1234 XYZ", "D 8821 AB", "F 4401 CC", "B 9900 ZZ", "G 1122 EF",
          "H 4455 KL", "N 7700 MN", "P 3312 OP", "R 6643 QR", "T 8891 ST"][i % 10],
  date: "20 Mei 2025",
  time: `${String(14 - (i % 8)).padStart(2, "0")}:${String((i * 7) % 60).padStart(2, "0")}`,
  type: (["Over Loading", "Over Dimension", "OD & OL", "Normal"] as const)[i % 4],
  totalWeight: [32.4, 18.2, 35.1, 24.8, 30.0, 29.6, 22.1, 31.3, 27.9, 33.5,
                19.8, 28.4, 26.3, 34.0, 21.7, 25.5, 30.8, 17.6, 29.1, 23.4][i],
  limitWeight: 28,
  axles: [5, 4, 6, 4, 5][i % 5],
  site: "MST-25-00001",
  status: (["Verified", "Pending", "Verified", "Normal"] as const)[i % 4],
  officer: ["Bripka Agus S.", "Briptu Rini W.", "Aipda Hendra M."][i % 3],
}));

const typeStyle: Record<string, { label: string; cls: string }> = {
  "Over Loading":   { label: "Over Loading",   cls: "bg-red-50 text-red-700 border border-red-200" },
  "Over Dimension": { label: "Over Dimension", cls: "bg-orange-50 text-orange-700 border border-orange-200" },
  "OD & OL":        { label: "OD & OL",        cls: "bg-purple-50 text-purple-700 border border-purple-200" },
  "Normal":         { label: "Normal",         cls: "bg-green-50 text-green-700 border border-green-200" },
};

const statusStyle: Record<string, string> = {
  Verified: "bg-blue-50 text-blue-700 border border-blue-200",
  Pending:  "bg-yellow-50 text-yellow-700 border border-yellow-200",
  Normal:   "bg-slate-100 text-slate-500",
};

// ─── Summary Bar ─────────────────────────────────────────────────────────────
const SummaryBar: React.FC = () => (
  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
    {[
      { label: "Total",         value: 20, icon: <VehicleCar24Regular />,       color: "text-blue-600 bg-blue-50"   },
      { label: "Over Loading",  value: 5,  icon: <Scales24Regular />,             color: "text-red-600 bg-red-50"     },
      { label: "Over Dimension",value: 5,  icon: <Warning24Regular />,           color: "text-orange-600 bg-orange-50"},
      { label: "Normal",        value: 5,  icon: <CheckmarkCircle24Regular />,   color: "text-green-600 bg-green-50" },
    ].map((s) => (
      <div key={s.label} className={`flex items-center gap-3 rounded-lg px-4 py-3 ${s.color}`}>
        <div className="w-5 h-5 shrink-0">{s.icon}</div>
        <div>
          <div className="text-lg font-bold leading-none">{s.value}</div>
          <div className="text-xs opacity-70">{s.label}</div>
        </div>
      </div>
    ))}
  </div>
);

// ─── Main ─────────────────────────────────────────────────────────────────────
export const V2TransactionsModule: React.FC = () => {
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("Semua");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const filtered = dummy.filter((r) => {
    const matchSearch =
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.plate.toLowerCase().includes(search.toLowerCase());
    const matchType = filterType === "Semua" || r.type === filterType;
    return matchSearch && matchType;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Data Jatanlin</h1>
          <p className="text-sm text-slate-400 mt-0.5">Rekap seluruh transaksi WIM</p>
        </div>
        <button className="flex items-center gap-2 border border-slate-200 text-slate-600 text-sm
                           font-medium px-3.5 py-2 rounded-lg hover:bg-slate-50 transition-colors">
          <ArrowDownload20Regular />
          Export
        </button>
      </div>

      <SummaryBar />

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-slate-100 flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search20Regular className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Cari session ID, plat..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                         bg-slate-50 text-slate-700 placeholder-slate-400"
            />
          </div>

          {/* Type filter */}
          <div className="flex items-center gap-1 flex-wrap">
            {["Semua", "Over Loading", "Over Dimension", "OD & OL", "Normal"].map((t) => (
              <button
                key={t}
                onClick={() => { setFilterType(t); setPage(1); }}
                className={`text-xs font-medium px-3 py-1.5 rounded-full border transition-all
                  ${filterType === t
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600"
                  }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 border-b border-slate-100">
                {["Session ID", "Plat", "Tanggal & Waktu", "Jenis Pelanggaran", "Berat (ton)", "Sumbu", "Status", "Aksi"].map((h) => (
                  <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wider px-5 py-3 whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-12 text-slate-400 text-sm">
                    Tidak ada data ditemukan
                  </td>
                </tr>
              ) : paginated.map((row, i) => (
                <tr key={i} className="border-b border-slate-50 hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500 whitespace-nowrap">{row.id}</td>
                  <td className="px-5 py-3.5 font-bold text-slate-700 whitespace-nowrap">{row.plate}</td>
                  <td className="px-5 py-3.5 text-slate-500 text-xs whitespace-nowrap">
                    <div>{row.date}</div>
                    <div className="text-slate-400">{row.time}</div>
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap ${typeStyle[row.type].cls}`}>
                      {typeStyle[row.type].label}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 tabular-nums">
                    <span className={row.totalWeight > row.limitWeight ? "font-bold text-red-600" : "text-slate-600"}>
                      {row.totalWeight}
                    </span>
                    <span className="text-slate-300 mx-1">/</span>
                    <span className="text-slate-400 text-xs">{row.limitWeight}</span>
                  </td>
                  <td className="px-5 py-3.5 text-center text-slate-600">{row.axles}</td>
                  <td className="px-5 py-3.5">
                    <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusStyle[row.status]}`}>
                      {row.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <Link
                      href={`/jatanlin/${i + 1}`}
                      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-800 text-xs font-medium
                                 border border-blue-200 hover:border-blue-400 px-2.5 py-1 rounded-md transition-all"
                    >
                      <Eye20Regular className="w-3.5 h-3.5" /> Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
          <span className="text-xs text-slate-400">
            Menampilkan {Math.min((page - 1) * pageSize + 1, filtered.length)}–{Math.min(page * pageSize, filtered.length)} dari {filtered.length} data
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200
                         text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft20Regular />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 text-xs font-semibold rounded-md border transition-colors
                  ${p === page
                    ? "bg-blue-600 text-white border-blue-600"
                    : "border-slate-200 text-slate-500 hover:bg-white"
                  }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="w-8 h-8 flex items-center justify-center rounded-md border border-slate-200
                         text-slate-500 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight20Regular />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default V2TransactionsModule;
