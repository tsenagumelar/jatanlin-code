"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:28001";

type SiteStatus = "online" | "warning" | "offline";
type Tab = "overview" | "transactions" | "sites" | "analytics";
type MapMode = "sites" | "transactions";

type Overview = {
  summary: {
    total_sites: number;
    online_sites: number;
    offline_sites: number;
    active_operators: number;
    today_transactions: number;
    today_violations: number;
    today_normal: number;
  };
  sites: Array<{
    id: string;
    site_code: string;
    site_name: string;
    city: string;
    province: string;
    operational_status: string;
    active_operator_name: string;
    last_seen_at: string | null;
    last_sync_at: string | null;
    today_transactions: number;
    today_violations: number;
    today_normal: number;
    today_over_loading: number;
    today_over_dimension: number;
  }>;
  recent_violations: Array<{
    id: string;
    time: string;
    plate_no: string;
    location: string;
    violation_status: string;
    violation_notes: string;
    verification_status: string;
    officer: string;
    site_code: string;
  }>;
};

type UnitRow = {
  id: string;
  code: string;
  name: string;
  city: string;
  province: string;
  status: SiteStatus;
  healthScore: number;
  totalToday: number;
  violations: number;
  normal: number;
  overLoading: number;
  overDimension: number;
  lastSeenAt: string | null;
  lastSyncAt: string | null;
  lastSeenLabel: string;
  lastSyncLabel: string;
  operatorName: string;
  lat: number;
  lng: number;
};

const tabs: Array<{ id: Tab; label: string }> = [
  { id: "overview", label: "Peta Unit" },
  { id: "transactions", label: "Transactions" },
  { id: "sites", label: "Sites" },
  { id: "analytics", label: "Analytics" },
];

const fallbackCoordinates = [
  { lat: -6.2445, lng: 106.8214 },
  { lat: -6.4025, lng: 107.1078 },
  { lat: -7.0051, lng: 110.4381 },
  { lat: -7.2575, lng: 112.7521 },
  { lat: -1.2379, lng: 116.8529 },
  { lat: -5.1477, lng: 119.4327 },
];

function normalizeStatus(value: string): SiteStatus {
  if (value === "online") return "online";
  if (value === "warning") return "warning";
  return "offline";
}

function formatDateTime(value: string | null) {
  if (!value) return "-";
  return new Date(value).toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function minutesAgo(value: string | null) {
  if (!value) return Number.POSITIVE_INFINITY;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(value).getTime()) / 60000),
  );
}

function relativeTime(value: string | null) {
  const minutes = minutesAgo(value);
  if (!Number.isFinite(minutes)) return "never";
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function healthScore(unit: {
  operational_status: string;
  last_seen_at: string | null;
  last_sync_at: string | null;
}) {
  let score = 100;
  if (unit.operational_status !== "online") score -= 45;
  if (minutesAgo(unit.last_seen_at) > 15) score -= 20;
  if (minutesAgo(unit.last_sync_at) > 15) score -= 20;
  if (!unit.last_seen_at || !unit.last_sync_at) score -= 15;
  return Math.max(0, score);
}

function statusStyle(status: SiteStatus) {
  return {
    online: {
      label: "Online",
      dot: "bg-emerald-500",
      chip: "border-emerald-200 bg-emerald-50 text-emerald-700",
    },
    warning: {
      label: "Warning",
      dot: "bg-amber-500",
      chip: "border-amber-200 bg-amber-50 text-amber-700",
    },
    offline: {
      label: "Offline",
      dot: "bg-red-500",
      chip: "border-red-200 bg-red-50 text-red-700",
    },
  }[status];
}

function KpiTile({
  label,
  value,
  detail,
  tone,
  icon,
}: {
  label: string;
  value: string | number;
  detail: string;
  tone: "blue" | "green" | "red" | "amber" | "slate";
  icon: "site" | "vehicle" | "rate" | "sync" | "critical" | "last";
}) {
  const toneClass = {
    blue: "bg-blue-50 text-blue-700",
    green: "bg-emerald-50 text-emerald-700",
    red: "bg-red-50 text-red-700",
    amber: "bg-amber-50 text-amber-700",
    slate: "bg-slate-50 text-slate-700",
  }[tone];

  return (
    <div className="flex min-w-0 items-center gap-5 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div
        className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${toneClass}`}
      >
        <KpiIcon name={icon} />
      </div>
      <div className="min-w-0">
        <p className="text-[34px] font-black leading-none tracking-tight text-slate-950">
          {value}
        </p>
        <p className="mt-1 truncate text-base font-black text-slate-700">
          {label}
        </p>
        <p className="mt-0.5 truncate text-sm font-semibold text-slate-400">
          {detail}
        </p>
      </div>
    </div>
  );
}

function KpiIcon({
  name,
}: {
  name: "site" | "vehicle" | "rate" | "sync" | "critical" | "last";
}) {
  const common = {
    className: "h-6 w-6",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 2.2,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    viewBox: "0 0 24 24",
  };

  if (name === "site") {
    return (
      <svg {...common}>
        <path d="M4 20V9l8-5 8 5v11" />
        <path d="M9 20v-6h6v6" />
        <path d="M4 20h16" />
      </svg>
    );
  }
  if (name === "vehicle") {
    return (
      <svg {...common}>
        <path d="M4 16V9h11l3 4h2v3" />
        <path d="M6 16.5a2 2 0 1 0 4 0" />
        <path d="M16 16.5a2 2 0 1 0 4 0" />
        <path d="M8 9V6h5v3" />
      </svg>
    );
  }
  if (name === "rate") {
    return (
      <svg {...common}>
        <path d="M4 19 19 4" />
        <circle cx="7" cy="7" r="2.2" />
        <circle cx="17" cy="17" r="2.2" />
      </svg>
    );
  }
  if (name === "sync") {
    return (
      <svg {...common}>
        <path d="M20 11a8 8 0 0 0-14.7-4" />
        <path d="M5 4v4h4" />
        <path d="M4 13a8 8 0 0 0 14.7 4" />
        <path d="M19 20v-4h-4" />
      </svg>
    );
  }
  if (name === "critical") {
    return (
      <svg {...common}>
        <path d="M12 3 2.8 19h18.4L12 3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 7v6l4 2" />
      <circle cx="12" cy="12" r="9" />
    </svg>
  );
}

function StatusChip({ status }: { status: SiteStatus }) {
  const style = statusStyle(status);
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-black ${style.chip}`}
    >
      <span className={`h-2 w-2 rounded-full ${style.dot}`} />
      {style.label}
    </span>
  );
}

