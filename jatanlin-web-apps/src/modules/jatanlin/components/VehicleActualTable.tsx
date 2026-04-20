/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import Image from "next/image";
import { Button, Badge } from "@fluentui/react-components";
import {
  Eye24Regular,
  CheckmarkCircle24Regular,
  ImageOff24Regular,
} from "@fluentui/react-icons";
import { DataTable, Column } from "@/src/components/organisms/DataTable";
import type { VehicleActualData } from "../types";
import { getMinioImageUrl } from "@/src/utils/image";

interface VehicleActualTableProps {
  vehicleActuals: VehicleActualData[];
  loading: boolean;
  onView: (vehicleActual: VehicleActualData) => void;
  onVerify: (vehicleActual: VehicleActualData) => void;
}

const formatDateTime = (dateString: string | null) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getStatusBadge = (statuses: any[]) => {
  if (!statuses || statuses.length === 0) {
    return (
      <Badge appearance="filled" color="brand" size="extra-large">
        Perlu Ditinjau
      </Badge>
    );
  }

  const latestStatus = statuses[0].status;

  switch (latestStatus) {
    case "verified":
      return (
        <Badge appearance="filled" color="success" size="extra-large">
          Terverifikasi
        </Badge>
      );
    case "rejected":
      return (
        <Badge appearance="filled" color="danger" size="extra-large">
          Disangkal
        </Badge>
      );
    case "draft":
      return (
        <Badge appearance="filled" color="informative" size="extra-large">
          Dalam Proses
        </Badge>
      );
    case "pending":
      return (
        <Badge appearance="filled" color="warning" size="extra-large">
          Perlu Ditinjau
        </Badge>
      );
    default:
      return (
        <Badge appearance="filled" color="warning" size="extra-large">
          Perlu Ditinjau
        </Badge>
      );
  }
};

const getViolationType = (statuses: any[]) => {
  if (!statuses || statuses.length === 0) {
    return <span className="text-gray-500">-</span>;
  }

  const result = statuses[0].result || "-";
  if (result === "Normal") {
    return <span className="text-gray-900">{result}</span>;
  }

  return <span className="text-red-600 font-semibold">{result}</span>;
};

const getLatestStatus = (statuses: any[]) => {
  if (!statuses || statuses.length === 0) {
    return "pending";
  }
  return statuses[0].status;
};

const VehicleImage: React.FC<{ vehicle: VehicleActualData }> = ({
  vehicle,
}) => {
  const [imageError, setImageError] = React.useState(false);
  const imageUrl = vehicle.transact_anpr_capture
    ? getMinioImageUrl(
        vehicle.transact_anpr_capture.minio_bucket,
        vehicle.transact_anpr_capture.minio_full_image_object
      )
    : "";

  if (!imageUrl || imageError) {
    return (
      <div className="w-20 h-12 flex items-center justify-center bg-gray-100 rounded border border-gray-200">
        <ImageOff24Regular className="text-gray-400" />
      </div>
    );
  }

  console.log("Rendering image:", imageUrl);

  return (
    <Image
      src={imageUrl}
      alt="Kendaraan"
      width={80}
      height={48}
      className="w-20 h-12 object-cover rounded border border-gray-200"
      onError={() => setImageError(true)}
    />
  );
};

export const VehicleActualTable: React.FC<VehicleActualTableProps> = ({
  vehicleActuals,
  loading,
  onView,
  onVerify,
}) => {
  const columns: Column<VehicleActualData>[] = [
    {
      key: "image",
      header: "",
      width: "100px",
      render: (vehicle) => <VehicleImage vehicle={vehicle} />,
    },
    {
      key: "plate_no",
      header: "Plat Nomor",
      width: "150px",
      render: (vehicle) => (
        <span className="font-medium">
          {vehicle.actual_plat_no ||
            vehicle.transact_anpr_capture?.plate_no ||
            "-"}
        </span>
      ),
    },
    {
      key: "captured_at",
      header: "Waktu Kejadian",
      width: "150px",
      render: (vehicle) => (
        <span>
          {formatDateTime(
            vehicle.transact_anpr_capture?.captured_at || vehicle.created_date
          )}
        </span>
      ),
    },
    {
      key: "location_address",
      header: "Alamat Lokasi",
      width: "220px",
      render: (vehicle) => <span>{vehicle.location_address || "-"}</span>,
    },
    {
      key: "dimensions",
      header: "Dimensi (P×L×T m)",
      width: "160px",
      render: (vehicle) => (
        <span>
          {vehicle.actual_length || "-"} × {vehicle.actual_width || "-"} ×{" "}
          {vehicle.actual_height || "-"}
        </span>
      ),
    },
    {
      key: "weight",
      header: "Berat (kg)",
      width: "120px",
      render: (vehicle) => (
        <span>
          {vehicle.actual_weight != null
            ? Number(vehicle.actual_weight).toLocaleString("id-ID")
            : "-"}
        </span>
      ),
    },
    {
      key: "axle",
      header: "Jumlah Sumbu",
      width: "120px",
      render: (vehicle) => <span>{vehicle.actual_total_axle || "-"}</span>,
    },
    {
      key: "violation",
      header: "Jenis Pelanggaran",
      width: "180px",
      render: (vehicle) => (
        <span className="text-sm">
          {getViolationType(vehicle.transact_vehicle_statuses || [])}
        </span>
      ),
    },
    {
      key: "status",
      header: "Status",
      width: "150px",
      render: (vehicle) =>
        getStatusBadge(vehicle.transact_vehicle_statuses || []),
    },
    {
      key: "actions",
      header: "Aksi",
      width: "120px",
      render: (vehicle) => {
        const status = getLatestStatus(vehicle.transact_vehicle_statuses || []);
        const showVerify = status === "draft" || status === "pending";

        return (
          <div className="flex gap-2">
            <Button
              icon={<Eye24Regular />}
              size="small"
              onClick={() => onView(vehicle)}
              title="Detail"
            />
            {showVerify && (
              <Button
                icon={<CheckmarkCircle24Regular />}
                size="small"
                appearance="primary"
                onClick={() => onVerify(vehicle)}
                title="Verifikasi"
              />
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      data={vehicleActuals}
      columns={columns}
      loading={loading}
      emptyMessage="Tidak ada data transaksi kendaraan"
    />
  );
};
