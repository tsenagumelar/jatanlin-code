"use client";

import React, { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Card, Spinner, Badge, Button } from "@fluentui/react-components";
import {
  VehicleTruckProfile24Regular,
  Warning24Filled,
  ScaleFill24Regular,
  Checkmark24Regular,
  ArrowRight16Regular,
  Eye24Regular,
  CheckmarkCircle24Regular,
  ArrowTrendingLines24Regular,
  Clock24Regular,
} from "@fluentui/react-icons";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { useGetVehicleActualsQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetConfigsQuery } from "@/src/graphql/hooks/configuration";
import {
  checkOdolViolation,
  VehicleActual,
  VehicleClassLimit,
  getOdolTolerances,
} from "@/src/utils/odol";

interface DashboardStats {
  totalVehicles: number;
  overweight: number;
  overdimension: number;
  normal: number;
}

interface ChartDataPoint {
  date: string;
  total: number;
  odolBerat: number;
  odolDimensi: number;
  normal: number;
}

interface ViolationRecord {
  id: string;
  plateNo: string;
  dateTime: string;
  weight: number;
  lwh: string;
  axleCount: number;
  violationType: string;
  status: string;
}

const formatDateTime = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("id-ID", {
    day: "2-digit",
    month: "short",
  });
};

const formatLwh = (length: number, width: number, height: number) => {
  if (!length && !width && !height) return "-";
  return `${length} x ${width} x ${height}`;
};

