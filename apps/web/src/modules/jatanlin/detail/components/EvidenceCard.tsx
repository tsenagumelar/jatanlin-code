/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import Image from "next/image";
import { Card, CardHeader } from "@fluentui/react-components";
import {
  DocumentBulletList24Regular,
  ImageOff24Regular,
} from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";
import { getImageUrl } from "@/src/utils/image";

interface EvidenceCardProps {
  vehicle: VehicleActualData;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ vehicle }) => {
  // Collect all attachments from vehicle statuses
  const attachments =
    vehicle.transact_vehicle_statuses?.flatMap((status: any) => {
      const files = Array.isArray(status.attachment)
        ? status.attachment
        : status.attachment
        ? [status.attachment]
        : [];

      return files.map((attachment: string, index: number) => ({
        id: `${status.id}-${index}`,
        attachment,
        status: status.status,
        notes: status.notes,
        created_date: status.created_date,
      }));
    }) || [];

  const cctvVideoUrl = vehicle.transact_cctv?.filepath
    ? getImageUrl(vehicle.transact_cctv.filepath)
    : "";

  return (
    <Card className="h-full">
      <CardHeader
        header={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <DocumentBulletList24Regular />
            Bukti Tambahan
          </div>
        }
      />
      <div className="p-6">
        <div className="space-y-2 mb-6">
          <div className="text-sm font-semibold text-gray-700">CCTV</div>
          <div className="aspect-video w-full rounded-lg bg-gray-100 overflow-hidden border border-gray-200">
            {cctvVideoUrl ? (
              <video
                src={cctvVideoUrl}
                controls
                preload="metadata"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-400 text-sm">
                Tidak ada video
              </div>
            )}
          </div>
        </div>
        {attachments.length === 0 ? (
          <div className="text-center py-12">
            <DocumentBulletList24Regular className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Tidak ada bukti tambahan</p>
          </div>
        ) : (
          <div className="space-y-4">
            {attachments.map((item: any) => {
              // Attachment path already includes bucket, use directly with getImageUrl
              const imageUrl = item.attachment
                ? getImageUrl(item.attachment)
                : "";

              return (
                <div
                  key={item.id}
                  className="border border-gray-200 rounded-lg p-4"
                >
                  {imageUrl ? (
                    <div className="relative w-full h-72">
                      <Image
                        src={imageUrl}
                        alt="Bukti"
                        fill
                        className="object-cover"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                          const placeholder = e.currentTarget.parentElement
                            ?.nextElementSibling as HTMLElement;
                          if (placeholder) {
                            placeholder.style.display = "flex";
                          }
                        }}
                      />
                      <div className="w-full h-48 hidden items-center justify-center bg-gray-100 rounded border border-gray-200">
                        <ImageOff24Regular className="text-gray-400 w-12 h-12" />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-48 flex items-center justify-center bg-gray-100 rounded border border-gray-200 mb-3">
                      <ImageOff24Regular className="text-gray-400 w-12 h-12" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
