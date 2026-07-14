/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React from "react";
import { Card, CardHeader } from "@fluentui/react-components";
import { Scales24Regular, Warning24Regular, CheckmarkCircle24Regular } from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";

// ─── WIM Error Code Dictionary (WAPI DLL v2.5) ───────────────────────────────
const WIM_ERROR_CODES: Record<number, { label: string; severity: "error" | "warning" }> = {
  0:  { label: "OK — Data valid",                               severity: "warning" },
  2:  { label: "RES:2 — Terlalu banyak sumbu",                  severity: "error" },
  3:  { label: "RES:3 — Kesalahan kalibrasi",                   severity: "error" },
  4:  { label: "RES:4 — Sinyal tidak stabil",                   severity: "warning" },
  5:  { label: "RES:5 — Kendaraan tidak terdeteksi",            severity: "warning" },
  6:  { label: "RES:6 — Terlalu lambat / buffer overflow",      severity: "error" },
  7:  { label: "RES:7 — Kendaraan berhenti di atas WIM",        severity: "error" },
  8:  { label: "RES:8 — Kendaraan terlalu cepat",               severity: "error" },
  9:  { label: "RES:9 — Berat di luar toleransi kalibrasi",     severity: "warning" },
  10: { label: "RES:10 — Sinyal noise berlebihan",              severity: "warning" },
  11: { label: "RES:11 — Sensor tidak merespons",               severity: "error" },
  41: { label: "RES:41 — Ketidakseimbangan beban kiri/kanan",   severity: "warning" },
};

interface WimDetailCardProps {
  vehicle: VehicleActualData;
}

export const WimDetailCard: React.FC<WimDetailCardProps> = ({ vehicle }) => {
  const weighing = vehicle.transact_weighing;
  if (!weighing) return null;

  // Parse axle_detail JSONB — could be object, array, or stringified JSON
  let axleDetail: any = null;
  try {
    if (typeof weighing.axle_detail === "string") {
      axleDetail = JSON.parse(weighing.axle_detail);
    } else if (weighing.axle_detail !== null && weighing.axle_detail !== undefined) {
      axleDetail = weighing.axle_detail;
    }
  } catch {
    axleDetail = null;
  }

  // Try to extract per-axle array and error code from various formats
  const axles: any[] = (() => {
    if (!axleDetail) return [];
    if (Array.isArray(axleDetail)) return axleDetail;
    if (Array.isArray(axleDetail?.axles)) return axleDetail.axles;
    if (Array.isArray(axleDetail?.AXLES)) return axleDetail.AXLES;
    return [];
  })();

  const errorCode: number | null = (() => {
    if (!axleDetail) return null;
    const v = axleDetail?.error_code ?? axleDetail?.ERROR_CODE ?? axleDetail?.res ?? axleDetail?.RES;
    return v != null ? Number(v) : null;
  })();

  const speed: number | null = axleDetail?.speed ?? axleDetail?.SPEED ?? null;
  const recId: string | null = axleDetail?.rec_id ?? axleDetail?.RECID ?? null;

  const isValid = errorCode === null || errorCode === 0;
  const errorInfo = errorCode != null ? WIM_ERROR_CODES[errorCode] : null;

  return (
    <Card>
      <CardHeader
        header={
          <div className="flex items-center gap-2 text-base font-semibold">
            <Scales24Regular />
            Detail Penimbangan WIM
            {!isValid && (
              <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-red-50 text-red-700 border border-red-200">
                Data Tidak Valid
              </span>
            )}
          </div>
        }
      />
      <div className="p-4 space-y-4">

        {/* Summary row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Berat</p>
            <p className="text-xl font-bold text-slate-800">
              {weighing.total_weight != null
                ? `${(parseFloat(weighing.total_weight) / 1000).toFixed(2)} ton`
                : "—"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Sumbu</p>
            <p className="text-xl font-bold text-slate-800">{weighing.total_axle ?? "—"}</p>
          </div>
          {speed != null && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Kecepatan</p>
              <p className="text-xl font-bold text-slate-800">{speed} km/h</p>
            </div>
          )}
          {recId != null && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">REC ID</p>
              <p className="text-sm font-mono font-semibold text-slate-700">{recId}</p>
            </div>
          )}
        </div>

        {/* WIM Error Code indicator */}
        {errorCode != null && (
          <div className={`flex items-start gap-3 rounded-lg p-3 border ${
            isValid
              ? "bg-green-50 border-green-200"
              : errorInfo?.severity === "error"
                ? "bg-red-50 border-red-200"
                : "bg-orange-50 border-orange-200"
          }`}>
            {isValid ? (
              <CheckmarkCircle24Regular className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
            ) : (
              <Warning24Regular className={`w-5 h-5 shrink-0 mt-0.5 ${
                errorInfo?.severity === "error" ? "text-red-600" : "text-orange-600"
              }`} />
            )}
            <div>
              <p className={`text-sm font-semibold ${
                isValid ? "text-green-800" : errorInfo?.severity === "error" ? "text-red-800" : "text-orange-800"
              }`}>
                {errorInfo?.label ?? `Kode Error: ${errorCode}`}
              </p>
              {!isValid && (
                <p className={`text-xs mt-0.5 ${
                  errorInfo?.severity === "error" ? "text-red-600" : "text-orange-600"
                }`}>
                  Data ini mungkin tidak akurat. Disarankan untuk tidak menggunakan sebagai bukti hukum tanpa verifikasi tambahan.
                </p>
              )}
            </div>
          </div>
        )}

        {/* Per-axle table */}
        {axles.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Data Per Sumbu</p>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Sumbu</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Berat (kg)</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Roda Kiri</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Roda Kanan</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Jarak (m)</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Kecepatan</th>
                  </tr>
                </thead>
                <tbody>
                  {axles.map((axle: any, idx: number) => {
                    const no = axle?.axle_no ?? axle?.AXLENO ?? (idx + 1);
                    const gw = axle?.gweight ?? axle?.GWEIGHT ?? axle?.weight ?? axle?.WEIGHT;
                    const w1 = axle?.wheel1 ?? axle?.WHEEL1;
                    const w2 = axle?.wheel2 ?? axle?.WHEEL2;
                    const base = axle?.base ?? axle?.BASE;
                    const spd = axle?.speed ?? axle?.SPEED;
                    return (
                      <tr key={idx} className="border-b border-slate-50 hover:bg-slate-50/60">
                        <td className="px-3 py-2 text-xs font-semibold text-slate-700">{no}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{gw != null ? Number(gw).toLocaleString("id-ID") : "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{w1 != null ? Number(w1).toLocaleString("id-ID") : "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{w2 != null ? Number(w2).toLocaleString("id-ID") : "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{base != null ? Number(base).toFixed(2) : "—"}</td>
                        <td className="px-3 py-2 text-xs text-slate-600">{spd != null ? `${spd} km/h` : "—"}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Raw detail fallback — shows keys when format is unknown */}
        {axleDetail && axles.length === 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">Data Mentah WIM</p>
            <pre className="text-xs bg-slate-50 rounded-lg p-3 border border-slate-100 overflow-x-auto text-slate-600">
              {JSON.stringify(axleDetail, null, 2)}
            </pre>
          </div>
        )}

      </div>
    </Card>
  );
};
