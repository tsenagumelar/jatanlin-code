/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, Button, Spinner } from "@fluentui/react-components";
import {
  VehicleTruck24Regular,
  Warning24Regular,
  CheckmarkCircle24Regular,
  ArrowClockwise24Regular,
} from "@fluentui/react-icons";
import type { VehicleActualData } from "../../types";
import { getMinioImageUrl } from "@/src/utils/image";

interface VacDetailCardProps {
  vehicle: VehicleActualData;
}

interface AxleScore {
  axleNo: number;
  liftScore: number | null; // 0–100; null = not found in XML
  isLifted: boolean;        // liftScore > 50
  wheelCount: number | null;
}

interface VacData {
  nAxles: number | null;
  nWheels: number | null;
  length: number | null;    // mm
  category: string | null;
  bodyType: string | null;
  axles: AxleScore[];
  raw: string;
}

// ─── XML Parsing ──────────────────────────────────────────────────────────────
// Vidar VAC XML shape (value stored as attribute):
//   <cameraid value="..."/>
//   <vac>
//     <vehicle0>
//       <naxles value="3"/>
//       <nwheels value="6"/>
//       <length value="12400"/>
//       <category value="..."/>
//       <body_type value="..."/>
//       <axle0> <lift_axle_score value="5"/>  </axle0>
//       <axle1> <lift_axle_score value="92"/> </axle1>
//       <!-- or: <wheel0>, <wheel1>, ... -->
//     </vehicle0>
//   </vac>
function parseVacXml(xmlText: string): VacData {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlText, "application/xml");

  const parseErr = doc.querySelector("parsererror");
  if (parseErr) {
    return { nAxles: null, nWheels: null, length: null, category: null, bodyType: null, axles: [], raw: xmlText };
  }

  const attr = (el: Element | null, name = "value"): string | null =>
    el?.getAttribute(name) ?? null;

  const num = (s: string | null) => (s != null ? Number(s) : null);

  // VAC vehicle0 block
  const vehicle0 = doc.querySelector("vac > vehicle0");

  const nAxles = num(attr(vehicle0?.querySelector("naxles") ?? null));
  const nWheels = num(attr(vehicle0?.querySelector("nwheels") ?? null));
  const length = num(attr(vehicle0?.querySelector("length") ?? null));
  const category = attr(vehicle0?.querySelector("category") ?? null);
  const bodyType = attr(vehicle0?.querySelector("body_type") ?? null);

  // Per-axle data — try <axle0>, <axle1>, … or <wheel0>, <wheel1>, …
  const axles: AxleScore[] = [];

  if (vehicle0) {
    // Collect all child elements whose tag starts with "axle" or "wheel"
    const children = Array.from(vehicle0.children);
    const axleEls = children.filter(
      (el) =>
        /^axle\d+$/i.test(el.tagName) ||
        /^wheel\d+$/i.test(el.tagName)
    );

    axleEls.forEach((el, idx) => {
      const liftScoreEl = el.querySelector("lift_axle_score");
      const liftScore = num(attr(liftScoreEl));
      const wheelCountEl = el.querySelector("nwheels");
      const wheelCount = num(attr(wheelCountEl));

      axles.push({
        axleNo: idx + 1,
        liftScore,
        isLifted: liftScore != null ? liftScore > 50 : false,
        wheelCount,
      });
    });
  }

  return { nAxles, nWheels, length, category, bodyType, axles, raw: xmlText };
}