function CommandMap({
  units,
  selectedSite,
  mode,
  onSelectSite,
}: {
  units: UnitRow[];
  selectedSite: string | null;
  mode: MapMode;
  onSelectSite: (id: string) => void;
}) {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const leafletMapRef = useRef<import("leaflet").Map | null>(null);
  const markerLayersRef = useRef<import("leaflet").Layer[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;
    let disposed = false;

    import("leaflet").then((L) => {
      if (disposed || !mapRef.current) return;

      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }

      const map = L.map(mapRef.current, {
        center: [-2.5, 118],
        zoom: 5,
        zoomControl: true,
        attributionControl: false,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap contributors",
        maxZoom: 19,
      }).addTo(map);

      leafletMapRef.current = map;
      markerLayersRef.current = [];

      units.forEach((unit) => {
        const selected = selectedSite === unit.id;
        const markerSize = selected ? 30 : 24;
        const markerColor =
          mode === "transactions"
            ? unit.violations > 0
              ? "#ef4444"
              : "#22c55e"
            : unit.status === "online"
              ? "#22c55e"
              : unit.status === "warning"
                ? "#f59e0b"
                : "#ef4444";
        const label =
          mode === "transactions" ? unit.violations : unit.healthScore;

        const icon = L.divIcon({
          className: "",
          html: `
            <div style="
              width:${markerSize}px;
              height:${markerSize}px;
              display:flex;
              align-items:center;
              justify-content:center;
              border-radius:999px;
              background:${markerColor};
              color:#fff;
              font-size:10px;
              font-weight:900;
              border:3px solid ${selected ? "#1d4ed8" : "#fff"};
              box-shadow:0 8px 20px rgba(15,23,42,0.28);
              cursor:pointer;
            ">${label}</div>
          `,
          iconSize: [markerSize, markerSize],
          iconAnchor: [markerSize / 2, markerSize / 2],
        });

        const marker = L.marker([unit.lat, unit.lng], { icon }).addTo(map)
          .bindTooltip(`${unit.code} - ${unit.name}`, {
            direction: "top",
            offset: [0, -14],
            opacity: 0.95,
            sticky: true,
          })
          .bindPopup(`
            <div style="font-family:Arial,sans-serif;min-width:210px">
              <div style="font-weight:900;font-size:14px;color:#0f172a">${unit.name}</div>
              <div style="font-size:12px;color:#64748b;margin-top:2px">${unit.code} - ${unit.city}, ${unit.province}</div>
              <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:10px;font-size:12px">
                <div><span style="color:#64748b">Health</span><br/><strong>${unit.healthScore}%</strong></div>
                <div><span style="color:#64748b">Transactions</span><br/><strong>${unit.totalToday}</strong></div>
                <div><span style="color:#64748b">Violations</span><br/><strong style="color:#dc2626">${unit.violations}</strong></div>
                <div><span style="color:#64748b">Sync</span><br/><strong>${unit.lastSyncLabel}</strong></div>
              </div>
              <div style="margin-top:10px;padding-top:8px;border-top:1px solid #e2e8f0;font-size:12px;color:#334155">
                Operator: <strong>${unit.operatorName}</strong>
              </div>
            </div>
          `);

        marker.on("click", () => {
          onSelectSite(unit.id);
          const targetZoom = mode === "transactions" ? 16 : 15;
          map.flyTo([unit.lat, unit.lng], Math.max(map.getZoom(), targetZoom), {
            animate: true,
            duration: 0.8,
          });
          marker.openPopup();
        });
        marker.on("mouseover", () => marker.openTooltip());
        markerLayersRef.current.push(marker);
      });

      const selectedUnit = units.find((unit) => unit.id === selectedSite);
      if (selectedUnit) {
        map.setView(
          [selectedUnit.lat, selectedUnit.lng],
          mode === "transactions" ? 16 : 15,
          {
            animate: false,
          },
        );
      } else if (markerLayersRef.current.length > 0) {
        const group = L.featureGroup(markerLayersRef.current);
        map.fitBounds(group.getBounds().pad(0.22), { maxZoom: 9 });
      }
      window.setTimeout(() => map.invalidateSize(), 100);
    });

    return () => {
      disposed = true;
      if (leafletMapRef.current) {
        leafletMapRef.current.remove();
        leafletMapRef.current = null;
      }
    };
  }, [mode, onSelectSite, selectedSite, units]);

  return (
    <div className="relative h-full min-h-0 overflow-hidden rounded-2xl border border-slate-200 bg-slate-100 shadow-sm">
      <link
        rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css"
      />
      <div ref={mapRef} className="h-full w-full" />
      <div className="absolute left-4 top-4 z-[1000] rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur">
        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
          {mode === "transactions" ? "Enforcement Map" : "Site Health Map"}
        </p>
        <p className="mt-1 text-sm font-semibold text-slate-700">
          Marker: {mode === "transactions" ? "violation count" : "health score"}
        </p>
      </div>
      <div className="absolute right-4 top-4 z-[1000] flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 text-sm font-bold shadow-sm backdrop-blur">
        <span className="flex items-center gap-1.5 text-emerald-700">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          Online
        </span>
        <span className="flex items-center gap-1.5 text-amber-700">
          <span className="h-2 w-2 rounded-full bg-amber-500" />
          Warning
        </span>
        <span className="flex items-center gap-1.5 text-red-700">
          <span className="h-2 w-2 rounded-full bg-red-500" />
          Critical
        </span>
      </div>
    </div>
  );
}

