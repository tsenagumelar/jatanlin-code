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
    const isViolation = hasViolation;
    const activeText = isViolation ? "ODOL" : "NORMAL";
    const isDim =
      violationType?.toLowerCase().includes("dimensi") ||
      violationType?.toLowerCase().includes("dimension");
    const isWeight =
      violationType?.toLowerCase().includes("berat") ||
      violationType?.toLowerCase().includes("loading");
    const isBoth = isDim && isWeight;

    const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<title>Sticker ODOL</title>
<style>
* { box-sizing: border-box; }
@page { size: 62mm 100mm; margin: 0; }
html, body { margin: 0; padding: 0; width: 62mm; font-family: Arial, Helvetica, sans-serif; }
.sticker, body {
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}
.page { width: 62mm; min-height: 100mm; padding: 2.5mm; }
.sticker {
  width: 100%; height: 100%;
  background: #d90429;
  border: 2mm solid #2b2d42;
  border-radius: 2mm; color: #fff; position: relative;
  display: flex; flex-direction: column; justify-content: center; align-items: center;
  text-align: center; padding: 13mm 2.5mm 9mm;
}
.title { font-size: 7mm; line-height: 1; font-weight: 900; letter-spacing: .2mm; margin: 1.5mm 0; }
.subtitle { font-size: 4mm; line-height: 1.2; font-weight: 800; color: #ffea00; text-shadow: 0 1px 0 rgba(0,0,0,.25); }
.subtitle small { color: #ffe066; font-weight: 800; }
.meta { position: absolute; top: 2.5mm; left: 2.5mm; right: 2.5mm; background: #ffcc99; color: #111; padding: 1.2mm 1.5mm; border-radius: 1mm; font-weight: 700; font-size: 2.5mm; text-align: left; line-height: 1.25; }
.footer { position: absolute; bottom: 2.5mm; left: 2.5mm; right: 2.5mm; color: #fff; opacity: .95; font-size: 2.3mm; line-height: 1.2; display:flex; justify-content:space-between; align-items:flex-end; gap: 1.5mm; }
.footer-text { max-width: 37mm; text-align: left; }
.badge { display:inline-block; padding: 1mm 1.8mm; border-radius: 999px; font-weight:800; font-size: 2.6mm; white-space: nowrap; }
.badge-violation { background:#ffd60a; color:#9a031e; }
.badge-ok { background:#34d399; color:#064e3b; }
@media print {
  body { background: #fff; width: 62mm; }
  html, body, .page { overflow: hidden; }
  .sticker { background: #d90429 !important; }
}
</style>
</head>
<body onload="window.focus(); window.print();">
  <div class="page">
    <div class="sticker">
      <div class="meta">NO. POLISI: <strong>${plate}</strong><br/>TANGGAL: <strong>${dd}</strong></div>
      <div class="title">KENDARAAN INI</div>
      <div class="subtitle">
        <span ${
          isDim || isBoth ? 'style="text-decoration:underline"' : ""
        }>OVER DIMENSION</span>
        <small> / </small>
        <span ${
          isWeight || isBoth ? 'style="text-decoration:underline"' : ""
        }>OVER LOADING</span>
      </div>
      <div class="footer">
        <div class="footer-text">OPERASI PENERTIBAN KENDARAAN OVER DIMENSION &amp; OVER LOADING</div>
        <div class="${
          isViolation ? "badge badge-violation" : "badge badge-ok"
        }">${activeText}</div>
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
