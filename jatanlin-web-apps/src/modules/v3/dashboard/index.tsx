"use client";

import { useV3Dashboard } from "./hooks";
import { V3DefaultPage } from "../shared/DefaultPage";
import Link from "next/link";
import {
  Pie,
  PieChart,
  Cell,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  CalendarLtr24Regular,
  CheckmarkCircle24Regular,
  VehicleTruckProfile24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";
import type { ReactElement } from "react";
import type { V3DashboardMetric } from "./types";

const toneClasses: Record<V3DashboardMetric["tone"], string> = {
  danger: "bg-red-50 text-red-700 border-red-100",
  warning: "bg-amber-50 text-amber-700 border-amber-100",
  success: "bg-emerald-50 text-emerald-700 border-emerald-100",
  info: "bg-sky-50 text-sky-700 border-sky-100",
};

const metricIcons: Record<V3DashboardMetric["icon"], ReactElement> = {
  odol: <VehicleTruckProfile24Regular />,
  violation: <Warning24Regular />,
  normal: <CheckmarkCircle24Regular />,
  today: <CalendarLtr24Regular />,
};

function MetricCard({ metric }: { metric: V3DashboardMetric }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border text-lg ${toneClasses[metric.tone]}`}
      >
        {metricIcons[metric.icon]}
      </div>
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-500">
          {metric.label}
        </p>
        <p className="mt-1 text-2xl font-extrabold tracking-tight text-slate-950">
          {metric.value.toLocaleString("en-US")}
        </p>
      </div>
    </div>
  );
}

export function V3DashboardPage() {
  const {
    title,
    description,
    metrics,
    trendData,
    distributionData,
    recentViolations,
    isLoading,
    error,
  } = useV3Dashboard();

  return (
    <V3DefaultPage
      title={title}
      breadcrumbs={[{ label: "Dashboard" }]}
      description={description}
    >
      {error && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {metrics.map((metric) => (
          <MetricCard key={metric.label} metric={metric} />
        ))}
      </div>

      <div className="mt-4 grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.35fr)_minmax(320px,0.65fr)]">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-950">
              Enforcement Total - Last 7 Days
            </h2>
            <p className="text-sm text-slate-500">
              Over dimension, over loading, and normal vehicles per day.
            </p>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "#64748b" }}
                  tickLine={false}
                  axisLine={false}
                />
                <Tooltip />
                <Line
                  name="Over Dimension"
                  type="monotone"
                  dataKey="overDimension"
                  stroke="#dc2626"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  name="Over Loading"
                  type="monotone"
                  dataKey="overLoading"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
                <Line
                  name="Normal"
                  type="monotone"
                  dataKey="normal"
                  stroke="#059669"
                  strokeWidth={3}
                  dot={{ r: 3, strokeWidth: 2 }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-red-600" />
              Over Dimension
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-amber-500" />
              Over Loading
            </span>
            <span className="flex items-center gap-2">
              <span className="h-2.5 w-2.5 rounded-full bg-emerald-600" />
              Normal
            </span>
          </div>
        </div>

        <div className="min-w-0 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-3">
            <h2 className="text-base font-bold text-slate-950">
              Violation Distribution
            </h2>
            <p className="text-sm text-slate-500">
              Over dimension, over loading, and normal.
            </p>
          </div>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={distributionData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={62}
                  outerRadius={96}
                  paddingAngle={3}
                >
                  {distributionData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-1 space-y-1.5">
            {distributionData.map((item) => (
              <div
                key={item.name}
                className="flex items-center justify-between text-sm"
              >
                <span className="flex items-center gap-2 font-medium text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  {item.name}
                </span>
                <span className="font-bold text-slate-950">
                  {item.value.toLocaleString("en-US")}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="min-w-0 rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-base font-bold text-slate-950">
              Latest 10 Violation Summary
            </h2>
            <p className="text-sm text-slate-500">
              Latest vehicles detected with violations.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1080px] text-left text-sm">
              <thead className="bg-slate-50 text-xs font-bold uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-4 py-3">No</th>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Plate No</th>
                  <th className="px-4 py-3">Location</th>
                  <th className="px-4 py-3">Violation Type</th>
                  <th className="px-4 py-3">Article</th>
                  <th className="px-4 py-3">Officer</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentViolations.length > 0 ? (
                  recentViolations.map((row) => (
                    <tr key={row.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 font-semibold text-slate-500">
                        {row.no}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-600">
                        {row.time}
                      </td>
                      <td className="px-4 py-3 font-bold text-slate-950">
                        {row.plate}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.location}
                      </td>
                      <td className="px-4 py-3 text-slate-600">{row.type}</td>
                      <td className="px-4 py-3 font-semibold text-slate-700">
                        {row.article}
                      </td>
                      <td className="px-4 py-3 text-slate-600">
                        {row.officer}
                      </td>
                      <td className="px-4 py-3">
                        <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/v3/transaction/jatanlin/detail/${row.id}`}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                          >
                            View
                          </Link>
                          <Link
                            href={`/v3/transaction/jatanlin/verify/${row.id}`}
                            className="rounded-lg bg-blue-700 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-800"
                          >
                            Verify
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-8 text-center font-medium text-slate-500"
                    >
                      No violation data available.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {isLoading && (
        <p className="mt-4 text-sm font-medium text-slate-500">
          Loading dashboard data...
        </p>
      )}
    </V3DefaultPage>
  );
}