export default function DataCenterPage() {
  const router = useRouter();
  const [overview, setOverview] = useState<Overview | null>(null);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedSite, setSelectedSite] = useState<string | null>(null);
  const [siteSearch, setSiteSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [analyticsDateRange, setAnalyticsDateRange] = useState("7d");
  const [analyticsSiteFilter, setAnalyticsSiteFilter] = useState("all");
  const [analyticsViolationFilter, setAnalyticsViolationFilter] =
    useState("all");

  useEffect(() => {
    const token = localStorage.getItem("dc_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    fetch(`${API_BASE_URL}/api/data-center/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (response) => {
        const payload = await response.json();
        if (!response.ok) {
          throw new Error(payload.error || "Gagal mengambil data");
        }
        setOverview(payload);
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Gagal mengambil data");
      });
  }, [router]);

  const units = useMemo<UnitRow[]>(() => {
    if (!overview) return [];
    return overview.sites.map((site, index) => {
      const coordinate =
        fallbackCoordinates[index % fallbackCoordinates.length];
      const status = normalizeStatus(site.operational_status);

      return {
        id: site.id,
        code: site.site_code,
        name: site.site_name,
        city: site.city || "-",
        province: site.province || "-",
        status,
        healthScore: healthScore(site),
        totalToday: site.today_transactions ?? 0,
        violations: site.today_violations ?? 0,
        normal: site.today_normal ?? 0,
        overLoading: site.today_over_loading ?? 0,
        overDimension: site.today_over_dimension ?? 0,
        lastSeenAt: site.last_seen_at,
        lastSyncAt: site.last_sync_at,
        lastSeenLabel: relativeTime(site.last_seen_at),
        lastSyncLabel: relativeTime(site.last_sync_at),
        operatorName: site.active_operator_name || "-",
        lat: coordinate.lat,
        lng: coordinate.lng,
      };
    });
  }, [overview]);

  const filteredUnits = useMemo(() => {
    const keyword = siteSearch.trim().toLowerCase();
    return units.filter((unit) => {
      const matchSearch =
        !keyword ||
        unit.code.toLowerCase().includes(keyword) ||
        unit.name.toLowerCase().includes(keyword) ||
        unit.city.toLowerCase().includes(keyword);
      const matchStatus =
        statusFilter === "all" || unit.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [siteSearch, statusFilter, units]);

  const analyticsUnits = useMemo(() => {
    return units.filter(
      (unit) =>
        analyticsSiteFilter === "all" || unit.code === analyticsSiteFilter,
    );
  }, [analyticsSiteFilter, units]);
  const analyticsTotals = useMemo(() => {
    const vehicles = analyticsUnits.reduce(
      (total, unit) => total + unit.totalToday,
      0,
    );
    const violations = analyticsUnits.reduce(
      (total, unit) => total + unit.violations,
      0,
    );
    const normal = analyticsUnits.reduce((total, unit) => total + unit.normal, 0);
    const overDimension =
      analyticsViolationFilter === "over_loading"
        ? 0
        : analyticsUnits.reduce((total, unit) => total + unit.overDimension, 0);
    const overLoading =
      analyticsViolationFilter === "over_dimension"
        ? 0
        : analyticsUnits.reduce((total, unit) => total + unit.overLoading, 0);
    const visibleNormal =
      analyticsViolationFilter === "all" || analyticsViolationFilter === "normal"
        ? normal
        : 0;
    const visibleViolations =
      analyticsViolationFilter === "normal" ? 0 : overDimension + overLoading;
    return {
      vehicles,
      violations,
      normal,
      visibleNormal,
      visibleViolations,
      overDimension,
      overLoading,
      todayViolations:
        analyticsViolationFilter === "normal" ? 0 : visibleViolations,
    };
  }, [analyticsUnits, analyticsViolationFilter]);
  const analyticsDistribution = useMemo(
    () => [
      {
        label: "Over Dimension",
        value: analyticsTotals.overDimension,
        color: "#ef4444",
        dot: "bg-red-500",
      },
      {
        label: "Over Loading",
        value: analyticsTotals.overLoading,
        color: "#f59e0b",
        dot: "bg-amber-500",
      },
      {
        label: "Normal",
        value: analyticsTotals.visibleNormal,
        color: "#059669",
        dot: "bg-emerald-600",
      },
    ],
    [analyticsTotals],
  );
  const analyticsRecentRows = useMemo(() => {
    const rows = overview?.recent_violations ?? [];
    return rows
      .filter(
        (row) =>
          analyticsSiteFilter === "all" || row.site_code === analyticsSiteFilter,
      )
      .filter((row) => {
        if (analyticsViolationFilter === "all") return true;
        if (analyticsViolationFilter === "normal") {
          return row.violation_status === "normal";
        }
        if (analyticsViolationFilter === "over_dimension") {
          return (
            row.violation_status === "violation" &&
            !row.violation_notes.toLowerCase().includes("loading")
          );
        }
        if (analyticsViolationFilter === "over_loading") {
          return (
            row.violation_status === "violation" &&
            row.violation_notes.toLowerCase().includes("loading")
          );
        }
        return false;
      })
      .slice(0, 10);
  }, [analyticsSiteFilter, analyticsViolationFilter, overview]);
  const maxTransactionBySite = Math.max(
    ...units.map((unit) => unit.totalToday),
    1,
  );
  const trendDays = useMemo(() => {
    const total = analyticsTotals.vehicles;
    const violations = analyticsTotals.visibleViolations;
    return Array.from({ length: 7 }, (_, index) => {
      const factor = index + 1;
      const value = Math.max(
        0,
        Math.round((total * (0.56 + factor * 0.08)) / 1.12),
      );
      const violationValue = Math.max(
        0,
        Math.round((violations * (0.5 + factor * 0.09)) / 1.13),
      );
      return {
        label: index === 6 ? "Hari ini" : `H-${6 - index}`,
        total: value,
        violations: violationValue,
      };
    });
  }, [analyticsTotals]);

  const now = new Date();
  const activeCount = units.filter((unit) => unit.status === "online").length;
  const totalSites = overview?.summary.total_sites ?? 0;
  const totalVehicles = overview?.summary.today_transactions ?? 0;
  const totalViolations = overview?.summary.today_violations ?? 0;
  const onlineRate =
    totalSites > 0 ? Math.round((activeCount / totalSites) * 100) : 0;
  const vehicleRate = totalVehicles > 0 ? 100 : 0;
  const violationRate =
    totalVehicles > 0 ? Math.round((totalViolations / totalVehicles) * 100) : 0;
  const analyticsDistributionTotal = Math.max(
    analyticsTotals.overDimension +
      analyticsTotals.overLoading +
      analyticsTotals.visibleNormal,
    1,
  );
  const analyticsOverDimensionPct =
    (analyticsTotals.overDimension / analyticsDistributionTotal) * 100;
  const analyticsOverLoadingPct =
    (analyticsTotals.overLoading / analyticsDistributionTotal) * 100;
  const syncHealthyCount = units.filter(
    (unit) => minutesAgo(unit.lastSyncAt) <= 15,
  ).length;
  const syncHealthyRate =
    totalSites > 0 ? Math.round((syncHealthyCount / totalSites) * 100) : 0;
  const criticalSites = units.filter(
    (unit) =>
      unit.status === "offline" ||
      minutesAgo(unit.lastSyncAt) > 15 ||
      unit.healthScore < 60,
  ).length;
  const lastDataSite = units
    .filter((unit) => unit.lastSyncAt)
    .sort(
      (a, b) =>
        new Date(b.lastSyncAt || 0).getTime() -
        new Date(a.lastSyncAt || 0).getTime(),
    )[0];

  const handleSelectSite = useCallback((id: string) => {
    setSelectedSite((current) => (current === id ? null : id));
  }, []);

  function logout() {
    localStorage.removeItem("dc_token");
    localStorage.removeItem("dc_user");
    router.replace("/login");
  }

  const operationalKpiGrid = (
    <section className="grid shrink-0 grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
      <KpiTile
        label="Sites Online"
        value={`${activeCount}/${totalSites}`}
        detail={`${onlineRate}% active`}
        tone="blue"
        icon="site"
      />
      <KpiTile
        label="Vehicles Today"
        value={totalVehicles}
        detail={`${vehicleRate}% total kendaraan`}
        tone="green"
        icon="vehicle"
      />
      <KpiTile
        label="Violation Rate"
        value={`${violationRate}%`}
        detail={`${totalViolations} of ${totalVehicles}`}
        tone="red"
        icon="rate"
      />
      <KpiTile
        label="Sync Healthy"
        value={`${syncHealthyCount}/${totalSites}`}
        detail={`${syncHealthyRate}% under 15m`}
        tone="green"
        icon="sync"
      />
      <KpiTile
        label="Critical Sites"
        value={criticalSites}
        detail="offline / delayed"
        tone={criticalSites > 0 ? "amber" : "slate"}
        icon="critical"
      />
      <KpiTile
        label="Last Data"
        value={lastDataSite?.lastSyncLabel ?? "-"}
        detail={lastDataSite?.code ?? "no data"}
        tone="slate"
        icon="last"
      />
    </section>
  );

  return (
    <main className="flex h-screen flex-col overflow-hidden bg-[#eef2f7] text-slate-900">
      <header className="shrink-0 border-b border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-black tracking-tight">Data Center</h1>
              <span className="rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-black uppercase tracking-wide text-blue-700">
                Command Center
              </span>
            </div>
            <p className="mt-1 text-sm font-semibold text-slate-500">
              {now.toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}{" "}
              -{" "}
              {now.toLocaleTimeString("id-ID", {
                hour: "2-digit",
                minute: "2-digit",
              })}{" "}
              WIB
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-black text-emerald-700">
              <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
              {activeCount} online
            </span>
            <button
              type="button"
              onClick={logout}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600 hover:bg-slate-50"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {error ? (
        <div className="mx-5 mt-3 shrink-0 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </div>
      ) : null}

      <nav className="shrink-0 border-y border-slate-200 bg-white px-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`border-b-4 px-4 py-3 text-sm font-black transition-colors ${
                activeTab === tab.id
                  ? "border-blue-600 text-blue-700"
                  : "border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-800"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      <section className="min-h-0 flex-1 overflow-hidden p-5">
        {!overview ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm font-semibold text-slate-500 shadow-sm">
            Memuat data center...
          </div>
        ) : null}

        {overview && activeTab === "overview" ? (
          <div className="flex h-full min-h-0 flex-col gap-4">
            {operationalKpiGrid}

            <div className="h-[40vh] min-h-[340px] shrink-0">
              <CommandMap
                units={units}
                selectedSite={selectedSite}
                mode="sites"
                onSelectSite={handleSelectSite}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <h2 className="text-2xl font-black text-slate-900">
                  Daftar Unit Jatanlin
                </h2>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">
                      Q
                    </span>
                    <input
                      value={siteSearch}
                      onChange={(event) => setSiteSearch(event.target.value)}
                      placeholder="Cari unit atau lokasi..."
                      className="h-11 w-80 rounded-xl border border-slate-200 bg-slate-50 pl-8 pr-3 text-base font-semibold outline-none focus:border-blue-400 focus:bg-white"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="all">Semua Status</option>
                    <option value="online">Aktif</option>
                    <option value="warning">Peringatan</option>
                    <option value="offline">Offline</option>
                  </select>
                  <button
                    type="button"
                    className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-sm font-black text-slate-400"
                    title="Download"
                  >
                    DL
                  </button>
                </div>
              </div>

              <div className="h-full overflow-auto">
                <table className="w-full min-w-[1280px] text-base">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-sm uppercase tracking-wide text-slate-400">
                    <tr className="border-b border-slate-100">
                      <th className="px-5 py-4 text-left">Unit</th>
                      <th className="px-5 py-4 text-left">Lokasi</th>
                      <th className="px-5 py-4 text-left">Operator</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-left">Kendaraan Hari Ini</th>
                      <th className="px-5 py-4 text-left">Pelanggaran Hari Ini</th>
                      <th className="px-5 py-4 text-left">Terakhir Update</th>
                      <th className="px-5 py-4 text-left">Aksi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnits.map((unit) => {
                      const trend = unit.violations > 0 ? "+3%" : "0%";
                      return (
                        <tr key={unit.id} className="hover:bg-slate-50">
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-3 w-3 rounded-full ${
                                  unit.status === "online"
                                    ? "bg-emerald-500"
                                    : unit.status === "warning"
                                      ? "bg-amber-500"
                                      : "bg-slate-400"
                                }`}
                              />
                              <p className="text-lg font-black text-slate-800">
                                {unit.code}
                              </p>
                              {unit.status === "online" ? (
                                <span className="rounded bg-blue-100 px-2 py-1 text-xs font-black text-blue-700">
                                  SINI
                                </span>
                              ) : null}
                            </div>
                            <p className="ml-5 mt-1 text-sm font-semibold uppercase text-slate-400">
                              {unit.province}
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <p className="text-lg font-bold text-slate-700">
                              {unit.city}, {unit.province}
                            </p>
                            <p className="mt-1 text-sm font-medium text-slate-400">
                              {unit.name}
                            </p>
                          </td>
                          <td className="px-5 py-5 text-base font-bold text-slate-600">
                            {unit.operatorName}
                          </td>
                          <td className="px-5 py-5">
                            <StatusChip status={unit.status} />
                          </td>
                          <td className="px-5 py-5">
                            <p className="text-lg font-black text-slate-800">
                              {unit.totalToday}
                            </p>
                            <p className="mt-1 text-sm font-black text-emerald-600">
                              +{unit.totalToday > 0 ? "12" : "0"}%
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <p className="text-lg font-black text-slate-800">
                              {unit.violations}
                            </p>
                            <p
                              className={`mt-1 text-sm font-black ${
                                unit.violations > 0
                                  ? "text-emerald-600"
                                  : "text-slate-300"
                              }`}
                            >
                              {trend}
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <p className="text-base font-bold text-slate-600">
                              {unit.lastSyncLabel}
                            </p>
                            <p
                              className={`mt-1 text-sm font-black ${
                                unit.status === "online"
                                  ? "text-emerald-600"
                                  : "text-slate-400"
                              }`}
                            >
                              {unit.status === "online" ? "Online" : "Offline"}
                            </p>
                          </td>
                          <td className="px-5 py-5">
                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedSite(unit.id)}
                                className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-black text-blue-700 hover:bg-blue-100"
                              >
                                Detail
                              </button>
                              <button
                                type="button"
                                className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-black text-slate-400"
                              >
                                ...
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                <p className="text-sm font-semibold text-slate-500">
                  Menampilkan 1 - {filteredUnits.length} dari {units.length} unit
                </p>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-black text-slate-300"
                  >
                    ‹
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-600 text-sm font-black text-white"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-sm font-black text-slate-300"
                  >
                    ›
                  </button>
                  <select className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold text-slate-500">
                    <option>10 / halaman</option>
                    <option>25 / halaman</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {overview && activeTab === "transactions" ? (
          <div className="flex h-full min-h-0 flex-col gap-4">
            {operationalKpiGrid}

            <div className="h-[36vh] min-h-[300px] shrink-0">
              <CommandMap
                units={units}
                selectedSite={selectedSite}
                mode="transactions"
                onSelectSite={handleSelectSite}
              />
            </div>

            <div className="min-h-0 flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="flex items-center justify-between gap-4 border-b border-slate-100 px-5 py-4">
                <div>
                  <h2 className="text-2xl font-black text-slate-900">
                    Data Pelanggaran per Unit
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-slate-500">
                    Fokus transaksi pelanggaran berdasarkan site pengirim data
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    value={siteSearch}
                    onChange={(event) => setSiteSearch(event.target.value)}
                    placeholder="Cari site atau lokasi..."
                    className="h-11 w-80 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold outline-none focus:border-blue-400 focus:bg-white"
                  />
                  <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="all">Semua Status</option>
                    <option value="online">Aktif</option>
                    <option value="warning">Peringatan</option>
                    <option value="offline">Offline</option>
                  </select>
                </div>
              </div>

              <div className="h-full overflow-auto">
                <table className="w-full min-w-[1180px] text-base">
                  <thead className="sticky top-0 z-10 bg-slate-50 text-sm uppercase tracking-wide text-slate-400">
                    <tr>
                      <th className="px-5 py-4 text-left">Unit</th>
                      <th className="px-5 py-4 text-left">Lokasi</th>
                      <th className="px-5 py-4 text-left">Kendaraan</th>
                      <th className="px-5 py-4 text-left">Pelanggaran</th>
                      <th className="px-5 py-4 text-left">Violation Rate</th>
                      <th className="px-5 py-4 text-left">Operator</th>
                      <th className="px-5 py-4 text-left">Last Sync</th>
                      <th className="px-5 py-4 text-left">Status Site</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredUnits.map((unit) => (
                      <tr key={unit.id} className="hover:bg-slate-50">
                        <td className="px-5 py-5">
                          <p className="text-lg font-black text-slate-800">
                            {unit.code}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            {unit.name}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-lg font-bold text-slate-700">
                            {unit.city}, {unit.province}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            Last location from site sync
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-xl font-black text-slate-800">
                            {unit.totalToday}
                          </p>
                          <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-blue-500"
                              style={{
                                width: `${(unit.totalToday / maxTransactionBySite) * 100}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-xl font-black text-red-600">
                            {unit.violations}
                          </p>
                          <p className="mt-1 text-sm font-black text-slate-400">
                            {unit.normal} normal
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-xl font-black text-slate-800">
                            {unit.totalToday > 0
                              ? `${Math.round((unit.violations / unit.totalToday) * 100)}%`
                              : "0%"}
                          </p>
                          <div className="mt-2 h-2 w-36 overflow-hidden rounded-full bg-slate-100">
                            <div
                              className="h-full rounded-full bg-red-500"
                              style={{
                                width: `${unit.totalToday > 0 ? (unit.violations / unit.totalToday) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </td>
                        <td className="px-5 py-5 text-base font-bold text-slate-600">
                          {unit.operatorName}
                        </td>
                        <td className="px-5 py-5">
                          <p className="text-base font-bold text-slate-600">
                            {unit.lastSyncLabel}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-400">
                            {formatDateTime(unit.lastSyncAt)}
                          </p>
                        </td>
                        <td className="px-5 py-5">
                          <StatusChip status={unit.status} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/50 px-5 py-4">
                <p className="text-sm font-semibold text-slate-500">
                  Menampilkan {filteredUnits.length} site dengan total{" "}
                  {totalViolations} pelanggaran hari ini
                </p>
                <p className="text-sm font-black text-slate-600">
                  POV: violation monitoring
                </p>
              </div>
            </div>
          </div>
        ) : null}

        {overview && activeTab === "sites" ? (
          <div className="flex h-full min-h-0 flex-col gap-4">
            {operationalKpiGrid}

            <div className="flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div>
                <h2 className="text-2xl font-black text-slate-900">
                  Site Operations
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Status online/offline, lokasi terakhir, dan operator aktif
                </p>
              </div>
              <div className="flex items-center gap-2">
                <input
                  value={siteSearch}
                  onChange={(event) => setSiteSearch(event.target.value)}
                  placeholder="Cari site..."
                  className="h-11 w-80 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-semibold outline-none focus:border-blue-400 focus:bg-white"
                />
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                >
                  <option value="all">Semua Status</option>
                  <option value="online">Aktif</option>
                  <option value="warning">Peringatan</option>
                  <option value="offline">Offline</option>
                </select>
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-auto">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 2xl:grid-cols-3">
                {filteredUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <p className="truncate text-2xl font-black text-slate-900">
                          {unit.name}
                        </p>
                        <p className="mt-1 text-base font-black text-blue-700">
                          {unit.code}
                        </p>
                      </div>
                      <StatusChip status={unit.status} />
                    </div>

                    <div className="mt-5 grid gap-3">
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Lokasi Terakhir
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-800">
                          {unit.city}, {unit.province}
                        </p>
                      </div>
                      <div className="rounded-xl bg-slate-50 px-4 py-3">
                        <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                          Operator Terakhir Aktif
                        </p>
                        <p className="mt-1 text-lg font-black text-slate-800">
                          {unit.operatorName}
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Last Seen
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-800">
                            {unit.lastSeenLabel}
                          </p>
                        </div>
                        <div className="rounded-xl bg-slate-50 px-4 py-3">
                          <p className="text-xs font-black uppercase tracking-wide text-slate-400">
                            Last Sync
                          </p>
                          <p className="mt-1 text-lg font-black text-slate-800">
                            {unit.lastSyncLabel}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}

        {overview && activeTab === "analytics" ? (
          <div className="flex h-full min-h-0 flex-col gap-4 overflow-auto">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="text-sm font-black text-slate-500">
                    Analytics
                  </p>
                  <h2 className="mt-1 text-3xl font-black text-slate-950">
                    Jatanlin
                  </h2>
                  <p className="mt-1 text-base font-semibold text-slate-500">
                    Operational summary for ODOL vehicles and violations.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={analyticsDateRange}
                    onChange={(event) =>
                      setAnalyticsDateRange(event.target.value)
                    }
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="today">Hari ini</option>
                    <option value="7d">7 hari terakhir</option>
                    <option value="30d">30 hari terakhir</option>
                  </select>
                  <select
                    value={analyticsSiteFilter}
                    onChange={(event) =>
                      setAnalyticsSiteFilter(event.target.value)
                    }
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="all">Semua Site</option>
                    {units.map((unit) => (
                      <option key={unit.id} value={unit.code}>
                        {unit.code} - {unit.name}
                      </option>
                    ))}
                  </select>
                  <select
                    value={analyticsViolationFilter}
                    onChange={(event) =>
                      setAnalyticsViolationFilter(event.target.value)
                    }
                    className="h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-base font-bold text-slate-600 outline-none focus:border-blue-400"
                  >
                    <option value="all">Semua Status</option>
                    <option value="over_dimension">Over Dimension</option>
                    <option value="over_loading">Over Loading</option>
                    <option value="normal">Normal</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  label: "ODOL Vehicles",
                  value: analyticsTotals.visibleViolations,
                  tone: "red",
                  icon: "vehicle" as const,
                },
                {
                  label: "Total Violations",
                  value: analyticsTotals.violations,
                  tone: "amber",
                  icon: "critical" as const,
                },
                {
                  label: "Normal Vehicles",
                  value: analyticsTotals.normal,
                  tone: "green",
                  icon: "sync" as const,
                },
                {
                  label: "Today's Violations",
                  value: analyticsTotals.todayViolations,
                  tone: "blue",
                  icon: "last" as const,
                },
              ].map((item) => (
                <KpiTile
                  key={item.label}
                  label={item.label}
                  value={item.value}
                  detail={
                    analyticsDateRange === "today"
                      ? "filter hari ini"
                      : analyticsDateRange === "30d"
                        ? "filter 30 hari"
                        : "filter 7 hari"
                  }
                  tone={item.tone as "blue" | "green" | "red" | "amber"}
                  icon={item.icon}
                />
              ))}
            </div>

            <div className="grid min-h-[380px] gap-4 xl:grid-cols-[minmax(0,1.55fr)_minmax(420px,0.75fr)]">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">
                  Enforcement Total - Last 7 Days
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Over dimension, over loading, and normal vehicles per day.
                </p>

                <div className="mt-5 h-[280px] rounded-xl bg-white">
                  <svg
                    viewBox="0 0 900 260"
                    className="h-full w-full overflow-visible"
                    role="img"
                    aria-label="Enforcement trend chart"
                  >
                    {[0, 1, 2, 3, 4].map((row) => (
                      <line
                        key={row}
                        x1="42"
                        x2="880"
                        y1={35 + row * 45}
                        y2={35 + row * 45}
                        stroke="#e2e8f0"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {[0, 1, 2, 3, 4, 5, 6].map((index) => (
                      <line
                        key={index}
                        x1={60 + index * 132}
                        x2={60 + index * 132}
                        y1="35"
                        y2="215"
                        stroke="#f1f5f9"
                        strokeDasharray="4 4"
                      />
                    ))}
                    {(() => {
                      const max = Math.max(
                        ...trendDays.map((day) =>
                          Math.max(day.total, day.violations),
                        ),
                        1,
                      );
                      const points = trendDays.map((day, index) => {
                        const x = 60 + index * 132;
                        const y = 215 - (day.total / max) * 180;
                        return `${x},${y}`;
                      });
                      const violationPoints = trendDays.map((day, index) => {
                        const x = 60 + index * 132;
                        const y = 215 - (day.violations / max) * 180;
                        return `${x},${y}`;
                      });
                      return (
                        <>
                          <polyline
                            fill="none"
                            points={points.join(" ")}
                            stroke="#059669"
                            strokeWidth="4"
                          />
                          <polyline
                            fill="none"
                            points={violationPoints.join(" ")}
                            stroke="#ef4444"
                            strokeWidth="4"
                          />
                          {trendDays.map((day, index) => {
                            const x = 60 + index * 132;
                            const y = 215 - (day.total / max) * 180;
                            const violationY =
                              215 - (day.violations / max) * 180;
                            return (
                              <g key={day.label}>
                                <circle
                                  cx={x}
                                  cy={y}
                                  r="5"
                                  fill="#fff"
                                  stroke="#059669"
                                  strokeWidth="3"
                                />
                                <circle
                                  cx={x}
                                  cy={violationY}
                                  r="5"
                                  fill="#fff"
                                  stroke="#ef4444"
                                  strokeWidth="3"
                                />
                                <text
                                  x={x}
                                  y="242"
                                  textAnchor="middle"
                                  className="fill-slate-400 text-[14px] font-bold"
                                >
                                  {day.label}
                                </text>
                              </g>
                            );
                          })}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                <div className="mt-3 flex items-center gap-6 text-sm font-black text-slate-500">
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-red-500" />
                    Over Dimension
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    Over Loading
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="h-3 w-3 rounded-full bg-emerald-600" />
                    Normal
                  </span>
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-2xl font-black text-slate-900">
                  Violation Distribution
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Over dimension, over loading, and normal.
                </p>

                <div className="mt-6 flex items-center justify-center">
                  <div
                    className="h-52 w-52 rounded-full"
                    style={{
                      background: `conic-gradient(#ef4444 0 ${analyticsOverDimensionPct}%, #f59e0b ${analyticsOverDimensionPct}% ${analyticsOverDimensionPct + analyticsOverLoadingPct}%, #059669 ${analyticsOverDimensionPct + analyticsOverLoadingPct}% 100%)`,
                    }}
                  >
                    <div className="m-12 h-28 w-28 rounded-full bg-white" />
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  {analyticsDistribution.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center justify-between text-base font-black text-slate-600"
                    >
                      <span className="flex items-center gap-2">
                        <span className={`h-3 w-3 rounded-full ${item.dot}`} />
                        {item.label}
                      </span>
                      <span>{item.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-5 py-4">
                <h2 className="text-2xl font-black text-slate-900">
                  Latest 10 Violation Summary
                </h2>
                <p className="mt-1 text-sm font-semibold text-slate-500">
                  Latest vehicles detected with violations.
                </p>
              </div>
              <div className="overflow-auto">
                <table className="w-full min-w-[1280px] text-base">
                  <thead className="bg-slate-50 text-sm uppercase tracking-[0.2em] text-slate-400">
                    <tr>
                      <th className="px-5 py-4 text-left">No</th>
                      <th className="px-5 py-4 text-left">Time</th>
                      <th className="px-5 py-4 text-left">Plate No</th>
                      <th className="px-5 py-4 text-left">Location</th>
                      <th className="px-5 py-4 text-left">Violation Type</th>
                      <th className="px-5 py-4 text-left">Article</th>
                      <th className="px-5 py-4 text-left">Officer</th>
                      <th className="px-5 py-4 text-left">Status</th>
                      <th className="px-5 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {analyticsRecentRows.length > 0 ? (
                      analyticsRecentRows.map((row, index) => (
                        <tr key={row.id} className="hover:bg-slate-50">
                          <td className="px-5 py-5 font-black text-slate-500">
                            {index + 1}
                          </td>
                          <td className="px-5 py-5 font-bold text-slate-600">
                            {formatDateTime(row.time)}
                          </td>
                          <td className="px-5 py-5 font-black text-slate-900">
                            {row.plate_no || "-"}
                          </td>
                          <td className="px-5 py-5 font-bold text-slate-600">
                            {row.location || row.site_code}
                          </td>
                          <td className="px-5 py-5 font-bold text-slate-600">
                            {row.violation_status === "normal"
                              ? "Normal"
                              : row.violation_status === "violation"
                                ? row.violation_notes
                                      .toLowerCase()
                                      .includes("loading")
                                  ? "Over Loading"
                                  : "Over Dimension"
                                : "Pending"}
                          </td>
                          <td className="px-5 py-5 font-bold text-slate-600">
                            {row.violation_notes || "Article 277"}
                          </td>
                          <td className="px-5 py-5 font-bold text-slate-600">
                            {row.officer || "-"}
                          </td>
                          <td className="px-5 py-5">
                            <span
                              className={`rounded-full px-3 py-1 text-sm font-black ${
                                row.verification_status === "verified"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : row.verification_status === "rejected"
                                    ? "bg-red-50 text-red-700"
                                    : "bg-amber-50 text-amber-700"
                              }`}
                            >
                              {row.verification_status || "pending"}
                            </span>
                          </td>
                          <td className="px-5 py-5 text-right">
                            <button
                              type="button"
                              onClick={() =>
                                router.push(`/data-center/transactions/${row.id}`)
                              }
                              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-black text-slate-600"
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={9}
                          className="px-5 py-10 text-center text-base font-bold text-slate-400"
                        >
                          Belum ada data sesuai filter.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    </main>
  );
}
