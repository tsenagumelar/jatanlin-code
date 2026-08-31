/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardHeader, Button } from "@fluentui/react-components";
import {
  Warning24Regular,
  Checkmark24Regular,
  Print24Regular,
} from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";

interface ViolationCardProps {
  vehicle: VehicleActualData;
}

export const ViolationCard: React.FC<ViolationCardProps> = ({ vehicle }) => {
  const latestStatus = vehicle.transact_vehicle_statuses?.[0];
  const violationType = latestStatus?.result || null;
  const status = latestStatus?.status || "pending";

  // Determine if there's a violation
  const hasViolation =
    violationType && violationType.toLowerCase() !== "normal";
  const isVerified = status === "verified";

  const handlePrintStiker = () => {
    if (typeof window === "undefined") return;

    const plateNo =
      vehicle.actual_plat_no || vehicle.transact_anpr_capture?.plate_no || "-";
    const today = new Date();
    const formattedDate = today.toLocaleDateString("id-ID", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const plate = plateNo;
    const dd = formattedDate;
    const weightValue = Number(vehicle.actual_weight);
    const weight = Number.isFinite(weightValue) && weightValue > 0
      ? `${weightValue.toLocaleString("id-ID")} kg`
      : "-";
    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title></title>
<style>
* { box-sizing: border-box; }
@page { size: 200mm 62mm; margin: 0; }
html, body { margin: 0; padding: 0; width: 200mm; height: 62mm; font-family: Arial, Helvetica, sans-serif; }
.sticker, body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { width: 200mm; height: 62mm; padding: 0; }
.sticker {
  width: 100%; height: 62mm;
  background: #fff;
  border: 0; border-radius: 0; color: #111; position: relative;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; padding: 0; gap: 0;
}
.title { font-size: 6.2mm; line-height: .95; font-weight: 900; letter-spacing: .1mm; margin: 4mm 0 2mm; max-width: 54mm; overflow-wrap: anywhere; }
.subtitle { display: flex; min-height: 20mm; flex: 1; flex-direction: column; justify-content: center; gap: .5mm; font-size: 5.5mm; line-height: .98; font-weight: 900; color: #ffea00; text-shadow: 0 1px 0 rgba(0,0,0,.25); overflow-wrap: anywhere; }
.subtitle small { color: #ffe066; font-weight: 800; }
.meta { width: 100%; background: #ffcc99; color: #111; padding: 1.1mm 1.4mm; border-radius: 1mm; font-weight: 700; font-size: 2.5mm; text-align: left; line-height: 1.25; }
.footer { color: #fff; opacity: .95; font-size: 2mm; line-height: 1.15; display:flex; justify-content:center; flex-wrap:wrap; align-items:center; gap: 1.5mm; }
.footer-text { max-width: 100%; text-align: center; }
.badge { display:inline-block; padding: .9mm 2mm; border-radius: 999px; font-weight:800; font-size: 2.3mm; white-space: nowrap; }
.badge-violation { background:#ffd60a; color:#9a031e; }
.badge-ok { background:#34d399; color:#064e3b; }
.main { display: flex; flex: 1; flex-direction: column; align-items: center; justify-content: center; }
.plate { max-width: 196mm; font-size: 38mm; line-height: .92; color: #d90429; font-weight: 900; letter-spacing: 1mm; white-space: nowrap; transform: scaleX(.92); transform-origin: center; }
.details { width: 100%; border-top: .45mm solid #222; padding: 1mm 3mm 0; display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 2mm; font-size: 3.2mm; font-weight: 700; text-align: center; }
.details strong { display: block; margin-top: .25mm; font-size: 4.5mm; color: #d90429; overflow-wrap: anywhere; }
@media print {
  body { background: #fff; width: 200mm; height: 62mm; }
  html, body, .page { overflow: hidden; }
  .sticker { background: #d90429 !important; }
}
</style>
</head>
<body onload="window.focus(); window.print();">
  <div class="page">
    <div class="sticker">
      <div class="main">
        <div class="plate">${plate}</div>
      </div>
      <div class="details">
        <div>TANGGAL<strong>${dd}</strong></div>
        <div>BERAT KENDARAAN<strong>${weight}</strong></div>
      </div>
    </div>
  </div>
</body>
</html>`;

    const w = window.open("", "PRINT_STICKER", "width=1400,height=900");
    if (!w) {
      alert("Popup diblokir! Silakan izinkan popup untuk mencetak stiker.");
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

  return (
    <Card className="h-full">
      <CardHeader
        header={
          <div className="flex items-center gap-2 text-lg font-semibold">
            <Warning24Regular />
            Jenis Pelanggaran
          </div>
        }
      />
      <div className="p-4">
        {violationType ? (
          <div className="space-y-4">
            {/* Violation Status */}
            <div
              className={`rounded-lg p-4 border-2 ${
                hasViolation
                  ? "bg-red-50 border-red-300"
                  : "bg-green-50 border-green-300"
              }`}
            >
              <div className="flex items-center gap-3 py-3">
                {hasViolation ? (
                  <div className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shrink-0">
                    <Warning24Regular className="text-white" />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center shrink-0">
                    <Checkmark24Regular className="text-white" />
                  </div>
                )}
                <div className="flex-1">
                  <p
                    className={`text-xs font-medium uppercase mb-1 ${
                      hasViolation ? "text-red-600" : "text-green-600"
                    }`}
                  >
                    {hasViolation
                      ? "Terdapat Pelanggaran"
                      : "Tidak Ada Pelanggaran"}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      hasViolation ? "text-red-900" : "text-green-900"
                    }`}
                  >
                    {violationType}
                  </p>
                </div>
                {/* Print Button - Only show if verified and has violation */}
                {hasViolation && isVerified && (
                  <Button
                    appearance="primary"
                    icon={<Print24Regular />}
                    onClick={handlePrintStiker}
                    size="medium"
                    className="shrink-0"
                    style={{
                      backgroundColor: "#dc2626",
                      borderColor: "#dc2626",
                    }}
                  >
                    Cetak Stiker
                  </Button>
                )}
              </div>
            </div>

            {/* Additional Notes */}
            {latestStatus?.notes && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-xs font-medium text-gray-500 uppercase mb-2">
                  Catatan
                </p>
                <p className="text-sm text-gray-700">{latestStatus.notes}</p>
              </div>
            )}

            {/* Status Info */}
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div>
                <span className="font-medium">Status Verifikasi:</span>{" "}
                <span
                  className={`font-semibold ${
                    status === "verified"
                      ? "text-green-600"
                      : status === "rejected"
                      ? "text-red-600"
                      : "text-yellow-600"
                  }`}
                >
                  {status === "verified"
                    ? "Terverifikasi"
                    : status === "rejected"
                    ? "Disangkal"
                    : status === "draft"
                    ? "Dalam Proses"
                    : "Perlu Ditinjau"}
                </span>
              </div>
              {latestStatus?.created_date && (
                <div>
                  <span className="font-medium">Waktu:</span>{" "}
                  {new Date(latestStatus.created_date).toLocaleString("id-ID", {
                    day: "2-digit",
                    month: "2-digit",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
              <Warning24Regular className="text-gray-400" />
            </div>
            <p className="text-gray-500">Belum ada informasi pelanggaran</p>
            <p className="text-sm text-gray-400 mt-1">
              Data ini belum diverifikasi
            </p>
          </div>
        )}
      </div>
    </Card>
  );
};
