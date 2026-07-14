/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardHeader } from "@fluentui/react-components";
import { VehicleCar24Regular } from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";

interface VehicleInfoCardProps {
  vehicle: VehicleActualData;
}

export const VehicleInfoCard: React.FC<VehicleInfoCardProps> = ({
  vehicle,
}) => {
  const locationAddress =
    vehicle.location_address ||
    vehicle.transact_anpr_capture?.location_code ||
    "-";
  const locationCoords =
    vehicle.location_lat != null && vehicle.location_lng != null
      ? `${vehicle.location_lat}, ${vehicle.location_lng}`
      : "-";

  return (
    <Card className="h-full">
      <CardHeader
        header={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <VehicleCar24Regular />
            Informasi Kendaraan
          </div>
        }
      />
      <div className="p-6">
        <div className="space-y-6">
          {/* Row 1: Plat Nomor dan Total Sumbu */}
          <div className="grid grid-cols-2 gap-6">
            {/* Plat Nomor */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Plat Nomor
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicle.actual_plat_no ||
                  vehicle.transact_anpr_capture?.plate_no ||
                  "-"}
              </p>
            </div>

            {/* Total Sumbu */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Total Sumbu
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || "-"}
                {(vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle) && (
                  <span className="text-base text-gray-500 ml-1">sumbu</span>
                )}
              </p>
            </div>
          </div>

          {/* Row 2: Berat dan Dimensi */}
          <div className="grid grid-cols-2 gap-6">
            {/* Berat Aktual */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Berat Aktual
              </p>
              <p className="text-2xl font-bold text-gray-900">
                {vehicle.actual_weight
                  ? (vehicle.actual_weight / 1000).toFixed(2)
                  : "-"}
                {vehicle.actual_weight && (
                  <span className="text-base text-gray-500 ml-1">TON</span>
                )}
              </p>
            </div>

            {/* Dimensi Aktual */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Dimensi Aktual (P × L × T)
              </p>
              <p className="text-lg font-bold text-gray-900">
                {vehicle.actual_length || "-"} × {vehicle.actual_width || "-"} ×{" "}
                {vehicle.actual_height || "-"}
                {(vehicle.actual_length ||
                  vehicle.actual_width ||
                  vehicle.actual_height) && (
                  <span className="text-sm text-gray-500 ml-1">m</span>
                )}
              </p>
            </div>
          </div>

          {/* Row 3: Lokasi */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Alamat Lokasi */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Lokasi
              </p>
              <p className="text-base font-semibold text-gray-900">
                {locationAddress}
              </p>
            </div>

            {/* Koordinat */}
            <div className="space-y-1">
              <p className="text-xs font-medium text-gray-500 uppercase">
                Koordinat
              </p>
              <p className="text-base font-semibold text-gray-900">
                {locationCoords}
              </p>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};
