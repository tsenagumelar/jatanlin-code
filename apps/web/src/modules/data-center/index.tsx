"use client";

import React, { useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { Card, Badge, Button, Input } from "@fluentui/react-components";
import {
  Warning24Regular,
  VehicleTruckProfile24Regular,
  ScaleFill24Regular,
  Cube24Regular,
  Search24Regular,
} from "@fluentui/react-icons";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartTooltip,
  Legend,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const MapContainer = dynamic(
  () => import("react-leaflet").then((m) => m.MapContainer),
  { ssr: false },
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((m) => m.TileLayer),
  { ssr: false },
);
const CircleMarker = dynamic(
  () => import("react-leaflet").then((m) => m.CircleMarker),
  { ssr: false },
);
const Tooltip = dynamic(() => import("react-leaflet").then((m) => m.Tooltip), {
  ssr: false,
});

type ViolationType =
  | "Over Loading"
  | "Over Dimension"
  | "Over Dimension & Over Loading";

type ViolationItem = {
  id: string;
  time: string;
  city: string;
  site: string;
  plateNo: string;
  vehicleClass: string;
  violationType: ViolationType;
  weightTon: number;
  dimension: string;
};

const cityCoordinates: Record<string, { lat: number; lng: number }> = {
  Medan: { lat: 3.5952, lng: 98.6722 },
  Jakarta: { lat: -6.2088, lng: 106.8456 },
  Bandung: { lat: -6.9175, lng: 107.6191 },
  Semarang: { lat: -6.9667, lng: 110.4167 },
  Surabaya: { lat: -7.2575, lng: 112.7521 },
  Denpasar: { lat: -8.6705, lng: 115.2126 },
  Balikpapan: { lat: -1.2379, lng: 116.8529 },
  Makassar: { lat: -5.1477, lng: 119.4327 },
};

const seedViolations: ViolationItem[] = [
  {
    id: "V-240501",
    time: "2026-05-04 10:02:11",
    city: "Jakarta",
    site: "Mampang",
    plateNo: "B 1234 XYZ",
    vehicleClass: "Kelas III",
    violationType: "Over Loading",
    weightTon: 24.3,
    dimension: "10.5 x 2.5 x 3.7",
  },
  {
    id: "V-240502",
    time: "2026-05-04 09:58:21",
    city: "Surabaya",
    site: "Surabaya Utara",
    plateNo: "L 8877 KT",
    vehicleClass: "Kelas II",
    violationType: "Over Dimension",
    weightTon: 16.8,
    dimension: "9.9 x 2.7 x 4.1",
  },
  {
    id: "V-240503",
    time: "2026-05-04 09:52:45",
    city: "Semarang",
    site: "Semarang Barat",
    plateNo: "H 3321 BN",
    vehicleClass: "Kelas III",
    violationType: "Over Dimension & Over Loading",
    weightTon: 28.1,
    dimension: "11.1 x 2.8 x 4.2",
  },
  {
    id: "V-240504",
    time: "2026-05-04 09:47:10",
    city: "Bandung",
    site: "Cileunyi",
    plateNo: "D 7788 PR",
    vehicleClass: "Kelas II",
    violationType: "Over Loading",
    weightTon: 20.2,
    dimension: "10.1 x 2.4 x 3.8",
  },
  {
    id: "V-240505",
    time: "2026-05-04 09:40:56",
    city: "Makassar",
    site: "Makassar Timur",
    plateNo: "DD 1230 AA",
    vehicleClass: "Kelas III",
    violationType: "Over Dimension",
    weightTon: 19.4,
    dimension: "10.2 x 2.6 x 4.0",
  },
  {
    id: "V-240506",
    time: "2026-05-04 09:38:03",
    city: "Jakarta",
    site: "Mampang",
    plateNo: "B 9012 GG",
    vehicleClass: "Kelas II",
    violationType: "Over Loading",
    weightTon: 18.9,
    dimension: "9.8 x 2.5 x 3.6",
  },
  {
    id: "V-240507",
    time: "2026-05-04 09:30:19",
    city: "Medan",
    site: "Medan Kota",
    plateNo: "BK 5552 CE",
    vehicleClass: "Kelas III",
    violationType: "Over Dimension",
    weightTon: 21.1,
    dimension: "10.6 x 2.7 x 4.1",
  },
  {
    id: "V-240508",
    time: "2026-05-04 09:24:48",
    city: "Surabaya",
    site: "Surabaya Utara",
    plateNo: "L 4442 QS",
    vehicleClass: "Kelas III",
    violationType: "Over Dimension & Over Loading",
    weightTon: 29.2,
    dimension: "11.4 x 2.8 x 4.4",
  },
  {
    id: "V-240509",
    time: "2026-05-04 09:16:06",
    city: "Balikpapan",
    site: "Balikpapan Port",
    plateNo: "KT 8812 PL",
    vehicleClass: "Kelas II",
    violationType: "Over Loading",
    weightTon: 17.7,
    dimension: "9.5 x 2.5 x 3.7",
  },
  {
    id: "V-240510",
    time: "2026-05-04 09:10:54",
    city: "Denpasar",
    site: "Denpasar Barat",
    plateNo: "DK 1267 FK",
    vehicleClass: "Kelas II",
    violationType: "Over Dimension",
    weightTon: 16.2,
    dimension: "9.3 x 2.6 x 4.0",
  },
];

const violations: ViolationItem[] = Array.from({ length: 8 }).flatMap(
  (_, batchIdx) =>
    seedViolations.map((item, itemIdx) => {
      const hour = 10 - Math.min(batchIdx, 7);
      const minute = (58 - (itemIdx * 3 + batchIdx * 4)) % 60;
      const second = (11 + itemIdx * 7 + batchIdx * 5) % 60;
      const hh = String((hour + 24) % 24).padStart(2, "0");
      const mm = String((minute + 60) % 60).padStart(2, "0");
      const ss = String(second).padStart(2, "0");
      const day = 5 - (batchIdx % 5);
      const dd = String(day).padStart(2, "0");

      return {
        ...item,
        id: `${item.id}-B${batchIdx + 1}`,
        time: `2026-05-${dd} ${hh}:${mm}:${ss}`,
      };
    }),
);

const pieColors = [
  "#0078D4",
  "#00B7C3",
  "#107C10",
  "#F7630C",
  "#5C2E91",
  "#8A8886",
];

const violationBadgeColor = (type: ViolationType) => {
  if (type === "Over Loading") return "informative" as const;
  if (type === "Over Dimension") return "warning" as const;
  return "danger" as const;
};

const KpiCard = ({
  title,
  value,
  subText,
  icon,
  accent,
}: {
  title: string;
  value: string;
  subText: string;
  icon: React.ReactNode;
  accent: string;
}) => (
  <Card className="p-4 flex-1 min-w-[220px] border border-[#E1DFDD]">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-xs text-[#605E5C] uppercase tracking-wide">
          {title}
        </p>
        <p className="text-3xl font-bold text-[#201F1E] mt-1">{value}</p>
        <p className="text-xs text-[#8A8886] mt-1">{subText}</p>
      </div>
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center text-white"
        style={{ background: accent }}
      >
        {icon}
      </div>
    </div>
  </Card>
);

export const DataCenterModule: React.FC = () => {
  const [search, setSearch] = useState("");
  const [cityFilter, setCityFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const summary = useMemo(() => {
    const ol = violations.filter(
      (x) => x.violationType === "Over Loading",
    ).length;
    const od = violations.filter(
      (x) => x.violationType === "Over Dimension",
    ).length;
    const both = violations.filter(
      (x) => x.violationType === "Over Dimension & Over Loading",
    ).length;
    return { ol, od, both, total: ol + od + both };
  }, []);

  const cityTotals = useMemo(() => {
    const map = new Map<string, number>();
    violations.forEach((v) => {
      map.set(v.city, (map.get(v.city) || 0) + 1);
    });
    return Array.from(map.entries())
      .map(([city, total]) => ({ city, total, ...cityCoordinates[city] }))
      .filter((x) => Number.isFinite(x.lat) && Number.isFinite(x.lng))
      .sort((a, b) => b.total - a.total);
  }, []);

  const cityPieData = useMemo(() => {
    const top5 = cityTotals
      .slice(0, 5)
      .map((x) => ({ name: x.city, value: x.total }));
    const otherTotal = cityTotals
      .slice(5)
      .reduce((acc, cur) => acc + cur.total, 0);
    if (otherTotal > 0) top5.push({ name: "Others", value: otherTotal });
    return top5;
  }, [cityTotals]);

  const trendData = useMemo(() => {
    const toDateKey = (value: string) => value.slice(0, 10);
    const allDateKeys = Array.from(new Set(violations.map((v) => toDateKey(v.time)))).sort();
    const last5Keys = allDateKeys.slice(-5);

    return last5Keys.map((dateKey) => {
      const dayRows = violations.filter((v) => toDateKey(v.time) === dateKey);
      const overLoading = dayRows.filter((v) => v.violationType === "Over Loading").length;
      const overDimension = dayRows.filter((v) => v.violationType === "Over Dimension").length;
      const both = dayRows.filter((v) => v.violationType === "Over Dimension & Over Loading").length;
      const dayName = new Date(`${dateKey}T00:00:00`).toLocaleDateString("id-ID", {
        weekday: "short",
      });
      return {
        label: dayName,
        total: overLoading + overDimension + both,
        overLoading,
        overDimension,
        normal: both,
      };
    });
  }, []);

  const renderPieLabel = (props: {
    cx?: number;
    cy?: number;
    midAngle?: number;
    innerRadius?: number;
    outerRadius?: number;
    percent?: number;
    name?: string;
  }) => {
    const RADIAN = Math.PI / 180;
    const cx = props.cx ?? 0;
    const cy = props.cy ?? 0;
    const midAngle = props.midAngle ?? 0;
    const innerRadius = props.innerRadius ?? 0;
    const outerRadius = props.outerRadius ?? 0;
    const percent = props.percent ?? 0;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    return (
      <text
        x={x}
        y={y}
        fill="#fff"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const filtered = useMemo(() => {
    return violations.filter((v) => {
      const q = search.toLowerCase();
      const matchSearch =
        !q ||
        v.plateNo.toLowerCase().includes(q) ||
        v.site.toLowerCase().includes(q) ||
        v.city.toLowerCase().includes(q) ||
        v.id.toLowerCase().includes(q);
      const matchCity = cityFilter === "ALL" || v.city === cityFilter;
      const matchType = typeFilter === "ALL" || v.violationType === typeFilter;
      return matchSearch && matchCity && matchType;
    });
  }, [search, cityFilter, typeFilter]);

  const cities = useMemo(
    () => ["ALL", ...Array.from(new Set(violations.map((v) => v.city)))],
    [],
  );
  const types = [
    "ALL",
    "Over Loading",
    "Over Dimension",
    "Over Dimension & Over Loading",
  ];

  return (
    <div className="h-full overflow-auto p-4 md:p-6 bg-gradient-to-b from-[#F3F2F1] to-[#ECECEC]">
      <div className="space-y-4">
        <div className="rounded-2xl p-5 bg-[linear-gradient(120deg,#0F4C81,#0078D4,#00B7C3)] text-white shadow">
          <div className="flex items-center justify-between gap-3 flex-wrap">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">
                Data Center Dashboard
              </h1>
            </div>
            <div className="flex items-center gap-2">
              <Button appearance="secondary">Last 24h</Button>
              <Button appearance="primary">Refresh</Button>
            </div>
          </div>
        </div>

        <div className="flex gap-3 flex-wrap">
          <KpiCard
            title="Pelanggaran Overloading"
            value={`${summary.ol}`}
            subText="Kendaraan melebihi batas berat"
            icon={<ScaleFill24Regular />}
            accent="#0F6CBD"
          />
          <KpiCard
            title="Pelanggaran Overdimension"
            value={`${summary.od}`}
            subText="Kendaraan melebihi batas dimensi"
            icon={<Cube24Regular />}
            accent="#038387"
          />
          <KpiCard
            title="Pelanggaran Gabungan"
            value={`${summary.both}`}
            subText="Overloading + overdimension"
            icon={<Warning24Regular />}
            accent="#CA5010"
          />
          <KpiCard
            title="Total Kendaraan Melanggar"
            value={`${summary.total}`}
            subText="Akumulasi pelanggaran periode aktif"
            icon={<VehicleTruckProfile24Regular />}
            accent="#5C2E91"
          />
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <Card className="p-4 border border-[#E1DFDD]">
            <h2 className="text-base font-semibold text-[#323130] mb-3">
              Tren Akumulasi Pelanggaran Harian
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="label" />
                  <YAxis allowDecimals={false} />
                  <RechartTooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="total"
                    name="Total"
                    stroke="#0B3D91"
                    strokeWidth={3.5}
                    dot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="overLoading"
                    name="Over Loading"
                    stroke="#C50F1F"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="overDimension"
                    name="Over Dimension"
                    stroke="#0063B1"
                    strokeWidth={2.5}
                  />
                  <Line
                    type="monotone"
                    dataKey="normal"
                    name="Over Dimension & Over Loading"
                    stroke="#107C10"
                    strokeWidth={2.5}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-4 border border-[#E1DFDD]">
            <h2 className="text-base font-semibold text-[#323130] mb-3">
              Distribusi Pelanggaran per Kota
            </h2>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <RechartTooltip />
                  <Legend
                    verticalAlign="bottom"
                    formatter={(value) => `${value}`}
                  />
                  <Pie
                    data={cityPieData}
                    cx="50%"
                    cy="45%"
                    labelLine={false}
                    label={renderPieLabel}
                    outerRadius={110}
                    dataKey="value"
                  >
                    {cityPieData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={pieColors[index % pieColors.length]}
                      />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        <Card className="p-4 border border-[#E1DFDD]">
          <h2 className="text-base font-semibold text-[#323130] mb-3">
            Peta Sebaran Titik Pelanggaran Nasional
          </h2>
          <div className="h-[420px] rounded overflow-hidden border border-[#D2D0CE]">
            <MapContainer
              center={[-2.5, 118]}
              zoom={5}
              minZoom={4}
              maxZoom={8}
              maxBounds={[
                [-12, 92],
                [8, 142],
              ]}
              maxBoundsViscosity={1.0}
              style={{ height: "100%", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              {cityTotals.map((city) => (
                <CircleMarker
                  key={city.city}
                  center={[city.lat, city.lng]}
                  radius={10}
                  pathOptions={{
                    color: "#0078D4",
                    fillColor: "#0078D4",
                    fillOpacity: 0.85,
                  }}
                >
                  <Tooltip
                    permanent
                    direction="top"
                    offset={[0, -8]}
                    className="city-badge-tooltip"
                  >
                    <span>
                      {city.city}: {city.total}
                    </span>
                  </Tooltip>
                </CircleMarker>
              ))}
            </MapContainer>
          </div>
        </Card>

        <Card className="p-4 border border-[#E1DFDD]">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h2 className="text-base font-semibold text-[#323130]">
              10 Pelanggaran Terbaru (Lintas Kota)
            </h2>
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                contentBefore={<Search24Regular />}
                placeholder="Cari plate/site/city/id"
                value={search}
                onChange={(_, d) => setSearch(d.value)}
              />
              <select
                className="h-8 border border-[#D1D1D1] rounded px-2 text-sm bg-white"
                value={cityFilter}
                onChange={(e) => setCityFilter(e.target.value)}
              >
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
              <select
                className="h-8 border border-[#D1D1D1] rounded px-2 text-sm bg-white"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
              >
                {types.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[1100px] text-sm">
              <thead>
                <tr className="text-left text-[#605E5C] border-b border-[#E1DFDD]">
                  <th className="py-2 pr-3">Waktu</th>
                  <th className="py-2 pr-3">Kota</th>
                  <th className="py-2 pr-3">Site</th>
                  <th className="py-2 pr-3">Plate</th>
                  <th className="py-2 pr-3">Kelas</th>
                  <th className="py-2 pr-3">Jenis Pelanggaran</th>
                  <th className="py-2 pr-3">Berat (Ton)</th>
                  <th className="py-2 pr-3">Dimensi (P x L x T)</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 10).map((row) => (
                  <tr
                    key={row.id}
                    className="border-b border-[#F3F2F1] hover:bg-[#FAF9F8]"
                  >
                    <td className="py-2 pr-3 text-[#605E5C]">{row.time}</td>
                    <td className="py-2 pr-3 text-[#323130] font-medium">
                      {row.city}
                    </td>
                    <td className="py-2 pr-3 text-[#605E5C]">{row.site}</td>
                    <td className="py-2 pr-3 text-[#323130]">{row.plateNo}</td>
                    <td className="py-2 pr-3 text-[#605E5C]">
                      {row.vehicleClass}
                    </td>
                    <td className="py-2 pr-3">
                      <Badge
                        appearance="filled"
                        color={violationBadgeColor(row.violationType)}
                      >
                        {row.violationType}
                      </Badge>
                    </td>
                    <td className="py-2 pr-3 text-[#323130]">
                      {row.weightTon}
                    </td>
                    <td className="py-2 pr-3 text-[#605E5C]">
                      {row.dimension}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DataCenterModule;
