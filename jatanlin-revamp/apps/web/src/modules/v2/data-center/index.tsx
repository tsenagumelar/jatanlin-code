"use client";

import React, { useState, useMemo } from "react";
import dynamic from "next/dynamic";
import { gql, useQuery } from "@apollo/client";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from "recharts";
import {
  Map24Regular,
  History24Regular,
  People24Regular,
  DataBarVertical24Regular,
  VehicleCar24Regular,
  Warning24Regular,
  Scales24Regular,
  CheckmarkCircle24Regular,
  Location24Regular,
  ArrowTrending16Regular,
  ArrowTrendingDown16Regular,
  Search20Regular,
  Filter20Regular,
  ArrowDownload20Regular,
  MoreHorizontal20Regular,
  ArrowRight12Regular,
  Maximize20Regular,
  Circle12Filled,
  ChevronLeft20Regular,
  ChevronRight20Regular,
} from "@fluentui/react-icons";
import type { UnitSite, EnforcementPoint } from "./UnitMap";

// ─── Dynamic map ─────────────────────────────────────────────────────────────
const UnitMap = dynamic(() => import("./UnitMap"), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-slate-100">
      <div className="text-center">
        <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
        <p className="text-xs text-slate-500">Memuat peta…</p>
      </div>
    </div>
  ),
});

// ─── GraphQL ─────────────────────────────────────────────────────────────────
const GET_ANALYTICS = gql`
  query DataCenterAnalytics($start: timestamptz!) {
    total: transact_vehicle_actual_aggregate(
      where: { is_deleted: { _eq: false }, created_date: { _gte: $start } }
    ) { aggregate { count } }
    violations: transact_vehicle_actual_aggregate(
      where: {
        is_deleted: { _eq: false }
        created_date: { _gte: $start }
        transact_vehicle_statuses: { result: { _in: ["OL","OD","OLOD"] } }
      }
    ) { aggregate { count } }
  }
`;
const GET_OPERATORS = gql`
  query DataCenterOperators {
    master_user(where: { is_deleted: { _eq: false }, is_active: { _eq: true } } order_by: { full_name: asc }) {
      id full_name badge_no email is_active
      master_role { role_name code }
    }
  }
`;

// ─── Static unit data matching screenshot ────────────────────────────────────
type UnitRow = {
  id: string; code: string; isCurrent?: boolean;
  city: string; province: string; address: string; region: string;
  lat: number; lng: number;
  status: "active" | "warning" | "offline";
  totalToday: number; totalTrend: number;
  violations: number; violationTrend: number;
  lastUpdate: string;
  officer: { name: string; rank: string; badge: string };
};

const UNITS: UnitRow[] = [
  {
    id: "jtl001", code: "JTL001", isCurrent: true,
    city: "Jakarta", province: "DKI Jakarta", address: "Jl. Tol Dalam Kota KM 12", region: "Default",
    lat: -6.19, lng: 106.82, status: "active",
    totalToday: 8, totalTrend: 12, violations: 0, violationTrend: 0,
    lastUpdate: "20:25",
    officer: { name: "Agus Setiawan", rank: "Bripka", badge: "NRP 81020012" },
  },
  {
    id: "jtl002", code: "JTL002",
    city: "Bekasi", province: "Jawa Barat", address: "Tol Jakarta-Cikampek KM 28", region: "JABODETABEK",
    lat: -6.40, lng: 107.10, status: "active",
    totalToday: 47, totalTrend: 8, violations: 9, violationTrend: 3,
    lastUpdate: "20:24",
    officer: { name: "Rini Wahyuni", rank: "Briptu", badge: "NRP 81020034" },
  },
  {
    id: "jtl003", code: "JTL003",
    city: "Semarang", province: "Jawa Tengah", address: "Jl. Tol Semarang – Solo KM 15", region: "JAWA TENGAH",
    lat: -7.00, lng: 110.44, status: "warning",
    totalToday: 32, totalTrend: -5, violations: 12, violationTrend: 5,
    lastUpdate: "20:20",
    officer: { name: "Dwi Pranoto", rank: "Aipda", badge: "NRP 81020056" },
  },
  {
    id: "jtl004", code: "JTL004",
    city: "Surabaya", province: "Jawa Timur", address: "Jl. Tol Surabaya – Gresik KM 9", region: "JAWA TIMUR",
    lat: -7.25, lng: 112.75, status: "active",
    totalToday: 62, totalTrend: 15, violations: 7, violationTrend: -2,
    lastUpdate: "20:23",
    officer: { name: "Ignatius W.", rank: "Bripka", badge: "NRP 81020078" },
  },
  {
    id: "jtl005", code: "JTL005",
    city: "Balikpapan", province: "Kalimantan Timur", address: "Jl. Tol Balikpapan – Samarinda KM 3", region: "KALIMANTAN",
    lat: -1.27, lng: 116.83, status: "active",
    totalToday: 0, totalTrend: 0, violations: 0, violationTrend: 0,
    lastUpdate: "20:21",
    officer: { name: "Andi Kurniawan", rank: "Briptu", badge: "NRP 81020090" },
  },
];