// ─── Component ────────────────────────────────────────────────────────────────
export const VacDetailCard: React.FC<VacDetailCardProps> = ({ vehicle }) => {
  const axle = vehicle.transact_axle_capture;

  const [vac, setVac] = useState<VacData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showRaw, setShowRaw] = useState(false);

  const xmlUrl =
    axle?.minio_bucket && (axle as any)?.minio_xml_object
      ? getMinioImageUrl(axle.minio_bucket, (axle as any).minio_xml_object)
      : null;

  const fetchXml = async () => {
    if (!xmlUrl) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(xmlUrl, { cache: "no-store" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const text = await res.text();
      setVac(parseVacXml(text));
    } catch (e: any) {
      setError(e?.message ?? "Gagal memuat XML");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchXml();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [xmlUrl]);

  // Don't render if there's no axle capture at all
  if (!axle) return null;

  const liftedCount = vac?.axles.filter((a) => a.isLifted).length ?? 0;

  return (
    <Card>
      <CardHeader
        header={
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center gap-2 text-base font-semibold">
              <VehicleTruck24Regular />
              Detail Sumbu VAC
              {liftedCount > 0 && (
                <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                  {liftedCount} sumbu terangkat
                </span>
              )}
            </div>
            {xmlUrl && (
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowClockwise24Regular />}
                onClick={fetchXml}
                disabled={loading}
              />
            )}
          </div>
        }
      />
      <div className="p-4 space-y-4">

        {/* Summary from GraphQL data (always available) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Sumbu</p>
            <p className="text-xl font-bold text-slate-800">
              {axle.total_axles ?? vac?.nAxles ?? "—"}
            </p>
          </div>
          <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
            <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Total Roda</p>
            <p className="text-xl font-bold text-slate-800">
              {axle.total_wheels ?? vac?.nWheels ?? "—"}
            </p>
          </div>
          {(axle.length_mm != null || vac?.length != null) && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Panjang</p>
              <p className="text-xl font-bold text-slate-800">
                {((axle.length_mm ?? vac?.length ?? 0) / 1000).toFixed(2)} m
              </p>
            </div>
          )}
          {(axle.vehicle_category || vac?.category) && (
            <div className="bg-slate-50 rounded-lg p-3 border border-slate-100">
              <p className="text-xs text-slate-400 uppercase font-semibold mb-1">Kategori</p>
              <p className="text-sm font-semibold text-slate-800 leading-tight mt-1">
                {axle.vehicle_category ?? vac?.category}
              </p>
            </div>
          )}
        </div>

        {/* XML loading / error states */}
        {!xmlUrl && (
          <div className="text-sm text-slate-400 italic px-1">
            File XML VAC tidak tersedia untuk data ini.
          </div>
        )}

        {xmlUrl && loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Spinner size="tiny" />
            Memuat data sumbu dari Minio…
          </div>
        )}

        {xmlUrl && error && !loading && (
          <div className="flex items-center gap-2 rounded-lg p-3 bg-red-50 border border-red-200">
            <Warning24Regular className="text-red-500 w-4 h-4 shrink-0" />
            <p className="text-sm text-red-700">
              Gagal memuat XML: {error}
            </p>
          </div>
        )}

        {/* Per-axle lift score table */}
        {vac && vac.axles.length > 0 && (
          <div>
            <p className="text-xs text-slate-400 uppercase font-semibold mb-2">
              Skor Sumbu Terangkat (LIFT_AXLE_SCORE)
            </p>
            <div className="overflow-x-auto rounded-lg border border-slate-100">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Sumbu</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Skor</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Indikator</th>
                    <th className="text-left text-xs text-slate-400 font-semibold px-3 py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {vac.axles.map((axleScore) => {
                    const score = axleScore.liftScore;
                    const pct = score ?? 0;
                    const lifted = axleScore.isLifted;

                    return (
                      <tr
                        key={axleScore.axleNo}
                        className={`border-b border-slate-50 ${lifted ? "bg-amber-50/40" : "hover:bg-slate-50/60"}`}
                      >
                        <td className="px-3 py-2.5 text-xs font-semibold text-slate-700">
                          Sumbu {axleScore.axleNo}
                        </td>
                        <td className="px-3 py-2.5 text-xs font-mono font-semibold text-slate-700">
                          {score != null ? score : "—"}
                        </td>
                        <td className="px-3 py-2.5">
                          {score != null ? (
                            <div className="flex items-center gap-2">
                              <div className="w-24 h-2 rounded-full bg-slate-200 overflow-hidden">
                                <div
                                  className={`h-full rounded-full ${lifted ? "bg-amber-400" : "bg-emerald-500"}`}
                                  style={{ width: `${Math.min(pct, 100)}%` }}
                                />
                              </div>
                              <span className="text-xs text-slate-500">{pct}%</span>
                            </div>
                          ) : (
                            <span className="text-xs text-slate-400">—</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5">
                          {lifted ? (
                            <div className="flex items-center gap-1">
                              <Warning24Regular className="w-4 h-4 text-amber-500" />
                              <span className="text-xs font-semibold text-amber-700">Terangkat</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <CheckmarkCircle24Regular className="w-4 h-4 text-emerald-600" />
                              <span className="text-xs text-emerald-700">Menyentuh tanah</span>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {liftedCount > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-lg p-3 bg-amber-50 border border-amber-200">
                <Warning24Regular className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-xs text-amber-800">
                  <span className="font-semibold">{liftedCount} dari {vac.axles.length} sumbu terangkat.</span>{" "}
                  Sumbu yang terangkat tidak menopang beban — berat aktual di atas sumbu yang menyentuh tanah lebih tinggi dari yang terukur.
                </p>
              </div>
            )}
          </div>
        )}

        {/* No per-axle data in XML but XML loaded */}
        {vac && vac.axles.length === 0 && !loading && !error && xmlUrl && (
          <div className="text-sm text-slate-500 italic px-1">
            Data per-sumbu (LIFT_AXLE_SCORE) tidak ditemukan dalam XML ini.
          </div>
        )}

        {/* Raw XML toggle */}
        {vac && xmlUrl && (
          <div>
            <button
              onClick={() => setShowRaw((v) => !v)}
              className="text-xs text-slate-400 hover:text-slate-600 underline underline-offset-2"
            >
              {showRaw ? "Sembunyikan" : "Tampilkan"} data XML mentah
            </button>
            {showRaw && (
              <pre className="mt-2 text-xs bg-slate-50 rounded-lg p-3 border border-slate-100 overflow-x-auto text-slate-600 max-h-64">
                {vac.raw}
              </pre>
            )}
          </div>
        )}

      </div>
    </Card>
  );
};
