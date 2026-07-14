/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Spinner } from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  ArrowDownload20Regular,
  Share20Regular,
  VehicleCar24Regular,
  Warning24Regular,
  VehicleTruck24Regular,
  Camera24Regular,
  Scales24Regular,
  Video24Regular,
  CheckmarkCircle20Filled,
  ArrowLeft12Regular,
  ArrowRight12Regular,
  ArrowRight16Regular,
  Eye20Regular,
  ImageOff24Regular,
  Shield24Regular,
  Person24Regular,
} from "@fluentui/react-icons";
import { useGetVehicleActualByIdQuery, useGetVehicleHistoryByPlateQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import { useGetUserByIdQuery } from "@/src/graphql/hooks/master-user";
import { getMinioImageUrl, getImageUrl } from "@/src/utils/image";
import { V2VerifikasiModule } from "@/src/modules/v2/jatanlin/verifikasi";

interface Props { id: string }

// ─── Formatters ───────────────────────────────────────────────────────────────
const fmtKg = (v: any) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toLocaleString("id-ID") + " kg" : "—";
};
const fmtM = (v: any, dec = 2) => {
  if (v == null) return "—";
  const n = Number(v);
  return Number.isFinite(n) ? n.toFixed(dec) + " m" : "—";
};
const fmtDateTime = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit", second: "2-digit" });
};
const fmtDate = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" });
};
const fmtTimeOnly = (d?: string | null) => {
  if (!d) return "—";
  return new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
};

// ─── Parse axle_detail JSON → per-axle weights ────────────────────────────────
const parseAxleWeights = (detail: any): number[] => {
  if (!detail) return [];
  try {
    const d = typeof detail === "string" ? JSON.parse(detail) : detail;
    if (Array.isArray(d)) return d.map((x: any) => Number(x.weight ?? x.axle_weight ?? x.value ?? 0));
    if (typeof d === "object") return Object.values(d).map((v: any) => Number(v));
  } catch {}
  return [];
};

// ─── VAC XML parse ────────────────────────────────────────────────────────────
interface AxleScore { axleNo: number; liftScore: number | null; isLifted: boolean }
const parseVacXml = (xmlText: string): AxleScore[] => {
  if (typeof window === "undefined") return [];
  const doc = new DOMParser().parseFromString(xmlText, "application/xml");
  if (doc.querySelector("parsererror")) return [];
  const v0 = doc.querySelector("vac > vehicle0");
  if (!v0) return [];
  return Array.from(v0.children)
    .filter(el => /^(axle|wheel)\d+$/i.test(el.tagName))
    .map((el, i) => {
      const s = el.querySelector("lift_axle_score")?.getAttribute("value");
      const score = s != null ? Number(s) : null;
      return { axleNo: i + 1, liftScore: score, isLifted: score != null ? score > 50 : false };
    });
};

// ─── Violation helpers ────────────────────────────────────────────────────────
const getViolationStyle = (type: string) => {
  if (!type || type === "Normal" || type === "SESUAI" || type === "LULUS") return { color: "text-green-600", bg: "bg-green-50 border-green-200", badge: "bg-green-100 text-green-700 border-green-300" };
  if (type.toLowerCase().includes("dimension") || type.toLowerCase().includes("dimensi")) return { color: "text-orange-600", bg: "bg-orange-50 border-orange-200", badge: "bg-orange-100 text-orange-700 border-orange-300" };
  return { color: "text-red-600", bg: "bg-red-50 border-red-200", badge: "bg-red-100 text-red-700 border-red-300" };
};

const getStatusBadge = (status: string) => {
  if (!status) return "bg-slate-100 text-slate-600 border-slate-200";
  const s = status.toLowerCase();
  if (s === "verified" || s === "selesai" || s === "lulus" || s === "normal") return "bg-green-100 text-green-700 border-green-300";
  if (s === "rejected" || s === "pelanggaran") return "bg-red-100 text-red-700 border-red-300";
  return "bg-amber-100 text-amber-700 border-amber-300";
};

// ─── Section card wrapper ──────────────────────────────────────────────────────
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>{children}</div>
);
const CardTitle = ({ icon, title, action }: { icon: React.ReactNode; title: string; action?: React.ReactNode }) => (
  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
    <div className="flex items-center gap-2">
      <span className="text-slate-500 w-4 h-4 flex items-center justify-center">{icon}</span>
      <h3 className="text-[12px] font-bold text-slate-700">{title}</h3>
    </div>
    {action}
  </div>
);

// ─── Legal basis references ───────────────────────────────────────────────────
const LEGAL_REFS = [
  {
    no: "UU No. 22 Tahun 2009",
    title: "Lalu Lintas dan Angkutan Jalan",
    pasal: "Pasal 169 ayat (1)",
    isi: "Pengemudi dan/atau perusahaan angkutan umum dilarang mengoperasikan kendaraan bermotor umum yang tidak memenuhi persyaratan teknis dan laik jalan.",
  },
  {
    no: "PP No. 55 Tahun 2012",
    title: "Tentang Kendaraan",
    pasal: "Pasal 58 & 64",
    isi: "Dimensi kendaraan bermotor tidak boleh melebihi batas panjang, lebar, dan tinggi yang ditetapkan — termasuk JBI (Jumlah Berat yang Diizinkan) per kelas kendaraan.",
  },
  {
    no: "Permenhub PM No. 134 Tahun 2015",
    title: "Penyelenggaraan Penimbangan Kendaraan Bermotor",
    pasal: "Pasal 4 & 5",
    isi: "Setiap kendaraan angkutan barang wajib memenuhi ketentuan batas muatan JBI dan batas dimensi sesuai Tipe/Kelas kendaraan yang ditetapkan.",
  },
  {
    no: "Permenhub PM No. 60 Tahun 2019",
    title: "Penyelenggaraan Angkutan Barang dengan Kendaraan Bermotor",
    pasal: "Pasal 10–15",
    isi: "Angkutan barang wajib menggunakan kendaraan bermotor yang memenuhi persyaratan JBI (Berat) dan dimensi sesuai kelas Truk/Trailer yang berlaku.",
  },
];