// Convert UNITS to UnitSite for the map
const MAP_SITES: UnitSite[] = UNITS.map((u) => ({
  id: u.id,
  name: `Unit ${u.code}`,
  code: u.code,
  lat: u.lat, lng: u.lng,
  region: u.region,
  status: u.status === "warning" ? "maintenance" : u.status === "offline" ? "inactive" : "active",
  totalToday: u.totalToday,
  violations: u.violations,
  isCurrent: u.isCurrent,
  officer: u.officer ? { name: u.officer.name, badge: u.officer.badge, rank: u.officer.rank } : undefined,
}));

// Enforcement demo points
const ENFORCEMENT_POINTS: EnforcementPoint[] = [
  { id:"e1", lat:-6.20, lng:106.83, plateNo:"B 4412 XYZ", violationType:"OL",   weight:34.2, date:"20 Mei 2026", siteName:"JTL001 · Bripka Agus S." },
  { id:"e2", lat:-6.21, lng:106.81, plateNo:"B 9900 ZZ",  violationType:"OLOD", weight:36.8, date:"20 Mei 2026", siteName:"JTL001 · Bripka Agus S." },
  { id:"e3", lat:-6.41, lng:107.11, plateNo:"D 8821 AB",  violationType:"OD",   weight:27.1, date:"19 Mei 2026", siteName:"JTL002 · Briptu Rini W." },
  { id:"e4", lat:-7.01, lng:110.45, plateNo:"H 3341 MN",  violationType:"OL",   weight:35.9, date:"18 Mei 2026", siteName:"JTL003 · Aipda Dwi P." },
  { id:"e5", lat:-7.00, lng:110.43, plateNo:"H 5590 RS",  violationType:"OLOD", weight:38.1, date:"17 Mei 2026", siteName:"JTL003 · Aipda Dwi P." },
  { id:"e6", lat:-7.26, lng:112.76, plateNo:"L 8811 VW",  violationType:"OL",   weight:32.7, date:"16 Mei 2026", siteName:"JTL004 · Bripka Ignatius W." },
  { id:"e7", lat:-7.27, lng:112.77, plateNo:"W 4432 AB",  violationType:"OLOD", weight:37.2, date:"16 Mei 2026", siteName:"JTL004 · Bripka Ignatius W." },
];

// Analytics chart data
const DAILY_DATA = [
  { day:"14 Mei", total:78, ol:12, od:8 },
  { day:"15 Mei", total:91, ol:15, od:10 },
  { day:"16 Mei", total:65, ol:9,  od:6 },
  { day:"17 Mei", total:103,ol:18, od:11 },
  { day:"18 Mei", total:87, ol:14, od:9 },
  { day:"19 Mei", total:112,ol:21, od:13 },
  { day:"20 Mei", total:95, ol:16, od:10 },
];
const VIOLATION_PIE = [
  { name:"Over Loading",  value:105, color:"#ef4444" },
  { name:"Over Dimension",value:67,  color:"#f97316" },
  { name:"OL & OD",       value:34,  color:"#8b5cf6" },
  { name:"Normal",        value:425, color:"#22c55e" },
];

