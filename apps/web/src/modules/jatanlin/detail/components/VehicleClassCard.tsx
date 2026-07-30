/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardHeader, Spinner } from "@fluentui/react-components";
import { Classification24Regular } from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";

interface VehicleClassCardProps {
  vehicle: VehicleActualData;
}

export const VehicleClassCard: React.FC<VehicleClassCardProps> = ({
  vehicle,
}) => {
  const actualAxle = vehicle.transact_weighing?.total_axle || vehicle.actual_total_axle || 0;

  // Fetch vehicle classes
  const { data, loading } = useGetVehicleClassesQuery({
    variables: {
      limit: 100,
      offset: 0,
      where: {},
    },
  });

  // Find matching or closest vehicle class by axle count
  const findVehicleClass = () => {
    if (!data?.master_vehicle_class) return null;

    const classes = data.master_vehicle_class;

    // First try exact match
    const exactMatch = classes.find((c: any) => c.total_axle === actualAxle);
    if (exactMatch) return exactMatch;

    // Find closest match (prefer lower axle count)
    const sorted = [...classes].sort((a: any, b: any) => {
      const diffA = Math.abs(a.total_axle - actualAxle);
      const diffB = Math.abs(b.total_axle - actualAxle);
      if (diffA === diffB) {
        // If difference is same, prefer lower axle
        return a.total_axle - b.total_axle;
      }
      return diffA - diffB;
    });

    return sorted[0] || null;
  };

  const vehicleClass = findVehicleClass();
  const class2Weight =
    vehicleClass?.class_2_weight != null
      ? Number(vehicleClass.class_2_weight)
      : null;
  const class3Weight =
    vehicleClass?.class_3_weight != null
      ? Number(vehicleClass.class_3_weight)
      : null;
  const class2WeightTon =
    class2Weight != null && Number.isFinite(class2Weight)
      ? class2Weight / 1000
      : null;
  const class3WeightTon =
    class3Weight != null && Number.isFinite(class3Weight)
      ? class3Weight / 1000
      : null;
  const weightDisplay =
    vehicleClass && class2WeightTon != null
      ? vehicleClass.total_axle >= 6
        ? `${class2WeightTon.toFixed(2)} ton / sumbu`
        : class3WeightTon != null && class2Weight === class3Weight
        ? `± ${class2WeightTon.toFixed(2)} ton`
        : class3WeightTon != null
        ? `${class2WeightTon.toFixed(2)} ton - ${class3WeightTon.toFixed(2)} ton`
        : `${class2WeightTon.toFixed(2)} ton`
      : "-";

  if (loading) {
    return (
      <Card>
        <div className="p-6 flex items-center justify-center">
          <Spinner label="Memuat data kelas kendaraan..." />
        </div>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        header={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Classification24Regular />
            Kelas Kendaraan & Batas Legal
          </div>
        }
      />
      <div className="p-6">
        {vehicleClass ? (
          <div className="space-y-4">
            {/* Vehicle Class Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="w-1/4">
                  <p className="text-xs font-medium text-blue-600 uppercase mb-1">
                    Kelas Kendaraan
                  </p>
                  <p className="text-xl font-bold text-blue-900">
                    {vehicleClass.type}
                  </p>
                  {vehicleClass.description && (
                    <p className="text-sm text-blue-700 mt-1">
                      {vehicleClass.description}
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-3/4">
                  {/* Berat Batas Legal */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">
                      Berat (Batas Legal)
                    </p>
                    <p className="text-lg font-bold text-gray-900">
                      {weightDisplay}
                    </p>
                  </div>

                  {/* Panjang */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Panjang</p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicleClass.length || "-"}
                      {vehicleClass.length && (
                        <span className="text-sm text-gray-500 ml-1">m</span>
                      )}
                    </p>
                  </div>

                  {/* Lebar */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Lebar</p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicleClass.width || "-"}
                      {vehicleClass.width && (
                        <span className="text-sm text-gray-500 ml-1">m</span>
                      )}
                    </p>
                  </div>

                  {/* Tinggi */}
                  <div className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                    <p className="text-xs text-gray-500 mb-1">Tinggi</p>
                    <p className="text-lg font-bold text-gray-900">
                      {vehicleClass.height || "-"}
                      {vehicleClass.height && (
                        <span className="text-sm text-gray-500 ml-1">m</span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Axle Match Info */}
            {vehicleClass.total_axle !== actualAxle && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-xs text-yellow-800">
                  <strong>Catatan:</strong> Kelas kendaraan ini adalah yang
                  paling mendekati dengan total sumbu aktual ({actualAxle}{" "}
                  sumbu). Kelas ini memiliki {vehicleClass.total_axle} sumbu.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-gray-500">
              Tidak ditemukan data kelas kendaraan yang sesuai
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