// ─── Dummy axle weights (sum = totalWeight) ───────────────────────────────────
const generateDummyAxleWeights = (totalWeight: number, axleCount: number): number[] => {
  if (axleCount <= 0 || !totalWeight) return [];
  // Distribute: front axle ~70–80% of average, rear axles share equally
  const avg = totalWeight / axleCount;
  const frontFactor = 0.78;
  const frontWeight = Math.round(avg * frontFactor / 100) * 100;
  const remaining = totalWeight - frontWeight;
  const rearCount = axleCount - 1;
  const rearBase = Math.round(remaining / rearCount / 100) * 100;
  const weights = [frontWeight, ...Array(rearCount).fill(rearBase)];
  // Correct last axle for rounding
  const diff = totalWeight - weights.reduce((a, b) => a + b, 0);
  weights[weights.length - 1] += diff;
  return weights;
};

// ─── Main module ──────────────────────────────────────────────────────────────
export const V2JatanlinDetailModule: React.FC<Props> = ({ id }) => {
  const router = useRouter();
  const [tab, setTab] = useState<"aktif" | "histori" | "verifikasi">("aktif");
  const [photoIdx, setPhotoIdx] = useState(0);
  const [vacAxles, setVacAxles] = useState<AxleScore[]>([]);
  const [infoPopup, setInfoPopup] = useState<string | null>(null);
  const [legalModal, setLegalModal] = useState(false);
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);
  const [lightboxZoom, setLightboxZoom] = useState(1);

  const { data, loading, error } = useGetVehicleActualByIdQuery({ variables: { id } });
  const vehicle = data?.transact_vehicle_actual_by_pk;

  const plateNo = vehicle?.actual_plat_no ?? vehicle?.transact_anpr_capture?.plate_no ?? "—";
  const lastStatus = vehicle?.transact_vehicle_statuses?.[vehicle.transact_vehicle_statuses.length - 1];
  const statusLabel = lastStatus?.result ?? lastStatus?.status ?? "Diproses";
  const isVerified = ["verified", "selesai", "normal", "odol", "rejected"].includes((lastStatus?.status ?? "").toLowerCase());

  // History
  const { data: histData, loading: histLoading } = useGetVehicleHistoryByPlateQuery({
    variables: { plate_no: `%${plateNo}%` },
    skip: !plateNo || plateNo === "—",
  });
  const historyRows = (histData?.transact_vehicle_actual ?? []).filter((r: any) => r.id !== id);

  // Vehicle class
  const { data: classData } = useGetVehicleClassesQuery({ variables: { limit: 100, offset: 0, where: {} } });
  const axleCount = vehicle?.actual_total_axle ?? 0;
  const vehicleClass = (() => {
    const cls = classData?.master_vehicle_class as any[] ?? [];
    return cls.find((c: any) => c.total_axle === axleCount) ??
      [...cls].sort((a: any, b: any) => Math.abs(a.total_axle - axleCount) - Math.abs(b.total_axle - axleCount))[0] ?? null;
  })();

  // Officer
  const officerUuid = vehicle?.created_by ?? lastStatus?.created_by;
  const { data: officerData } = useGetUserByIdQuery({ variables: { id: officerUuid }, skip: !officerUuid });
  const officer = officerData?.master_user_by_pk;

  // VAC XML
  useEffect(() => {
    const axle = vehicle?.transact_axle_capture as any;
    if (!axle?.minio_bucket || !axle?.minio_xml_object) return;
    fetch(getMinioImageUrl(axle.minio_bucket, axle.minio_xml_object), { cache: "no-store" })
      .then(r => r.text()).then(t => setVacAxles(parseVacXml(t))).catch(() => {});
  }, [vehicle]);

  // Attachments
  const attachments = vehicle?.transact_vehicle_statuses?.flatMap((s: any) => {
    const files = Array.isArray(s.attachment) ? s.attachment : s.attachment ? [s.attachment] : [];
    return files.map((f: string, i: number) => ({ key: `${s.id}-${i}`, src: getImageUrl(f) }));
  }) ?? [];

  // CCTV video
  const cctvUrl = vehicle?.transact_cctv?.filepath ? getImageUrl(vehicle.transact_cctv.filepath) : null;

  // Axle weights from WIM
  const axleWeights = parseAxleWeights(vehicle?.transact_weighing?.axle_detail);

  const violStyle = getViolationStyle(statusLabel);

  // ── Loading / Error
  if (loading) return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center space-y-3"><Spinner size="large" /><p className="text-sm text-slate-500">Memuat data kendaraan…</p></div>
    </div>
  );
  if (error || !vehicle) return (
    <div className="flex items-center justify-center h-full bg-slate-50">
      <div className="text-center space-y-2">
        <Warning24Regular className="w-12 h-12 text-red-400 mx-auto" />
        <p className="text-sm text-slate-600">Data tidak ditemukan</p>
        <p className="text-xs text-slate-400">ID: {id}</p>
        {error && <p className="text-xs text-red-400">{error.message}</p>}
        <button onClick={() => router.back()} className="text-xs text-blue-600 hover:underline mt-2 block">← Kembali</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50 overflow-y-auto">

      {/* ══ LEGAL BASIS MODAL ══════════════════════════════════════════════ */}
      {legalModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
          onClick={() => setLegalModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <svg viewBox="0 0 20 20" fill="#2F5BFF" className="w-5 h-5"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                <h3 className="text-[14px] font-bold text-slate-800">Dasar Hukum Parameter ODOL</h3>
              </div>
              <button onClick={() => setLegalModal(false)} className="text-slate-400 hover:text-slate-700 text-lg font-bold w-7 h-7 flex items-center justify-center rounded-lg hover:bg-slate-100">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <p className="text-[11px] text-slate-500 bg-blue-50 border border-blue-100 rounded-lg px-3 py-2">
                Parameter dimensi dan berat kendaraan yang berlaku di sistem ini mengacu pada regulasi berikut:
              </p>
              {LEGAL_REFS.map((ref, i) => (
                <div key={i} className="border border-slate-100 rounded-xl p-4">
                  <div className="flex items-start gap-2 mb-2">
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded shrink-0 mt-0.5">{i + 1}</span>
                    <div>
                      <p className="text-[12px] font-bold text-blue-700">{ref.no}</p>
                      <p className="text-[11px] font-semibold text-slate-700">{ref.title}</p>
                    </div>
                  </div>
                  <div className="ml-6 space-y-1">
                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">{ref.pasal}</p>
                    <p className="text-[11px] text-slate-600 leading-relaxed">{ref.isi}</p>
                  </div>
                </div>
              ))}
              <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
                <p className="text-[11px] text-amber-700 font-semibold">Keterangan Sanksi</p>
                <p className="text-[11px] text-amber-600 mt-1">Pelanggaran dimensi dan muatan dapat dikenakan sanksi administratif berupa tilang dan/atau perintah untuk mengurangi muatan berdasarkan UU No. 22 Tahun 2009 Pasal 307.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══ LIGHTBOX ═══════════════════════════════════════════════════════ */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90"
          onClick={() => { setLightboxUrl(null); setLightboxZoom(1); }}>
          <div className="relative flex flex-col items-center max-w-full max-h-full p-4"
            onClick={e => e.stopPropagation()}>
            {/* Controls */}
            <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
              <button onClick={() => setLightboxZoom(z => Math.min(4, z + 0.5))}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center text-lg font-bold">+</button>
              <button onClick={() => setLightboxZoom(z => Math.max(0.5, z - 0.5))}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center text-lg font-bold">−</button>
              <span className="text-white text-[11px] font-mono bg-black/30 px-2 py-1 rounded">{Math.round(lightboxZoom * 100)}%</span>
              <button onClick={() => { setLightboxUrl(null); setLightboxZoom(1); }}
                className="w-8 h-8 bg-white/20 hover:bg-white/30 text-white rounded-lg flex items-center justify-center font-bold">✕</button>
            </div>
            {/* Image */}
            <div className="overflow-auto max-w-[90vw] max-h-[85vh] flex items-center justify-center">
              <img
                src={lightboxUrl}
                alt="Evidence"
                style={{ transform: `scale(${lightboxZoom})`, transformOrigin: "center", transition: "transform 0.2s", maxWidth: "85vw", maxHeight: "80vh", objectFit: "contain" }}
                onWheel={e => { e.preventDefault(); setLightboxZoom(z => Math.min(4, Math.max(0.5, z + (e.deltaY < 0 ? 0.25 : -0.25)))); }}
              />
            </div>
            <p className="text-white/60 text-[10px] mt-3">Scroll untuk zoom · Klik di luar untuk tutup</p>
          </div>
        </div>
      )}

      {/* ══ HEADER ══════════════════════════════════════════════════════════ */}
      <div className="bg-white border-b border-slate-200 px-5 pt-2.5 pb-0 sticky top-0 z-20 shadow-sm">
        <div className="flex items-center justify-between gap-4 pb-2">
          {/* Left: back + title block */}
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()}
              className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium shrink-0">
              <ArrowLeft24Regular className="w-4 h-4" /> Kembali
            </button>
            <div className="flex items-center gap-2.5">
              <h1 className="text-[15px] font-extrabold text-slate-900">Detail Transaksi Kendaraan</h1>
              <span className="text-[15px] font-extrabold text-slate-800 tracking-wider">{plateNo}</span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getStatusBadge(statusLabel)}`}>{statusLabel}</span>
              <span className="text-[11px] text-slate-400">{fmtDate(vehicle.created_date)} · {fmtTimeOnly(vehicle.created_date)}</span>
            </div>
          </div>
          {/* Right: action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 px-2.5 py-1 rounded-lg transition-colors">
              <ArrowDownload20Regular className="w-3.5 h-3.5" /> Download PDF
            </button>
            <button className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 border border-blue-200 hover:bg-blue-50 px-2.5 py-1 rounded-lg transition-colors">
              <Share20Regular className="w-3.5 h-3.5" /> Bagikan
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1">
          <button onClick={() => setTab("aktif")}
            className={`px-4 py-1.5 text-[12px] font-semibold border-b-2 transition-colors ${
              tab === "aktif" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            Data Aktif
          </button>
          <button onClick={() => setTab("histori")}
            className={`px-4 py-1.5 text-[12px] font-semibold border-b-2 transition-colors ${
              tab === "histori" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            {`Histori${historyRows.length ? ` (${historyRows.length})` : ""}`}
          </button>
          <button onClick={() => setTab("verifikasi")}
            className={`px-4 py-1.5 text-[12px] font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              tab === "verifikasi" ? "border-blue-600 text-blue-600" : "border-transparent text-slate-500 hover:text-slate-700"}`}>
            <Shield24Regular className="w-3.5 h-3.5" />
            Verifikasi Petugas
            {isVerified && (
              <span className="ml-0.5 text-[9px] font-bold bg-green-500 text-white px-1.5 py-0.5 rounded-full">✓</span>
            )}
          </button>
        </div>
      </div>

      {/* ══ BODY ════════════════════════════════════════════════════════════ */}
      <div className="px-5 py-3 space-y-3 max-w-[1400px]">

        {/* ═══ TAB: DATA AKTIF ═══ */}
        {tab === "aktif" && <>

          {/* ROW 1: Informasi Kendaraan (60%) + Jenis Pelanggaran (40%) */}
          <div className="grid grid-cols-5 gap-4">

            {/* ── Informasi Kendaraan (3/5) */}
            <Card className="col-span-3 overflow-hidden">
              <CardTitle icon={<VehicleCar24Regular />} title="Informasi Kendaraan" />
              <div className="flex">

                {/* Left: 4 basic fields */}
                <div className="w-48 shrink-0 border-r border-slate-100">
                  {[
                    {
                      label: "No. Plat",
                      value: (
                        <span className="inline-block bg-slate-900 text-white font-bold text-[12px] tracking-widest px-2 py-0.5 rounded">
                          {plateNo}
                        </span>
                      ),
                    },
                    {
                      label: "Berat Aktual",
                      value: <span className="text-[14px] font-bold text-slate-800">{fmtKg(vehicle.actual_weight)}</span>,
                    },
                    {
                      label: "Total Sumbu",
                      value: <span className="text-[14px] font-bold text-slate-800">{vehicle.actual_total_axle != null ? `${vehicle.actual_total_axle} sumbu` : "—"}</span>,
                    },
                    {
                      label: "Tanggal",
                      value: (
                        <span className="text-[14px] font-bold text-slate-800">
                          {vehicle.created_date
                            ? new Date(vehicle.created_date).toLocaleDateString("id-ID", { day: "2-digit", month: "long", year: "numeric" }) +
                              ", " + new Date(vehicle.created_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: false })
                            : "—"}
                        </span>
                      ),
                    },
                  ].map(({ label, value }, i, arr) => (
                    <div key={label} className={`px-4 py-2.5 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                      <p className="text-[11px] text-slate-400 mb-1">{label}</p>
                      <div>{value}</div>
                    </div>
                  ))}
                </div>

                {/* Right: dimension + weight indicators with comparison */}
                <div className="flex-1 min-w-0 flex flex-col">
                  {(() => {
                    const maxLen = vehicleClass?.length != null ? Number(vehicleClass.length) : null;
                    const maxWid = vehicleClass?.width != null ? Number(vehicleClass.width) : null;
                    const maxHgt = vehicleClass?.height != null ? Number(vehicleClass.height) : null;
                    const maxWgt = vehicleClass?.class_2_weight != null ? Number(vehicleClass.class_2_weight) : null;

                    const actLen = vehicle.actual_length != null ? Number(vehicle.actual_length) : null;
                    const actWid = vehicle.actual_width != null ? Number(vehicle.actual_width) : null;
                    const actHgt = vehicle.actual_height != null ? Number(vehicle.actual_height) : null;
                    const actWgt = vehicle.actual_weight != null ? Number(vehicle.actual_weight) : null;

                    type Indicator = {
                      key: string;
                      icon: string;
                      label: string;
                      desc: string;
                      tooltip: string;
                      actual: number | null;
                      limit: number | null;
                      fmtVal: (v: number) => string;
                      fmtLim: (v: number) => string;
                    };

                    const indicators: Indicator[] = [
                      {
                        key: "panjang", icon: "/icons/icon-panjang.svg",
                        label: "Panjang", desc: "Panjang keseluruhan kendaraan",
                        tooltip: "Panjang kendaraan dari bumper depan hingga belakang.",
                        actual: actLen, limit: maxLen,
                        fmtVal: v => `${v.toFixed(2)} m`, fmtLim: v => `${v.toFixed(2)} m`,
                      },
                      {
                        key: "lebar", icon: "/icons/icon-lebar.svg",
                        label: "Lebar", desc: "Lebar terlebar kendaraan",
                        tooltip: "Lebar kendaraan dari sisi kiri ke kanan pada titik terlebar.",
                        actual: actWid, limit: maxWid,
                        fmtVal: v => `${v.toFixed(2)} m`, fmtLim: v => `${v.toFixed(2)} m`,
                      },
                      {
                        key: "tinggi", icon: "/icons/icon-tinggi.svg",
                        label: "Tinggi", desc: "Tinggi dari permukaan tanah",
                        tooltip: "Tinggi kendaraan dari permukaan tanah ke titik tertinggi.",
                        actual: actHgt, limit: maxHgt,
                        fmtVal: v => `${v.toFixed(2)} m`, fmtLim: v => `${v.toFixed(2)} m`,
                      },
                      {
                        key: "berat", icon: "/icons/icon-truck.svg",
                        label: "Berat", desc: "Berat aktual seluruh kendaraan",
                        tooltip: "Berat kendaraan beserta muatan diukur oleh sensor WIM.",
                        actual: actWgt, limit: maxWgt,
                        fmtVal: v => `${v.toLocaleString("id-ID")} kg`,
                        fmtLim: v => `${v.toLocaleString("id-ID")} kg`,
                      },
                      {
                        key: "lokasi", icon: "/icons/icon-lokasi.svg",
                        label: "Lokasi", desc: "Lokasi saat kendaraan terdeteksi",
                        tooltip: "Checkpoint atau gerbang timbang tempat kendaraan terdeteksi.",
                        actual: null, limit: null,
                        fmtVal: () => "", fmtLim: () => "",
                      },
                    ];

                    return indicators.map(({ key, icon, label, desc, tooltip, actual, limit, fmtVal, fmtLim }, i, arr) => {
                      const hasComparison = key !== "lokasi" && actual != null;
                      const exceeded = hasComparison && limit != null && actual! > limit;
                      const withinLimit = hasComparison && limit != null && actual! <= limit;
                      const noLimit = hasComparison && limit == null;

                      const locValue = key === "lokasi"
                        ? (vehicle.transact_anpr_capture?.location_code ?? vehicle.location_address ?? "—")
                        : null;

                      return (
                        <div key={key} className={`relative flex items-start gap-2.5 px-4 py-2 flex-1 ${i < arr.length - 1 ? "border-b border-slate-100" : ""}`}>
                          {/* Icon square */}
                          <div className="w-9 h-9 rounded-xl shrink-0 overflow-hidden border border-[#D4E3FF] mt-0.5">
                            <img src={icon} alt={label} className="w-full h-full" />
                          </div>

                          {/* Left text block */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-1">
                              <span className="text-[12px] font-semibold text-slate-800">{label}</span>
                              <button
                                onClick={() => setInfoPopup(infoPopup === key ? null : key)}
                                className="text-slate-400 hover:text-blue-500 transition-colors"
                              >
                                <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5">
                                  <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zm-.02-1.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                                </svg>
                              </button>
                            </div>
                            <p className="text-[11px] text-slate-400 mt-0.5">{desc}</p>
                            {/* Tooltip popup */}
                            {infoPopup === key && (
                              <div className="absolute left-5 top-full z-30 mt-1 w-64 bg-white border border-slate-200 rounded-lg shadow-xl p-3">
                                <p className="text-[11px] text-slate-600">{tooltip}</p>
                                <button onClick={() => setInfoPopup(null)} className="absolute top-1.5 right-2 text-slate-400 hover:text-slate-600 text-xs">✕</button>
                              </div>
                            )}
                          </div>

                          {/* Right: value + comparison */}
                          <div className="shrink-0 text-right min-w-[130px]">
                            {key === "lokasi" ? (
                              <span className="text-[13px] font-bold text-slate-800">{locValue}</span>
                            ) : (
                              <>
                                {/* Actual value — colored by status */}
                                <p className={`text-[15px] font-extrabold leading-tight ${
                                  exceeded ? "text-red-600" : withinLimit ? "text-green-600" : "text-slate-800"
                                }`}>
                                  {actual != null ? fmtVal(actual) : "—"}
                                </p>

                                {/* Limit row */}
                                <p className="text-[10px] text-slate-400 mt-0.5">
                                  Maks:{" "}
                                  <span className="font-semibold text-slate-600">
                                    {limit != null ? fmtLim(limit) : "—"}
                                  </span>
                                </p>

                                {/* Status badge */}
                                {actual != null && (
                                  <span className={`inline-flex items-center gap-1 mt-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full border ${
                                    exceeded
                                      ? "bg-red-50 text-red-600 border-red-200"
                                      : withinLimit
                                      ? "bg-green-50 text-green-600 border-green-200"
                                      : "bg-slate-50 text-slate-500 border-slate-200"
                                  }`}>
                                    {exceeded ? (
                                      <>
                                        <svg viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2">
                                          <path d="M5 1L9 9H1L5 1Z"/>
                                        </svg>
                                        MELEBIHI
                                      </>
                                    ) : withinLimit ? (
                                      <>
                                        <svg viewBox="0 0 10 10" fill="currentColor" className="w-2 h-2">
                                          <path d="M2 5l2 2 4-4" stroke="currentColor" strokeWidth="1.5" fill="none"/>
                                        </svg>
                                        SESUAI
                                      </>
                                    ) : noLimit ? (
                                      "TIDAK ADA BATAS"
                                    ) : "—"}
                                  </span>
                                )}

                                {/* Progress bar */}
                                {actual != null && limit != null && (
                                  <div className="mt-1.5 h-1 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                      className={`h-full rounded-full transition-all ${exceeded ? "bg-red-400" : "bg-green-400"}`}
                                      style={{ width: `${Math.min((actual / limit) * 100, 100)}%` }}
                                    />
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}

                  {/* Footer info bar */}
                  <div className="flex items-center gap-1.5 px-4 py-2 bg-slate-50 border-t border-slate-100">
                    <svg viewBox="0 0 16 16" fill="#2F5BFF" className="w-3.5 h-3.5 shrink-0">
                      <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zm-.02-1.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                    </svg>
                    <p className="text-[10px] text-slate-500">
                      Klik ikon <span className="font-semibold">ⓘ</span> untuk melihat penjelasan lebih detail tentang masing-masing indikator.
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Jenis Pelanggaran (2/5) */}
            <Card className="col-span-2 relative overflow-hidden">
              <CardTitle icon={<Warning24Regular />} title="Jenis Pelanggaran" />
              {/* Police watermark */}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-[0.06] pointer-events-none select-none">
                <Shield24Regular style={{ width: 120, height: 120 }} className="text-slate-800" />
              </div>
              <div className="p-5 relative space-y-3">
                {/* Type name */}
                <p className={`text-[22px] font-extrabold leading-tight ${violStyle.color}`}>
                  {statusLabel === "Diproses" || statusLabel === "DIPROSES"
                    ? (vehicle.transact_vehicle_statuses?.[0]?.result ?? "Belum diverifikasi")
                    : statusLabel}
                </p>

                {/* Rows */}
                {[
                  { label: "Pasal", value: lastStatus?.notes?.match(/[Pp]asal\s*\d+/)?.[0] ?? (lastStatus?.notes ? lastStatus.notes.split(".")[0] : "—") },
                  { label: "Deskripsi", value: lastStatus?.notes ?? "—" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">{label}</p>
                    <p className="text-[13px] font-semibold text-slate-800 mt-0.5">{value}</p>
                  </div>
                ))}

                <div>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wide">Status</p>
                  <span className={`inline-block mt-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${getStatusBadge(lastStatus?.status ?? "")}`}>
                    {lastStatus?.status ?? "Diproses"}
                  </span>
                </div>
              </div>
            </Card>
          </div>

          {/* ROW 2: Kelas Kendaraan & Batas Legal (full width) */}
          <Card>
            <CardTitle
              icon={<VehicleTruck24Regular />}
              title="Kelas Kendaraan & Batas Legal"
              action={
                <button onClick={() => setLegalModal(true)}
                  className="flex items-center gap-1.5 text-[11px] font-semibold text-blue-600 hover:text-blue-800 hover:bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200 transition-colors mr-1">
                  <svg viewBox="0 0 16 16" fill="currentColor" className="w-3.5 h-3.5"><path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"/></svg>
                  Dasar Hukum
                </button>
              }
            />
            <div className="p-5 flex gap-6">
              {/* Left: class name */}
              <div className="w-48 shrink-0">
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide mb-1">Kelas Kendaraan</p>
                {vehicleClass ? (
                  <>
                    <p className="text-[18px] font-extrabold text-blue-700 leading-tight">{vehicleClass.type}</p>
                    <p className="text-[12px] text-blue-500 mt-1 font-medium">{vehicleClass.type}</p>
                    {vehicleClass.total_axle !== axleCount && (
                      <p className="text-[10px] text-amber-500 mt-1">Terdekat untuk {axleCount} sumbu</p>
                    )}
                  </>
                ) : (
                  <p className="text-[13px] text-slate-400 italic">Tidak ditemukan</p>
                )}
              </div>
              {/* Right: 4 metric boxes */}
              <div className="flex-1 grid grid-cols-4 gap-3">
                {[
                  {
                    label: "Berat (Batas Legal)",
                    value: vehicleClass
                      ? (() => {
                          const c2 = vehicleClass.class_2_weight != null ? (Number(vehicleClass.class_2_weight) / 1000).toFixed(2) : null;
                          const c3 = vehicleClass.class_3_weight != null ? (Number(vehicleClass.class_3_weight) / 1000).toFixed(2) : null;
                          if (!c2) return "—";
                          return c3 && c2 !== c3 ? `${c2} ton -\n${c3} ton` : `${c2} ton`;
                        })()
                      : "—",
                  },
                  { label: "Panjang (Maks)", value: vehicleClass?.length != null ? `${vehicleClass.length} m` : "—" },
                  { label: "Lebar (Maks)", value: vehicleClass?.width != null ? `${vehicleClass.width} m` : "—" },
                  { label: "Tinggi (Maks)", value: vehicleClass?.height != null ? `${vehicleClass.height} m` : "—" },
                ].map(({ label, value }) => (
                  <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                    <p className="text-[15px] font-extrabold text-slate-800 mt-1 whitespace-pre-line leading-tight">{value}</p>
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* ROW 3: Detail Sumbu VAC (full width) */}
          {vehicle.transact_axle_capture && (
            <Card>
              <CardTitle icon={<VehicleTruck24Regular />} title="Detail Sumbu VAC" />
              <div className="p-5 flex gap-6 items-start">
                {/* Left: 4 stat boxes */}
                <div className="grid grid-cols-2 gap-3 w-72 shrink-0">
                  {[
                    { label: "Total Sumbu", value: vehicle.transact_axle_capture.total_axles ?? "—" },
                    { label: "Total Roda", value: vehicle.transact_axle_capture.total_wheels ?? "—" },
                    { label: "Panjang", value: vehicle.transact_axle_capture.length_mm != null ? fmtM(vehicle.transact_axle_capture.length_mm / 1000) : "—" },
                    { label: "Kategori", value: vehicle.transact_axle_capture.vehicle_category ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label} className="bg-slate-50 rounded-lg p-3 border border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                      <p className="text-[18px] font-extrabold text-slate-800 mt-0.5">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Right: Axle diagram */}
                <div className="flex-1 min-w-0">
                  {(() => {
                    const totalAxles = Number(vehicle.transact_axle_capture.total_axles ?? vacAxles.length ?? axleWeights.length ?? 0);
                    if (!totalAxles) return <p className="text-[12px] text-slate-400 italic">Data diagram tidak tersedia</p>;

                    // Determine per-axle weights — real > dummy
                    const realWeights = axleWeights.length === totalAxles ? axleWeights : [];
                    const isDummy = realWeights.length === 0;
                    const totalWgt = Number(vehicle.actual_weight ?? vehicle.transact_weighing?.total_weight ?? 0);
                    const displayWeights: number[] = realWeights.length > 0
                      ? realWeights
                      : totalWgt > 0
                        ? generateDummyAxleWeights(totalWgt, totalAxles)
                        : Array(totalAxles).fill(0);

                    const lifted = vacAxles.filter(a => a.isLifted).length;
                    const weightSum = displayWeights.reduce((a, b) => a + b, 0);

                    return (
                      <div>
                        {/* Sumbu label */}
                        <div className="flex items-center justify-between mb-1 px-2">
                          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Per-Sumbu</p>
                          <p className="text-[10px] text-slate-400">
                            Total: <span className="font-bold text-slate-700">{weightSum.toLocaleString("id-ID")} kg</span>
                            {isDummy && <span className="ml-1.5 text-amber-500">(simulasi)</span>}
                          </p>
                        </div>

                        {/* Weights above + circles + connecting line */}
                        <div className="relative">
                          {/* Weight labels row */}
                          <div className="flex justify-around mb-1">
                            {displayWeights.map((w, i) => (
                              <div key={i} className="flex flex-col items-center flex-1">
                                <span className={`text-[11px] font-bold ${
                                  vacAxles[i]?.isLifted ? "text-amber-600" : "text-slate-700"
                                }`}>
                                  {w > 0 ? w.toLocaleString("id-ID") : "—"}
                                </span>
                                <span className="text-[9px] text-slate-400">kg</span>
                              </div>
                            ))}
                          </div>

                          {/* Circles + line */}
                          <div className="relative flex items-center justify-around py-1.5">
                            <div className="absolute left-0 right-0 h-0.5 bg-slate-300 top-1/2 -translate-y-1/2 mx-6" />
                            {displayWeights.map((_, i) => {
                              const isLift = vacAxles[i]?.isLifted ?? false;
                              return (
                                <div key={i} className="relative z-10 flex flex-col items-center flex-1">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-[12px] font-extrabold shadow-sm border-2 ${
                                    isLift
                                      ? "bg-amber-100 border-amber-400 text-amber-700"
                                      : "bg-blue-600 border-blue-600 text-white"
                                  }`}>
                                    {i + 1}
                                  </div>
                                </div>
                              );
                            })}
                          </div>

                          {/* Axle label row */}
                          <div className="flex justify-around mt-1">
                            {displayWeights.map((_, i) => (
                              <div key={i} className="flex flex-col items-center flex-1">
                                <span className="text-[9px] text-slate-400">S-{i + 1}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Status badge */}
                        <div className="flex items-center justify-center gap-3 mt-2">
                          {lifted === 0 ? (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
                              <CheckmarkCircle20Filled className="w-3.5 h-3.5 text-green-600" />
                              Sesuai Pembacaan
                            </span>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded-full">
                              <Warning24Regular className="w-3.5 h-3.5 text-amber-600" />
                              {lifted} Sumbu Terangkat
                            </span>
                          )}
                          {isDummy && (
                            <span className="text-[10px] text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                              * Berat per sumbu adalah estimasi
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </Card>
          )}

          {/* ROW 4: Timeline (55%) + Bukti Tambahan + Informasi Penindakan (45%) */}
          <div className="grid grid-cols-11 gap-4 items-start">

            {/* ── Timeline (6/11) */}
            <Card className="col-span-6">
              <CardTitle icon={<VehicleCar24Regular />} title="Timeline Proses Pengambilan Data" />
              <div className="p-5">
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-5 top-3 bottom-3 w-0.5 bg-slate-200" />
                  <div className="space-y-0">
                    {[
                      {
                        key: "anpr", label: "ANPR (Pengenalan Plat)",
                        done: !!vehicle.transact_anpr_capture,
                        time: vehicle.transact_anpr_capture?.created_date,
                        icon: <Camera24Regular />,
                        details: vehicle.transact_anpr_capture ? [
                          `Plat: ${vehicle.transact_anpr_capture.plate_no ?? "—"}`,
                          `Tingkat Keyakinan: ${Number(vehicle.transact_anpr_capture.confidence ?? 0).toFixed(1)}%`,
                          `Lokasi: ${vehicle.transact_anpr_capture.location_code ?? "—"}`,
                        ] : [],
                        imgUrl: vehicle.transact_anpr_capture?.minio_bucket && vehicle.transact_anpr_capture?.minio_full_image_object
                          ? getMinioImageUrl(vehicle.transact_anpr_capture.minio_bucket, vehicle.transact_anpr_capture.minio_full_image_object) : null,
                      },
                      {
                        key: "wim", label: "WIM (Timbangan)",
                        done: !!vehicle.transact_weighing,
                        time: vehicle.transact_weighing?.created_date,
                        icon: <Scales24Regular />,
                        details: vehicle.transact_weighing ? [
                          `Berat Total: ${fmtKg(vehicle.transact_weighing.total_weight)}`,
                          `Sumbu: ${vehicle.transact_weighing.total_axle ?? "—"}`,
                          `Status: Terbaca`,
                        ] : [],
                        imgUrl: vehicle.transact_anpr_capture?.minio_bucket && vehicle.transact_anpr_capture?.minio_full_image_object
                          ? getMinioImageUrl(vehicle.transact_anpr_capture.minio_bucket, vehicle.transact_anpr_capture.minio_full_image_object) : null,
                      },
                      {
                        key: "axle", label: "AXLE (Deteksi Sumbu)",
                        done: !!vehicle.transact_axle_capture,
                        time: vehicle.transact_axle_capture?.created_date,
                        icon: <VehicleTruck24Regular />,
                        details: vehicle.transact_axle_capture ? [
                          `Kategori: ${vehicle.transact_axle_capture.vehicle_category ?? "—"}`,
                          `Tipe Body: ${vehicle.transact_axle_capture.vehicle_body_type ?? "—"}`,
                          `Total Sumbu: ${vehicle.transact_axle_capture.total_axles ?? "—"}`,
                          `Total Roda: ${vehicle.transact_axle_capture.total_wheels ?? "—"}`,
                        ] : [],
                        imgUrl: vehicle.transact_axle_capture?.minio_bucket && vehicle.transact_axle_capture?.minio_image_object
                          ? getMinioImageUrl(vehicle.transact_axle_capture.minio_bucket, vehicle.transact_axle_capture.minio_image_object) : null,
                      },
                      {
                        key: "cctv", label: "CCTV (Verifikasi Video)",
                        done: !!vehicle.transact_cctv,
                        time: vehicle.transact_cctv?.created_date,
                        icon: <Video24Regular />,
                        details: vehicle.transact_cctv ? [`Verifikasi visual kendaraan dan kondisi jalan berhasil`] : [],
                        imgUrl: cctvUrl,
                      },
                      {
                        key: "decision", label: "DECISION (Keputusan)",
                        done: !!lastStatus,
                        time: lastStatus?.created_date,
                        icon: <Shield24Regular />,
                        details: lastStatus ? [
                          `Hasil: ${lastStatus.result ?? "—"}`,
                          ...(lastStatus.notes ? [`Pasal: ${lastStatus.notes.split(".")[0]}`] : []),
                          `Status: ${lastStatus.status ?? "—"}`,
                        ] : [],
                        imgUrl: null,
                        isDecision: true,
                        violResult: lastStatus?.result ?? "",
                      },
                    ].map((step, idx, arr) => (
                      <div key={step.key} className={`flex gap-3 relative ${idx < arr.length - 1 ? "pb-5" : ""}`}>
                        {/* Node */}
                        <div className={`relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                          step.done
                            ? (step as any).isDecision
                              ? "bg-blue-600 text-white"
                              : "bg-green-500 text-white"
                            : "bg-slate-100 text-slate-400 border border-slate-200"
                        }`}>
                          {step.done && !(step as any).isDecision
                            ? <CheckmarkCircle20Filled className="w-5 h-5 text-white" />
                            : <span className="w-4 h-4 flex items-center justify-center">{step.icon}</span>}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-slate-800">{step.label}</p>
                            {step.time && <p className="text-[10px] text-slate-400 shrink-0">{fmtDateTime(step.time)}</p>}
                          </div>
                          {step.done && step.details.length > 0 && (
                            <div className="mt-1.5 bg-slate-50 rounded-lg border border-slate-100 p-3 flex gap-3">
                              <div className="flex-1 space-y-0.5">
                                {step.details.map((d, i) => {
                                  const isViolResult = d.startsWith("Hasil:") && (step as any).violResult;
                                  return (
                                    <p key={i} className={`text-[12px] ${isViolResult ? violStyle.color + " font-bold" : "text-slate-600"}`}>
                                      {d}
                                    </p>
                                  );
                                })}
                              </div>
                              {step.imgUrl && (
                                <button
                                  onClick={() => { setLightboxUrl(step.imgUrl!); setLightboxZoom(1); }}
                                  className="relative w-20 h-14 shrink-0 rounded overflow-hidden border border-slate-200 bg-slate-100 group hover:border-blue-400 transition-colors"
                                  title="Klik untuk memperbesar"
                                >
                                  <Image src={step.imgUrl} alt={step.label} fill className="object-cover"
                                    onError={e => { (e.currentTarget as any).style.display = "none"; }} />
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all flex items-center justify-center">
                                    <Eye20Regular className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                  </div>
                                </button>
                              )}
                            </div>
                          )}
                          {/* DECISION: VERIFIKASI button or verified result */}
                          {(step as any).isDecision && (
                            <div className="mt-2">
                              {!isVerified ? (
                                <button
                                  onClick={() => setTab("verifikasi")}
                                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-[12px] font-bold rounded-lg shadow-sm transition-colors"
                                >
                                  <Shield24Regular className="w-4 h-4" />
                                  VERIFIKASI
                                </button>
                              ) : (
                                <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                  <CheckmarkCircle20Filled className="w-4 h-4 text-green-600 shrink-0" />
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[12px] font-bold text-green-700">
                                      {lastStatus?.result ?? lastStatus?.status ?? "Terverifikasi"}
                                    </p>
                                    {lastStatus?.notes && (
                                      <p className="text-[10px] text-green-600 mt-0.5 truncate">{lastStatus.notes}</p>
                                    )}
                                  </div>
                                  <button
                                    onClick={() => setTab("verifikasi")}
                                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold whitespace-nowrap flex items-center gap-0.5 shrink-0"
                                  >
                                    Edit <ArrowRight16Regular className="w-3 h-3" />
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                          {!step.done && !(step as any).isDecision && (
                            <p className="text-[11px] text-slate-400 italic mt-1">Data belum tersedia</p>
                          )}
                          {!step.done && (step as any).isDecision && !isVerified && (
                            <p className="text-[11px] text-slate-400 italic mt-1">Belum diverifikasi petugas</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Card>

            {/* ── Bukti Tambahan + Informasi Penindakan (5/11) */}
            <div className="col-span-5 space-y-4">

              {/* Bukti Tambahan */}
              <Card>
                <CardTitle icon={<Video24Regular />} title="Bukti Tambahan" />
                <div className="p-4 space-y-4">

                  {/* CCTV */}
                  <div>
                    <p className="text-[11px] font-semibold text-slate-500 mb-1.5">CCTV - Depan</p>
                    <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                      {cctvUrl ? (
                        <video src={cctvUrl} controls preload="metadata" className="w-full h-full object-contain" />
                      ) : (
                        <div className="flex flex-col items-center justify-center h-full text-slate-600 gap-2">
                          <Video24Regular className="w-8 h-8" />
                          <p className="text-[11px]">Video tidak tersedia</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Photos */}
                  {attachments.length > 0 && (
                    <div>
                      <p className="text-[11px] font-semibold text-slate-500 mb-1.5">Foto Kendaraan</p>
                      {/* Main photo */}
                      <div className="relative aspect-video bg-slate-100 rounded-lg overflow-hidden border border-slate-200 mb-2 group cursor-zoom-in"
                        onClick={() => { setLightboxUrl(attachments[photoIdx]?.src ?? null); setLightboxZoom(1); }}>
                        <Image src={attachments[photoIdx]?.src ?? ""} alt="Foto" fill className="object-cover"
                          onError={e => { (e.currentTarget as any).style.display = "none"; }} />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
                          <Eye20Regular className="w-6 h-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                        </div>
                        {attachments.length > 1 && <>
                          <button onClick={() => setPhotoIdx(p => Math.max(0, p - 1))} disabled={photoIdx === 0}
                            className="absolute left-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-20">
                            <ArrowLeft12Regular className="w-3 h-3" />
                          </button>
                          <button onClick={() => setPhotoIdx(p => Math.min(attachments.length - 1, p + 1))} disabled={photoIdx >= attachments.length - 1}
                            className="absolute right-2 top-1/2 -translate-y-1/2 w-7 h-7 bg-black/50 text-white rounded-full flex items-center justify-center disabled:opacity-20">
                            <ArrowRight12Regular className="w-3 h-3" />
                          </button>
                        </>}
                      </div>
                      {/* Thumbnails + dots */}
                      <div className="flex gap-1.5 overflow-x-auto">
                        {attachments.slice(0, 5).map((a, i) => (
                          <button key={a.key} onClick={() => setPhotoIdx(i)}
                            className={`relative w-16 h-12 rounded overflow-hidden shrink-0 border-2 transition-all ${i === photoIdx ? "border-blue-500" : "border-slate-200"}`}>
                            <Image src={a.src} alt="" fill className="object-cover"
                              onError={e => { (e.currentTarget as any).style.display = "none"; }} />
                          </button>
                        ))}
                      </div>
                      {/* Dots indicator */}
                      <div className="flex justify-center gap-1 mt-2">
                        {attachments.slice(0, 5).map((_, i) => (
                          <button key={i} onClick={() => setPhotoIdx(i)}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${i === photoIdx ? "bg-blue-500" : "bg-slate-300"}`} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Informasi Penindakan */}
              <Card className="relative overflow-hidden">
                <CardTitle icon={<Person24Regular />} title="Informasi Penindakan" />
                {/* Watermark */}
                <div className="absolute bottom-2 right-3 opacity-[0.05] pointer-events-none select-none">
                  <Shield24Regular style={{ width: 80, height: 80 }} />
                </div>
                <div className="p-4 relative">
                  <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                    {[
                      { label: "Petugas Penindak", value: officer?.full_name ?? "—" },
                      { label: "NRP", value: officer?.badge_no ?? "—" },
                      { label: "Lokasi Penindakan", value: vehicle.location_address ?? "—" },
                      { label: "Waktu Penindakan", value: fmtDateTime(lastStatus?.created_date) },
                    ].map(({ label, value }) => (
                      <div key={label}>
                        <p className="text-[10px] text-slate-400 font-medium">{label}</p>
                        <p className="text-[13px] font-semibold text-slate-800 mt-0.5">{value}</p>
                      </div>
                    ))}
                  </div>
                  {lastStatus?.notes && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-[10px] text-slate-400 font-medium mb-0.5">Catatan</p>
                      <p className="text-[12px] text-slate-700">{lastStatus.notes}</p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </div>
        </>}

        {/* ═══ TAB: HISTORI ═══ */}
        {/* ═══ TAB: VERIFIKASI PETUGAS ═══ */}
        {tab === "verifikasi" && (
          <V2VerifikasiModule id={id} onBack={() => setTab("aktif")} />
        )}

        {/* ═══ TAB: HISTORI ═══ */}
        {tab === "histori" && (
          <Card>
            <CardTitle icon={<VehicleCar24Regular />} title={`Riwayat Kendaraan — ${plateNo}`} />
            <div className="p-4">
              {histLoading ? (
                <div className="flex items-center justify-center py-12 gap-2"><Spinner size="small" /><span className="text-[12px] text-slate-500">Memuat riwayat…</span></div>
              ) : historyRows.length === 0 ? (
                <div className="text-center py-12 space-y-2">
                  <p className="text-[12px] text-slate-500">Tidak ada riwayat untuk plat {plateNo}</p>
                </div>
              ) : (
                <div className="overflow-x-auto rounded-lg border border-slate-100">
                  <table className="w-full text-[12px]">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-100">
                        {["#", "Tanggal", "No. Plat", "Berat", "Sumbu", "Dimensi (P×L×T)", "Pelanggaran", ""].map(h => (
                          <th key={h} className="text-left text-[10px] text-slate-400 font-bold px-3 py-2 uppercase">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {historyRows.map((row: any, idx: number) => {
                        const st = row.transact_vehicle_statuses?.[row.transact_vehicle_statuses.length - 1];
                        const vType = st?.result ?? st?.status ?? "—";
                        const vs = getViolationStyle(vType);
                        return (
                          <tr key={row.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                            <td className="px-3 py-2.5 text-slate-400">{idx + 1}</td>
                            <td className="px-3 py-2.5 text-slate-600">{fmtDateTime(row.created_date)}</td>
                            <td className="px-3 py-2.5">
                              <span className="bg-slate-800 text-white font-bold px-1.5 py-0.5 rounded text-[10px] tracking-widest">
                                {row.actual_plat_no ?? "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2.5 font-semibold text-slate-700">{fmtKg(row.actual_weight)}</td>
                            <td className="px-3 py-2.5 text-slate-600">{row.actual_total_axle ?? "—"}</td>
                            <td className="px-3 py-2.5 text-slate-600 font-mono text-[11px]">
                              {row.actual_length != null ? `${Number(row.actual_length).toFixed(1)}×${Number(row.actual_width ?? 0).toFixed(1)}×${Number(row.actual_height ?? 0).toFixed(1)}` : "—"}
                            </td>
                            <td className="px-3 py-2.5">
                              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${vs.badge}`}>{vType}</span>
                            </td>
                            <td className="px-3 py-2.5">
                              <Link href={`/v2/jatanlin/${row.id}`}
                                className="flex items-center gap-1 text-blue-600 hover:text-blue-800 font-semibold text-[11px]">
                                <Eye20Regular className="w-3.5 h-3.5" /> Detail <ArrowRight16Regular className="w-3 h-3" />
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default V2JatanlinDetailModule;