// ─── Types ────────────────────────────────────────────────────────────────────
type Tab = "units" | "enforcement" | "operators" | "analytics";

const TABS: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id:"units",       label:"Peta Unit",       icon:<Map24Regular       className="w-4 h-4" /> },
  { id:"enforcement", label:"Peta Penindakan", icon:<History24Regular   className="w-4 h-4" /> },
  { id:"operators",   label:"Operator",        icon:<People24Regular    className="w-4 h-4" /> },
  { id:"analytics",   label:"Analitik",        icon:<DataBarVertical24Regular className="w-4 h-4" /> },
];

// ─── Helpers ─────────────────────────────────────────────────────────────────
function TrendBadge({ value }: { value: number }) {
  if (value === 0) return <span className="text-xs text-slate-400">0%</span>;
  const pos = value > 0;
  return (
    <span className={`flex items-center gap-0.5 text-xs font-semibold ${pos ? "text-green-600" : "text-red-500"}`}>
      {pos
        ? <ArrowTrending16Regular className="w-3 h-3" />
        : <ArrowTrendingDown16Regular className="w-3 h-3" />
      }
      {pos ? "+" : ""}{value}%
    </span>
  );
}

function StatusBadge({ status }: { status: UnitRow["status"] }) {
  const cfg = {
    active:  { label:"Aktif",      cls:"bg-green-50 text-green-700 border-green-200",  dot:"bg-green-500" },
    warning: { label:"Peringatan", cls:"bg-amber-50 text-amber-700 border-amber-200",  dot:"bg-amber-500" },
    offline: { label:"Offline",    cls:"bg-slate-100 text-slate-500 border-slate-200", dot:"bg-slate-400" },
  }[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${cfg.cls}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}

// ─── Stat Card ────────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, icon, iconBg }: {
  label: string; value: string | number; sub: string;
  icon: React.ReactNode; iconBg: string;
}) {
  return (
    <div className="flex items-center gap-4 bg-white rounded-2xl border border-slate-100 px-5 py-4 shadow-sm flex-1">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${iconBg}`}>
        {icon}
      </div>
      <div>
        <p className="text-2xl font-extrabold text-slate-900 leading-none">{value}</p>
        <p className="text-sm font-semibold text-slate-600 mt-0.5">{label}</p>
        <p className="text-xs text-slate-400">{sub}</p>
      </div>
    </div>
  );
}

// ─── Map Legend overlay ───────────────────────────────────────────────────────
function MapLegend({ activeCount, warningCount, offlineCount }: {
  activeCount: number; warningCount: number; offlineCount: number;
}) {
  return (
    <div className="absolute top-3 right-12 z-[1000] flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-slate-100 text-xs font-semibold">
      <span className="flex items-center gap-1.5 text-green-700">
        <Circle12Filled className="w-2.5 h-2.5 text-green-500" /> Aktif ({activeCount})
      </span>
      <span className="flex items-center gap-1.5 text-amber-700">
        <Circle12Filled className="w-2.5 h-2.5 text-amber-500" /> Peringatan ({warningCount})
      </span>
      <span className="flex items-center gap-1.5 text-slate-500">
        <Circle12Filled className="w-2.5 h-2.5 text-slate-400" /> Offline ({offlineCount})
      </span>
    </div>
  );
}

function EnforcementLegendOverlay() {
  return (
    <div className="absolute top-3 right-12 z-[1000] flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl shadow-md border border-slate-100 text-xs font-semibold">
      {[
        { color:"text-red-500",    dot:"bg-red-500",    label:"Over Loading" },
        { color:"text-orange-500", dot:"bg-orange-500", label:"Over Dimension" },
        { color:"text-purple-500", dot:"bg-purple-500", label:"OL & OD" },
        { color:"text-green-500",  dot:"bg-green-500",  label:"Normal" },
      ].map((s) => (
        <span key={s.label} className={`flex items-center gap-1.5 ${s.color}`}>
          <span className={`w-2 h-2 rounded-full ${s.dot}`} /> {s.label}
        </span>
      ))}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export function DataCenterModule() {
  const [activeTab, setActiveTab] = useState<Tab>("units");
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const thirtyDaysAgo = useMemo(() => {
    const d = new Date(); d.setDate(d.getDate()-30); return d.toISOString();
  }, []);

  const { data: analyticsData } = useQuery(GET_ANALYTICS, {
    variables: { start: thirtyDaysAgo }, fetchPolicy: "cache-and-network",
  });
  const { data: operatorsData } = useQuery(GET_OPERATORS, { fetchPolicy: "cache-and-network" });

  const totalVehicles   = analyticsData?.total?.aggregate?.count ?? 0;
  const totalViolations = analyticsData?.violations?.aggregate?.count ?? 0;

  const activeCount  = UNITS.filter((u) => u.status === "active").length;
  const warningCount = UNITS.filter((u) => u.status === "warning").length;
  const offlineCount = UNITS.filter((u) => u.status === "offline").length;

  const now = new Date();
  const dateLabel = now.toLocaleDateString("id-ID", { weekday:"long", day:"numeric", month:"long", year:"numeric" });
  const timeLabel = now.toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit" }) + " WIB";

  // Filtered units for table
  const filteredUnits = useMemo(() =>
    UNITS.filter((u) => {
      const matchSearch = search === "" || u.code.toLowerCase().includes(search.toLowerCase()) || u.city.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || u.status === statusFilter;
      return matchSearch && matchStatus;
    }), [search, statusFilter]);

  const operators = operatorsData?.master_user ?? [];

  const showMap = activeTab === "units" || activeTab === "enforcement";

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-auto">

      {/* ── Page header ── */}
      <div className="bg-white border-b border-slate-100 px-6 py-4 shrink-0">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Data Center</h1>
            <p className="text-sm text-slate-500 mt-0.5">Monitoring terpusat unit Jatanlin</p>
            <p className="text-xs text-slate-400 mt-0.5">{dateLabel} • {timeLabel}</p>
          </div>
          <span className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm font-semibold px-4 py-2 rounded-full mt-1">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            {activeCount} Unit Aktif
          </span>
        </div>
      </div>

      {/* ── Map hero ── */}
      {showMap && (
        <div className="relative shrink-0" style={{ height: 380 }}>
          <UnitMap
            sites={MAP_SITES}
            mode={activeTab === "enforcement" ? "enforcement" : "units"}
            enforcementPoints={ENFORCEMENT_POINTS}
            selectedSite={selectedSite}
            onSiteClick={(s) => setSelectedSite(selectedSite === s.id ? null : s.id)}
          />
          {/* Legend overlay */}
          {activeTab === "units" && (
            <MapLegend
              activeCount={activeCount}
              warningCount={warningCount}
              offlineCount={offlineCount}
            />
          )}
          {activeTab === "enforcement" && <EnforcementLegendOverlay />}
          {/* Fullscreen button */}
          <button
            className="absolute top-3 right-3 z-[1000] w-8 h-8 bg-white/90 backdrop-blur-sm rounded-lg shadow-md border border-slate-100 flex items-center justify-center text-slate-600 hover:bg-white hover:text-blue-600 transition-colors"
            title="Layar penuh"
          >
            <Maximize20Regular className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ── Tab bar ── */}
      <div className="bg-white border-b border-slate-100 px-6 shrink-0">
        <div className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition-colors
                ${activeTab === tab.id
                  ? "border-blue-600 text-blue-600"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
                }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Tab content ── */}
      <div className="flex-1 p-6 space-y-5">

        {/* ── PETA UNIT tab ── */}
        {activeTab === "units" && (
          <>
            {/* Stat cards */}
            <div className="flex gap-4">
              <StatCard
                label="Total Unit Terdaftar"
                value={UNITS.length}
                sub={`${activeCount} aktif`}
                icon={<Location24Regular className="w-6 h-6 text-blue-600" />}
                iconBg="bg-blue-50"
              />
              <StatCard
                label="Kendaraan Hari Ini"
                value={totalVehicles || UNITS.reduce((a,u)=>a+u.totalToday,0)}
                sub="semua unit"
                icon={<VehicleCar24Regular className="w-6 h-6 text-blue-600" />}
                iconBg="bg-blue-50"
              />
              <StatCard
                label="Pelanggaran Hari Ini"
                value={totalViolations || UNITS.reduce((a,u)=>a+u.violations,0)}
                sub="0% dari total"
                icon={<Warning24Regular className="w-6 h-6 text-red-500" />}
                iconBg="bg-red-50"
              />
              <StatCard
                label="Transaksi 30 Hari"
                value={totalVehicles}
                sub={`${totalViolations} pelanggaran`}
                icon={<Scales24Regular className="w-6 h-6 text-amber-600" />}
                iconBg="bg-amber-50"
              />
            </div>

            {/* Unit table */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              {/* Table header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                <h2 className="font-bold text-slate-800 text-base">Daftar Unit Jatanlin</h2>
                <div className="flex items-center gap-2">
                  {/* Search */}
                  <div className="relative">
                    <Search20Regular className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="Cari unit atau lokasi..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 w-56"
                    />
                  </div>
                  {/* Status filter */}
                  <div className="relative">
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="appearance-none pl-3 pr-8 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl
                        focus:outline-none focus:ring-2 focus:ring-blue-400/30 text-slate-700 cursor-pointer"
                    >
                      <option value="all">Semua Status</option>
                      <option value="active">Aktif</option>
                      <option value="warning">Peringatan</option>
                      <option value="offline">Offline</option>
                    </select>
                    <Filter20Regular className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 pointer-events-none" />
                  </div>
                  {/* Download */}
                  <button className="w-9 h-9 flex items-center justify-center rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
                    <ArrowDownload20Regular className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-100 bg-slate-50/60">
                      {["Unit","Lokasi","Operator","Status","Kendaraan Hari Ini","Pelanggaran Hari Ini","Terakhir Update","Aksi"].map((h) => (
                        <th key={h} className="text-left text-[11px] font-bold text-slate-400 uppercase tracking-wide px-4 py-3 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {filteredUnits.map((unit) => (
                      <tr key={unit.id}
                        className={`hover:bg-blue-50/30 transition-colors ${selectedSite === unit.id ? "bg-blue-50/50" : ""}`}
                        onClick={() => setSelectedSite(selectedSite === unit.id ? null : unit.id)}
                      >
                        {/* Unit */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2">
                            <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                              unit.status==="active" ? "bg-green-500" :
                              unit.status==="warning" ? "bg-amber-500" : "bg-slate-400"
                            }`} />
                            <span className="font-extrabold text-slate-800 text-sm">{unit.code}</span>
                            {unit.isCurrent && (
                              <span className="text-[9px] font-bold bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded leading-none">
                                SINI
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 ml-4.5 mt-0.5">{unit.region}</p>
                        </td>
                        {/* Lokasi */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-semibold text-slate-700">{unit.city}, {unit.province}</p>
                          <p className="text-xs text-slate-400 mt-0.5">{unit.address}</p>
                        </td>
                        {/* Operator */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-slate-700 font-medium">{unit.officer.rank} {unit.officer.name}</p>
                        </td>
                        {/* Status */}
                        <td className="px-4 py-3.5">
                          <StatusBadge status={unit.status} />
                        </td>
                        {/* Kendaraan Hari Ini */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-bold text-slate-800">{unit.totalToday}</p>
                          <TrendBadge value={unit.totalTrend} />
                        </td>
                        {/* Pelanggaran Hari Ini */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm font-bold text-slate-800">{unit.violations}</p>
                          <TrendBadge value={unit.violationTrend} />
                        </td>
                        {/* Terakhir Update */}
                        <td className="px-4 py-3.5">
                          <p className="text-sm text-slate-700">{unit.lastUpdate} WIB</p>
                          <p className="text-xs text-green-600 font-semibold mt-0.5">Online</p>
                        </td>
                        {/* Aksi */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={(e) => { e.stopPropagation(); setSelectedSite(unit.id); }}
                              className="text-xs font-semibold text-blue-600 hover:text-blue-800 border border-blue-200 hover:border-blue-400 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-all"
                            >
                              Detail
                            </button>
                            <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 hover:bg-slate-100 text-slate-400 transition-colors">
                              <MoreHorizontal20Regular className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              <div className="flex items-center justify-between px-5 py-3 border-t border-slate-100 bg-slate-50/40">
                <p className="text-xs text-slate-500">
                  Menampilkan 1 – {filteredUnits.length} dari {UNITS.length} unit
                </p>
                <div className="flex items-center gap-2">
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors" disabled>
                    <ChevronLeft20Regular className="w-3.5 h-3.5" />
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg bg-blue-600 text-white text-xs font-bold shadow-sm">
                    1
                  </button>
                  <button className="w-7 h-7 flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-400 hover:bg-slate-100 disabled:opacity-40 transition-colors" disabled>
                    <ChevronRight20Regular className="w-3.5 h-3.5" />
                  </button>
                  <select className="ml-1 text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-600 focus:outline-none">
                    <option>10 / halaman</option>
                    <option>25 / halaman</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}

        {/* ── PETA PENINDAKAN tab ── */}
        {activeTab === "enforcement" && (
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h2 className="font-bold text-slate-800 text-base">Data Penindakan</h2>
              <div className="flex items-center gap-3 text-xs font-semibold">
                {[
                  { color:"bg-red-500",    label:"OL",     count:4 },
                  { color:"bg-orange-500", label:"OD",     count:1 },
                  { color:"bg-purple-500", label:"OL+OD",  count:2 },
                  { color:"bg-green-500",  label:"Normal", count:0 },
                ].map((v) => (
                  <span key={v.label} className="flex items-center gap-1.5 text-slate-600">
                    <span className={`w-2 h-2 rounded-full ${v.color}`} />
                    {v.label}: <strong>{v.count}</strong>
                  </span>
                ))}
              </div>
            </div>
            <div className="divide-y divide-slate-50">
              {ENFORCEMENT_POINTS.map((pt) => {
                const colorMap = { OL:"text-red-700 bg-red-50 border-red-200", OD:"text-orange-700 bg-orange-50 border-orange-200", OLOD:"text-purple-700 bg-purple-50 border-purple-200", normal:"text-green-700 bg-green-50 border-green-200" };
                const labelMap = { OL:"Over Loading", OD:"Over Dimension", OLOD:"OL & OD", normal:"Normal" };
                return (
                  <div key={pt.id} className="flex items-center gap-4 px-5 py-3 hover:bg-slate-50 transition-colors">
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${colorMap[pt.violationType]}`}>
                      {labelMap[pt.violationType]}
                    </span>
                    <span className="font-mono font-bold text-slate-800 text-sm w-24">{pt.plateNo}</span>
                    <span className="flex-1 text-xs text-slate-500">{pt.siteName}</span>
                    <span className="text-xs font-semibold text-slate-700">{pt.weight.toFixed(1)} ton</span>
                    <span className="text-xs text-slate-400 w-24 text-right">{pt.date}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── OPERATOR tab ── */}
        {activeTab === "operators" && (
          <div className="space-y-4">
            <div className="flex gap-4">
              {[
                { label:"Total Operator",  value:operators.length || UNITS.length, icon:<People24Regular className="w-5 h-5 text-blue-600" />, iconBg:"bg-blue-50" },
                { label:"Operator Aktif",  value:operators.filter((o:{is_active:boolean})=>o.is_active).length || UNITS.length, icon:<CheckmarkCircle24Regular className="w-5 h-5 text-green-600" />, iconBg:"bg-green-50", sub:"" },
              ].map((c) => (
                <StatCard key={c.label} label={c.label} value={c.value} sub="" icon={c.icon} iconBg={c.iconBg} />
              ))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {(operators.length > 0 ? operators : UNITS).map((item: UnitRow | {id:string;full_name:string;badge_no?:string;email?:string;is_active:boolean;master_role:{role_name:string}}) => {
                const isUnit = "officer" in item;
                const name  = isUnit ? `${(item as UnitRow).officer.rank} ${(item as UnitRow).officer.name}` : (item as {full_name:string}).full_name;
                const badge = isUnit ? (item as UnitRow).officer.badge : ((item as {badge_no?:string}).badge_no ?? "—");
                const role  = isUnit ? `Unit ${(item as UnitRow).code}` : ((item as {master_role:{role_name:string}}).master_role?.role_name ?? "—");
                const email = isUnit ? `${(item as UnitRow).code}@jatanlin.polri.go.id` : ((item as {email?:string}).email ?? "");
                const active = isUnit ? (item as UnitRow).status === "active" : (item as {is_active:boolean}).is_active;
                return (
                  <div key={item.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-start gap-3">
                    <div className="w-11 h-11 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-sm shrink-0">
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-bold text-slate-800 truncate">{name}</p>
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${active ? "bg-green-500" : "bg-slate-300"}`} />
                      </div>
                      <p className="text-xs text-slate-400 mt-0.5">{badge}</p>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{email}</p>
                      <span className="inline-block mt-1.5 text-[10px] font-bold bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                        {role}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── ANALITIK tab ── */}
        {activeTab === "analytics" && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Trend area chart */}
              <div className="xl:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-800 mb-4">Tren Kendaraan 7 Hari Terakhir</p>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={DAILY_DATA} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                    <defs>
                      <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="day" tick={{ fontSize:11 }} />
                    <YAxis tick={{ fontSize:11 }} />
                    <Tooltip contentStyle={{ fontSize:12, borderRadius:8, border:"1px solid #e2e8f0" }} />
                    <Legend wrapperStyle={{ fontSize:12 }} />
                    <Area type="monotone" dataKey="total" name="Total" stroke="#3b82f6" fill="url(#gTotal)" strokeWidth={2} dot={false} />
                    <Area type="monotone" dataKey="ol" name="Over Loading" stroke="#ef4444" fill="none" strokeWidth={1.5} dot={false} strokeDasharray="4 2" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              {/* Pie */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
                <p className="text-sm font-bold text-slate-800 mb-2">Distribusi Pelanggaran</p>
                <ResponsiveContainer width="100%" height={170}>
                  <PieChart>
                    <Pie data={VIOLATION_PIE} cx="50%" cy="50%" innerRadius={48} outerRadius={72} paddingAngle={3} dataKey="value">
                      {VIOLATION_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-1.5 mt-1">
                  {VIOLATION_PIE.map((e) => (
                    <div key={e.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background:e.color }} />
                        <span className="text-slate-600">{e.name}</span>
                      </div>
                      <span className="font-bold text-slate-800">{e.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            {/* Per-unit bar chart */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <p className="text-sm font-bold text-slate-800 mb-4">Perbandingan Kendaraan per Unit (hari ini)</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={UNITS.map((u)=>({ name:u.code, kendaraan:u.totalToday, pelanggaran:u.violations }))} margin={{ top:4, right:8, left:-20, bottom:0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize:11 }} />
                  <YAxis tick={{ fontSize:11 }} />
                  <Tooltip contentStyle={{ fontSize:12, borderRadius:8 }} />
                  <Legend wrapperStyle={{ fontSize:12 }} />
                  <Bar dataKey="kendaraan"  name="Kendaraan"  fill="#3b82f6" radius={[4,4,0,0]} />
                  <Bar dataKey="pelanggaran" name="Pelanggaran" fill="#ef4444" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