export const BerandaModule: React.FC = () => {
  const router = useRouter();

  // Fetch vehicle data (last 30 days worth of data)
  const { data: vehicleData, loading: vehicleLoading } =
    useGetVehicleActualsQuery({
      variables: {
        limit: 500,
        offset: 0,
      },
    });

  // Fetch vehicle classes for violation calculation
  const { data: vehicleClassesData } = useGetVehicleClassesQuery({
    variables: {
      limit: 100,
      offset: 0,
    },
  });

  const { data: configData } = useGetConfigsQuery({
    variables: {
      limit: 10,
      offset: 0,
      where: { config_key: { _in: ["TOLERANCE_WEIGHT", "TOLERANCE_DIM"] } },
    },
  });

  // Calculate stats and prepare data
  const { stats, chartData, recentViolations } = useMemo(() => {
    const vehicles = vehicleData?.transact_vehicle_actual || [];
    const vehicleClasses = vehicleClassesData?.master_vehicle_class || [];
    const tolerances = getOdolTolerances(configData?.master_config);
    const today = new Date();
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - 6);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Find vehicle class by axle count
    const findVehicleClass = (axleCount: number) => {
      return vehicleClasses.find((vc) => vc.total_axle === axleCount) || null;
    };

    // Initialize stats
    const statsData: DashboardStats = {
      totalVehicles: 0,
      overweight: 0,
      overdimension: 0,
      normal: 0,
    };

    // Collect violations and chart data
    const violations: ViolationRecord[] = [];
    const dateMap = new Map<
      string,
      { total: number; odolBerat: number; odolDimensi: number; normal: number }
    >();

    vehicles.forEach((vehicle) => {
      const createdDate = vehicle.created_date
        ? new Date(vehicle.created_date)
        : null;
      if (!createdDate || createdDate < startDate || createdDate > endDate) {
        return;
      }

      statsData.totalVehicles++;
      const axleCount =
        vehicle.actual_total_axle ||
        vehicle.transact_axle_capture?.total_axles ||
        0;
      const vehicleClass = findVehicleClass(axleCount);
      const latestStatus = vehicle.transact_vehicle_statuses?.[0];
      const verificationStatus = latestStatus?.status || "pending";

      // Get actual values - weight in TON for comparison
      const actual: VehicleActual = {
        total_weight: (vehicle.actual_weight || 0) / 1000, // Convert KG to TON
        length:
          vehicle.actual_length || vehicle.transact_dimension?.length || 0,
        width: vehicle.actual_width || vehicle.transact_dimension?.width || 0,
        height:
          vehicle.actual_height || vehicle.transact_dimension?.height || 0,
      };

      let violationType = "Normal";

      if (vehicleClass) {
        const class2Weight =
          vehicleClass.class_2_weight != null
            ? Number(vehicleClass.class_2_weight)
            : null;
        const class3Weight =
          vehicleClass.class_3_weight != null
            ? Number(vehicleClass.class_3_weight)
            : null;
        const class2WeightTon =
          class2Weight != null && Number.isFinite(class2Weight)
            ? class2Weight / 1000
            : 0;
        const class3WeightTon =
          class3Weight != null && Number.isFinite(class3Weight)
            ? class3Weight / 1000
            : 0;
        const limit: VehicleClassLimit = {
          ...vehicleClass,
          class_2_weight: class2WeightTon.toString(),
          class_3_weight: class3WeightTon.toString(),
        };
        violationType = checkOdolViolation(actual, limit, {
          axleCount,
          toleranceWeightPercent: tolerances.weightPercent,
          toleranceDimPercent: tolerances.dimPercent,
        });
      }

      const verifiedResult =
        verificationStatus === "verified" ? latestStatus?.result : null;

      // If status is "rejected", treat as normal (pelanggaran ditolak = tidak dianggap pelanggaran)
      const effectiveViolationType =
        verificationStatus === "rejected"
          ? "Normal"
          : verifiedResult || violationType;

      // Update stats based on effective violation type
      if (effectiveViolationType === "Normal") {
        statsData.normal++;
      } else if (effectiveViolationType === "Over Loading") {
        statsData.overweight++;
      } else if (effectiveViolationType === "Over Dimension") {
        statsData.overdimension++;
      } else if (effectiveViolationType === "Over Dimension & Over Loading") {
        statsData.overweight++;
        statsData.overdimension++;
      }

      // Add to violations list if not normal (use effective type)
      if (effectiveViolationType !== "Normal") {
        const lengthValue =
          vehicle.actual_length || vehicle.transact_dimension?.length || 0;
        const widthValue =
          vehicle.actual_width || vehicle.transact_dimension?.width || 0;
        const heightValue =
          vehicle.actual_height || vehicle.transact_dimension?.height || 0;

        violations.push({
          id: vehicle.id,
          plateNo:
            vehicle.actual_plat_no ||
            vehicle.transact_anpr_capture?.plate_no ||
            "-",
          dateTime: vehicle.created_date || "",
          weight: vehicle.actual_weight || 0,
          lwh: formatLwh(lengthValue, widthValue, heightValue),
          axleCount,
          violationType: effectiveViolationType,
          status: verificationStatus,
        });
      }

      // Aggregate by date for chart (use effective violation type)
      const dateKey = createdDate.toISOString().split("T")[0];

      if (dateKey) {
        const existing = dateMap.get(dateKey) || {
          total: 0,
          odolBerat: 0,
          odolDimensi: 0,
          normal: 0,
        };
        existing.total++;

        if (effectiveViolationType === "Normal") {
          existing.normal++;
        } else if (effectiveViolationType === "Over Loading") {
          existing.odolBerat++;
        } else if (effectiveViolationType === "Over Dimension") {
          existing.odolDimensi++;
        } else if (effectiveViolationType === "Over Dimension & Over Loading") {
          existing.odolBerat++;
          existing.odolDimensi++;
        }

        dateMap.set(dateKey, existing);
      }
    });

    // Convert date map to chart data array (last 7 days)
    const chartDataArray: ChartDataPoint[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateKey = date.toISOString().split("T")[0];
      const data = dateMap.get(dateKey) || {
        total: 0,
        odolBerat: 0,
        odolDimensi: 0,
        normal: 0,
      };

      chartDataArray.push({
        date: formatDate(dateKey),
        total: data.total,
        odolBerat: data.odolBerat,
        odolDimensi: data.odolDimensi,
        normal: data.normal,
      });
    }

    // Sort violations by date (newest first) and take top 10
    const recentViolationsList = violations
      .sort(
        (a, b) =>
          new Date(b.dateTime).getTime() - new Date(a.dateTime).getTime(),
      )
      .slice(0, 10);

    return {
      stats: statsData,
      chartData: chartDataArray,
      recentViolations: recentViolationsList,
    };
  }, [vehicleData, vehicleClassesData, configData]);

  const handleViewDetail = (id: string) => {
    router.push(`/jatanlin/${id}`);
  };

  const handleVerify = (id: string) => {
    router.push(`/jatanlin/${id}/verify`);
  };

  const handleViewAll = () => {
    router.push("/jatanlin");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "verified":
        return (
          <Badge size="extra-large" appearance="filled" color="success">
            Terverifikasi
          </Badge>
        );
      case "rejected":
        return (
          <Badge size="extra-large" appearance="filled" color="danger">
            Ditolak
          </Badge>
        );
      case "draft":
        return (
          <Badge size="extra-large" appearance="filled" color="informative">
            Draf
          </Badge>
        );
      default:
        return (
          <Badge size="extra-large" appearance="filled" color="warning">
            Menunggu
          </Badge>
        );
    }
  };

  const getViolationBadge = (type: string) => {
    switch (type) {
      case "Over Loading":
        return (
          <Badge size="extra-large" appearance="ghost" color="danger">
            Over Loading
          </Badge>
        );
      case "Over Dimension":
        return (
          <Badge size="extra-large" appearance="ghost" color="danger">
            Over Dimension
          </Badge>
        );
      case "Over Dimension & Over Loading":
        return (
          <Badge size="extra-large" appearance="ghost" color="danger">
            Over Loading & Over Dimension
          </Badge>
        );
      default:
        return (
          <Badge size="extra-large" appearance="ghost" color="success">
            Normal
          </Badge>
        );
    }
  };

  // Prepare pie chart data
  const pieData = useMemo(
    () => [
      { name: "Normal", value: stats.normal, color: "#22c55e" },
      { name: "Over Loading", value: stats.overweight, color: "#ef4444" },
      { name: "Over Dimension", value: stats.overdimension, color: "#f97316" },
    ],
    [stats],
  );

  // Calculate percentages
  const getPercentage = (value: number) => {
    if (stats.totalVehicles === 0) return 0;
    return ((value / stats.totalVehicles) * 100).toFixed(1);
  };

  if (vehicleLoading) {
    return (
      <div className="min-h-[60vh] grid place-items-center bg-gray-50">
        <Spinner size="large" label="Memuat data dashboard..." />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 space-y-6 bg-gray-50 pb-12">
        {/* Header with Welcome */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Dashboard JATANLIN
            </h1>
            <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
              <Clock24Regular className="w-4 h-4" />
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Stats Cards - Modern gradient design with better contrast */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Total Kendaraan */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-blue-600 to-blue-800 p-5 text-white shadow-lg shadow-blue-600/30 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/25 flex items-center justify-center backdrop-blur-sm">
                  <VehicleTruckProfile24Regular className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold bg-white/25 px-2 py-1 rounded-full">
                  100%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1 drop-shadow-sm">
                {stats.totalVehicles}
              </p>
              <p className="text-base text-blue-100 font-bold">
                Total Kendaraan Terdeteksi
              </p>
            </div>
          </div>

          {/* Melebihi Muatan */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-red-600 to-red-800 p-5 text-white shadow-lg shadow-red-600/30 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/25 flex items-center justify-center backdrop-blur-sm">
                  <ScaleFill24Regular className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold bg-white/25 px-2 py-1 rounded-full">
                  {getPercentage(stats.overweight)}%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1 drop-shadow-sm">
                {stats.overweight}
              </p>
              <p className="text-base text-red-100 font-bold">
                Melebihi Muatan
              </p>
            </div>
          </div>

          {/* Melebihi Dimensi */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-amber-600 to-orange-700 p-5 text-white shadow-lg shadow-orange-600/30 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/25 flex items-center justify-center backdrop-blur-sm">
                  <Warning24Filled className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold bg-white/25 px-2 py-1 rounded-full">
                  {getPercentage(stats.overdimension)}%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1 drop-shadow-sm">
                {stats.overdimension}
              </p>
              <p className="text-base text-orange-100 font-bold">
                Melebihi Dimensi
              </p>
            </div>
          </div>

          {/* Kendaraan Normal */}
          <div className="relative overflow-hidden rounded-xl bg-linear-to-br from-emerald-600 to-green-800 p-5 text-white shadow-lg shadow-green-600/30 transition-transform hover:scale-[1.02]">
            <div className="absolute top-0 right-0 -mt-4 -mr-4 h-24 w-24 rounded-full bg-white/10"></div>
            <div className="absolute bottom-0 left-0 -mb-6 -ml-6 h-20 w-20 rounded-full bg-white/10"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 rounded-lg bg-white/25 flex items-center justify-center backdrop-blur-sm">
                  <Checkmark24Regular className="w-6 h-6 text-white" />
                </div>
                <span className="text-sm font-bold bg-white/25 px-2 py-1 rounded-full">
                  {getPercentage(stats.normal)}%
                </span>
              </div>
              <p className="text-3xl font-bold mb-1 drop-shadow-sm">
                {stats.normal}
              </p>
              <p className="text-base text-green-100 font-bold">
                Kendaraan Normal
              </p>
            </div>
          </div>
        </div>

        {/* Charts Section - Line Chart and Pie Chart side by side */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Line Chart - 2/3 width */}
          <Card className="lg:col-span-2 p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Tren Penindakan 7 Hari Terakhir
              </h2>
              <p className="text-sm text-gray-500">
                Statistik harian kendaraan terdeteksi
              </p>
            </div>

            {chartData.length > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={chartData}
                    margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e5e7eb"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12, fill: "#6b7280" }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgb(0 0 0 / 0.15)",
                      }}
                    />
                    <Legend
                      verticalAlign="top"
                      height={36}
                      iconType="circle"
                      iconSize={8}
                    />
                    <Line
                      type="monotone"
                      dataKey="total"
                      name="Total"
                      stroke="#3b82f6"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="odolBerat"
                      name="Over Loading"
                      stroke="#ef4444"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="odolDimensi"
                      name="Over Dimension"
                      stroke="#f97316"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="normal"
                      name="Normal"
                      stroke="#22c55e"
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, strokeWidth: 2, fill: "#fff" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <ArrowTrendingLines24Regular className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Belum ada data untuk ditampilkan</p>
                </div>
              </div>
            )}
          </Card>

          {/* Pie Chart - 1/3 width */}
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Distribusi Status
              </h2>
              <p className="text-sm text-gray-500">Persentase per kategori</p>
            </div>

            {stats.totalVehicles > 0 ? (
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="45%"
                      innerRadius={50}
                      outerRadius={80}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#fff",
                        border: "none",
                        borderRadius: "12px",
                        boxShadow: "0 10px 40px rgb(0 0 0 / 0.15)",
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-4 -mt-4">
                  {pieData.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: item.color }}
                      ></div>
                      <span className="text-xs text-gray-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-72 flex items-center justify-center text-gray-400">
                <p>Belum ada data</p>
              </div>
            )}
          </Card>
        </div>

        {/* Recent Violations - Modern Table Design */}
        <Card className="p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                Pelanggaran Terbaru
              </h2>
              <p className="text-sm text-gray-500">
                10 data pelanggaran terakhir yang terdeteksi
              </p>
            </div>
            <Button
              appearance="outline"
              icon={<ArrowRight16Regular />}
              iconPosition="after"
              onClick={handleViewAll}
            >
              Lihat Semua
            </Button>
          </div>

          {recentViolations.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      No
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Plat Nomor
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Waktu
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Berat (KG)
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      P x L x T (m)
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jumlah Sumbu
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Jenis Pelanggaran
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Aksi
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentViolations.map((violation, index) => (
                    <tr
                      key={violation.id}
                      className="hover:bg-gray-50 transition-colors cursor-pointer"
                      onClick={() => handleViewDetail(violation.id)}
                    >
                      <td className="py-4 px-4 text-sm text-gray-500">
                        {index + 1}
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-900 bg-gray-100 px-2 py-1 rounded">
                          {violation.plateNo}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {formatDateTime(violation.dateTime)}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-900">
                        {violation.weight.toLocaleString("id-ID")}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {violation.lwh}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {violation.axleCount || "-"}
                      </td>
                      <td className="py-4 px-4">
                        {getViolationBadge(violation.violationType)}
                      </td>
                      <td className="py-4 px-4">
                        {getStatusBadge(violation.status)}
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex gap-2">
                          <Button
                            icon={<Eye24Regular />}
                            size="small"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetail(violation.id);
                            }}
                            title="Detail"
                          />
                          {violation.status !== "verified" &&
                            violation.status !== "rejected" && (
                              <Button
                                icon={<CheckmarkCircle24Regular />}
                                size="small"
                                appearance="primary"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleVerify(violation.id);
                                }}
                                title="Verifikasi"
                              />
                            )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-16 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
                <Checkmark24Regular className="w-8 h-8 text-gray-400" />
              </div>
              <p className="text-gray-500 font-medium">Tidak ada pelanggaran</p>
              <p className="text-sm text-gray-400 mt-1">
                Semua kendaraan dalam kondisi normal
              </p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BerandaModule;
