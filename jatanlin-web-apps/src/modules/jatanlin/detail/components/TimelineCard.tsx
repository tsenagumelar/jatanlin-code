/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader } from "@fluentui/react-components";
import {
  Camera24Regular,
  WeatherMoon24Regular,
  VehicleTruck24Regular,
  Ruler24Regular,
  Checkmark24Filled,
} from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";
import { getMinioImageUrl } from "@/src/utils/image";

interface TimelineCardProps {
  vehicle: VehicleActualData;
}

interface TimelineStep {
  key: string;
  title: string;
  icon: React.ReactElement;
  timestamp: string | null;
  hasData: boolean;
  imageUrl?: string;
  details?: string[];
}

const formatDateTime = (dateString: any) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleString("id-ID", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const TimelineCard: React.FC<TimelineCardProps> = ({ vehicle }) => {
  const steps: TimelineStep[] = [
    {
      key: "anpr",
      title: "ANPR (Pengenalan Plat)",
      icon: <Camera24Regular />,
      timestamp: vehicle.transact_anpr_capture?.created_date,
      hasData: !!vehicle.transact_anpr_capture,
      imageUrl: vehicle.transact_anpr_capture
        ? getMinioImageUrl(
            vehicle.transact_anpr_capture.minio_bucket,
            vehicle.transact_anpr_capture.minio_full_image_object
          )
        : undefined,
      details: vehicle.transact_anpr_capture
        ? [
            `Plat: ${vehicle.transact_anpr_capture.plate_no}`,
            `Tingkat Keyakinan: ${(
              vehicle.transact_anpr_capture.confidence || 0
            ).toFixed(1)}%`,
            `Lokasi: ${vehicle.transact_anpr_capture.location_code || "-"}`,
          ]
        : undefined,
    },
    {
      key: "weighing",
      title: "Penimbangan",
      icon: <WeatherMoon24Regular />,
      timestamp: vehicle.transact_weighing?.created_date,
      hasData: !!vehicle.transact_weighing,
      details: vehicle.transact_weighing
        ? [
            `Total Berat: ${
              vehicle.transact_weighing.total_weight
                ? (vehicle.transact_weighing.total_weight / 1000).toFixed(2)
                : "-"
            } TON`,
            `Total Sumbu: ${vehicle.transact_weighing.total_axle || "-"}`,
          ]
        : undefined,
    },
    {
      key: "axle",
      title: "Deteksi Sumbu",
      icon: <VehicleTruck24Regular />,
      timestamp: vehicle.transact_axle_capture?.created_date,
      hasData: !!vehicle.transact_axle_capture,
      imageUrl: vehicle.transact_axle_capture
        ? getMinioImageUrl(
            vehicle.transact_axle_capture.minio_bucket,
            vehicle.transact_axle_capture.minio_image_object
          )
        : undefined,
      details: vehicle.transact_axle_capture
        ? [
            `Kategori: ${
              vehicle.transact_axle_capture.vehicle_category || "-"
            }`,
            `Tipe Body: ${
              vehicle.transact_axle_capture.vehicle_body_type || "-"
            }`,
            `Total Sumbu: ${vehicle.transact_axle_capture.total_axles || "-"}`,
            `Total Roda: ${vehicle.transact_axle_capture.total_wheels || "-"}`,
          ]
        : undefined,
    },
    {
      key: "dimension",
      title: "Pengukuran Dimensi",
      icon: <Ruler24Regular />,
      timestamp: vehicle.transact_dimension?.created_date,
      hasData: !!vehicle.transact_dimension,
      imageUrl: vehicle.transact_dimension
        ? getMinioImageUrl(
            vehicle.transact_anpr_capture.minio_bucket,
            vehicle.transact_anpr_capture.minio_full_image_object
          )
        : undefined,
      details: vehicle.transact_dimension
        ? [
            `Panjang: ${vehicle.transact_dimension.length || "-"} m`,
            `Lebar: ${vehicle.transact_dimension.width || "-"} m`,
            `Tinggi: ${vehicle.transact_dimension.height || "-"} m`,
          ]
        : undefined,
    },
  ];

  return (
    <Card>
      <CardHeader
        header={
          <div className="text-lg font-semibold">
            Timeline Proses Pengambilan Data
          </div>
        }
      />
      <div className="p-6">
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />

          {/* Timeline Steps */}
          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.key} className="relative pl-16">
                {/* Step Icon */}
                <div
                  className={`absolute left-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    step.hasData
                      ? "bg-blue-500 text-white"
                      : "bg-gray-200 text-gray-400"
                  }`}
                >
                  {step.hasData ? (
                    <Checkmark24Filled className="text-white" />
                  ) : (
                    step.icon
                  )}
                </div>

                {/* Step Content */}
                <div className={`${!step.hasData && "opacity-50"}`}>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-base font-semibold text-gray-900">
                      {step.title}
                    </h3>
                    {step.timestamp && (
                      <span className="text-sm text-gray-500">
                        {formatDateTime(step.timestamp)}
                      </span>
                    )}
                  </div>

                  {step.hasData ? (
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Details */}
                        {step.details && (
                          <div className="space-y-2">
                            {step.details.map((detail, idx) => (
                              <div key={idx} className="text-sm">
                                <span className="text-gray-600">{detail}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* Image */}
                        {step.imageUrl && (
                          <div className="relative w-full h-30">
                            <Image
                              src={step.imageUrl}
                              alt={step.title}
                              fill
                              className="object-contain"
                              onError={(e) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                      <p className="text-sm text-gray-500">
                        Data belum tersedia
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
