/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Spinner } from "@fluentui/react-components";
import {
  ArrowLeft24Regular,
  CheckmarkCircle24Filled,
  Dismiss24Regular,
  Save20Regular,
  Shield24Regular,
  Warning24Regular,
  Camera24Regular,
  Video24Regular,
  VehicleTruck24Regular,
  ArrowUpload20Regular,
} from "@fluentui/react-icons";
import { useGetVehicleActualByIdQuery } from "@/src/graphql/hooks/transact-vehicle-actual";
import { useGetVehicleClassesQuery } from "@/src/graphql/hooks/master-vehicle-class";
import {
  useInsertVehicleStatusMutation,
  useUpdateVehicleStatusMutation,
} from "@/src/graphql/hooks/transact-vehicle-status";
import { useAppSelector } from "@/src/redux/hooks";
import { getMinioImageUrl, getImageUrl } from "@/src/utils/image";

interface Props {
  id: string;
  onBack?: () => void; // if embedded in tab, use this instead of router
}

const VIOLATION_OPTIONS = [
  { value: "Normal", label: "Normal", color: "text-green-600" },
  { value: "Over Dimension", label: "Over Dimension", color: "text-orange-600" },
  { value: "Over Loading", label: "Over Loading", color: "text-red-600" },
  { value: "Over Dimension & Loading", label: "Over Dimension & Loading", color: "text-red-700" },
];

const fmtDateTime = (d?: string | null) => {
  if (!d) return new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) + ", " + new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" }) + ", " + new Date(d).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB";
};

export const V2VerifikasiModule: React.FC<Props> = ({ id, onBack }) => {
  const router = useRouter();
  const { user } = useAppSelector((s: any) => s.login);

  const { data, loading, refetch } = useGetVehicleActualByIdQuery({ variables: { id } });
  const vehicle = data?.transact_vehicle_actual_by_pk;
  const lastStatus = vehicle?.transact_vehicle_statuses?.[vehicle.transact_vehicle_statuses.length - 1];
  const isVerified = ["verified", "selesai", "normal", "odol", "rejected"].includes(
    lastStatus?.status?.toLowerCase() ?? ""
  );

  // Vehicle class
  const axleCount = vehicle?.actual_total_axle ?? 0;
  const { data: classData } = useGetVehicleClassesQuery({ variables: { limit: 100, offset: 0, where: {} } });
  const vehicleClass = (() => {
    const cls = (classData?.master_vehicle_class as any[]) ?? [];
    return cls.find((c: any) => c.total_axle === axleCount)
      ?? [...cls].sort((a: any, b: any) => Math.abs(a.total_axle - axleCount) - Math.abs(b.total_axle - axleCount))[0]
      ?? null;
  })();

  // Mutations
  const [insertStatus, { loading: inserting }] = useInsertVehicleStatusMutation();
  const [updateStatus, { loading: updating }] = useUpdateVehicleStatusMutation();
  const isSaving = inserting || updating;

  // Form state (init from DB once loaded)
  const plateNo = vehicle?.actual_plat_no ?? vehicle?.transact_anpr_capture?.plate_no ?? "";
  const [verPlat, setVerPlat] = useState("");
  const [verJenis, setVerJenis] = useState("Normal");
  const [verBerat, setVerBerat] = useState("");
  const [verJumlahAs, setVerJumlahAs] = useState("");
  const [verPanjang, setVerPanjang] = useState("");
  const [verLebar, setVerLebar] = useState("");
  const [verTinggi, setVerTinggi] = useState("");
  const [verAlamat, setVerAlamat] = useState("");
  const [verCatatan, setVerCatatan] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [toast, setToast] = useState<{ msg: string; type: "success" | "error" } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Populate form when data loads
  useEffect(() => {
    if (!vehicle) return;
    const s = vehicle.transact_vehicle_statuses?.[vehicle.transact_vehicle_statuses.length - 1];
    setVerPlat(vehicle.actual_plat_no ?? vehicle.transact_anpr_capture?.plate_no ?? "");
    setVerJenis(s?.result ?? "Normal");
    setVerBerat(vehicle.actual_weight != null ? (Number(vehicle.actual_weight) / 1000).toFixed(2) : "");
    setVerJumlahAs(String(vehicle.actual_total_axle ?? ""));
    setVerPanjang(vehicle.actual_length != null ? Number(vehicle.actual_length).toFixed(3) : "");
    setVerLebar(vehicle.actual_width != null ? Number(vehicle.actual_width).toFixed(2) : "");
    setVerTinggi(vehicle.actual_height != null ? Number(vehicle.actual_height).toFixed(2) : "");
    setVerAlamat(vehicle.location_address ?? vehicle.transact_anpr_capture?.location_code ?? "");
    setVerCatatan(s?.notes ?? "");
  }, [vehicle]);

  const showToast = (msg: string, type: "success" | "error" = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleSubmit = async (action: "draft" | "verify" | "reject") => {
    if (!vehicle) return;
    const statusMap = { draft: "diproses", verify: "verified", reject: "rejected" };
    const resultMap = { draft: verJenis, verify: verJenis, reject: "Ditolak" };
    const payload = {
      status: statusMap[action],
      result: resultMap[action],
      notes: verCatatan || `Plat: ${verPlat}, Berat: ${verBerat} TON, As: ${verJumlahAs}, P: ${verPanjang}m, L: ${verLebar}m, T: ${verTinggi}m`,
      updated_by: user?.id,
      updated_date: new Date().toISOString(),
      site_id: vehicle.site_id,
    };
    try {
      if (lastStatus?.id) {
        await updateStatus({ variables: { id: lastStatus.id, set: payload } });
      } else {
        await insertStatus({
          variables: {
            object: {
              transact_vehicle_actual_id: id,
              ...payload,
              site_id: vehicle.site_id,
              created_by: user?.id,
            },
          },
        });
      }
      showToast(action === "verify" ? "Verifikasi berhasil disimpan" : action === "reject" ? "Data ditolak" : "Draf disimpan");
      refetch();
    } catch (e: any) {
      showToast("Gagal menyimpan: " + e.message, "error");
    }
  };

  // ANPR image
  const anprImg = vehicle?.transact_anpr_capture?.minio_bucket && vehicle?.transact_anpr_capture?.minio_full_image_object
    ? getMinioImageUrl(vehicle.transact_anpr_capture.minio_bucket, vehicle.transact_anpr_capture.minio_full_image_object) : null;
  // Axle image
  const axleImg = vehicle?.transact_axle_capture?.minio_bucket && vehicle?.transact_axle_capture?.minio_image_object
    ? getMinioImageUrl(vehicle.transact_axle_capture.minio_bucket, vehicle.transact_axle_capture.minio_image_object) : null;
  // CCTV
  const cctvUrl = vehicle?.transact_cctv?.filepath ? getImageUrl(vehicle.transact_cctv.filepath) : null;

  // Comparison table
  const maxWgt = vehicleClass?.class_2_weight != null ? Number(vehicleClass.class_2_weight) / 1000 : null;
  const rows = [
    {
      kolom: "Plat Nomor",
      awal: plateNo || "—",
      aktual: verPlat || "—",
      batas: "—",
      selisih: "—",
      sesuai: verPlat.toUpperCase() === plateNo.toUpperCase(),
    },
    {
      kolom: "Berat (TON)",
      awal: vehicle?.actual_weight != null ? (Number(vehicle.actual_weight) / 1000).toFixed(2) : "—",
      aktual: verBerat || "—",
      batas: maxWgt != null ? `≤ ${maxWgt.toFixed(2)}` : "—",
      selisih: maxWgt != null && verBerat ? (parseFloat(verBerat) - maxWgt).toFixed(2) : "—",
      sesuai: maxWgt == null || !verBerat || parseFloat(verBerat) <= maxWgt,
    },
    {
      kolom: "Jumlah As",
      awal: String(vehicle?.actual_total_axle ?? "—"),
      aktual: verJumlahAs || "—",
      batas: "—",
      selisih: "—",
      sesuai: true,
    },
    {
      kolom: "Panjang (m)",
      awal: vehicle?.actual_length != null ? Number(vehicle.actual_length).toFixed(3) : "—",
      aktual: verPanjang || "—",
      batas: vehicleClass?.length != null ? `≤ ${vehicleClass.length}` : "—",
      selisih: vehicleClass?.length != null && verPanjang
        ? (parseFloat(verPanjang) - Number(vehicleClass.length)).toFixed(3) : "—",
      sesuai: vehicleClass?.length == null || !verPanjang || parseFloat(verPanjang) <= Number(vehicleClass.length),
    },
    {
      kolom: "Lebar (m)",
      awal: vehicle?.actual_width != null ? Number(vehicle.actual_width).toFixed(2) : "—",
      aktual: verLebar || "—",
      batas: vehicleClass?.width != null ? `≤ ${vehicleClass.width}` : "—",
      selisih: vehicleClass?.width != null && verLebar
        ? (parseFloat(verLebar) - Number(vehicleClass.width)).toFixed(2) : "—",
      sesuai: vehicleClass?.width == null || !verLebar || parseFloat(verLebar) <= Number(vehicleClass.width),
    },
    {
      kolom: "Tinggi (m)",
      awal: vehicle?.actual_height != null ? Number(vehicle.actual_height).toFixed(2) : "—",
      aktual: verTinggi || "—",
      batas: vehicleClass?.height != null ? `≤ ${vehicleClass.height}` : "—",
      selisih: vehicleClass?.height != null && verTinggi
        ? (parseFloat(verTinggi) - Number(vehicleClass.height)).toFixed(2) : "—",
      sesuai: vehicleClass?.height == null || !verTinggi || parseFloat(verTinggi) <= Number(vehicleClass.height),
    },
  ];

  const inputCls = "w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-[13px] text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-400 transition-all";
  const labelCls = "block text-[11px] font-semibold text-slate-500 mb-1.5";

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="large" />
    </div>
  );

  return (
    <div className="min-h-full bg-slate-50">
      {/* Toast */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-xl text-white text-[13px] font-semibold flex items-center gap-2 ${toast.type === "success" ? "bg-green-600" : "bg-red-600"}`}>
          {toast.type === "success" ? <CheckmarkCircle24Filled className="w-5 h-5" /> : <Warning24Regular className="w-5 h-5" />}
          {toast.msg}
        </div>
      )}

      {/* ── Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center gap-3 sticky top-0 z-10 shadow-sm">
        <button onClick={onBack ?? (() => router.back())}
          className="flex items-center gap-1 text-slate-500 hover:text-slate-800 text-xs font-medium shrink-0">
          <ArrowLeft24Regular className="w-4 h-4" /> Kembali
        </button>
        <div>
          <h1 className="text-[15px] font-extrabold text-slate-900">Verifikasi</h1>
          <p className="text-[11px] text-slate-400">Verifikasi data kendaraan yang terdeteksi</p>
        </div>
        {isVerified && (
          <span className="ml-auto flex items-center gap-1.5 text-[11px] font-bold text-green-700 bg-green-50 border border-green-200 px-3 py-1 rounded-full">
            <CheckmarkCircle24Filled className="w-4 h-4" />
            Sudah Diverifikasi
          </span>
        )}
      </div>

      <div className="flex gap-0 h-full">
        {/* ── LEFT FORM */}
        <div className="flex-1 px-6 py-4 overflow-y-auto space-y-4">

          {/* Class info bar */}
          {vehicleClass && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 flex items-center gap-4 flex-wrap">
              <div className="flex items-center gap-2 shrink-0">
                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center">
                  <svg viewBox="0 0 16 16" fill="white" className="w-3.5 h-3.5">
                    <path d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zm-.02-1.2a1 1 0 1 1 0-2 1 1 0 0 1 0 2z"/>
                  </svg>
                </div>
                <span className="text-[12px] font-bold text-blue-800">Informasi Kelas Kendaraan — {vehicleClass.type}</span>
              </div>
              <div className="flex gap-6 flex-wrap">
                {[
                  { label: "Berat Maks (Kelas III)", value: vehicleClass.class_2_weight != null ? `${(Number(vehicleClass.class_2_weight)/1000).toFixed(2)} TON` : "—", icon: <Warning24Regular className="w-4 h-4 text-amber-500" /> },
                  { label: "Panjang Maks", value: vehicleClass.length != null ? `${vehicleClass.length} m` : "—", icon: <VehicleTruck24Regular className="w-4 h-4 text-blue-500" /> },
                  { label: "Lebar Maks", value: vehicleClass.width != null ? `${vehicleClass.width} m` : "—", icon: <VehicleTruck24Regular className="w-4 h-4 text-blue-500" /> },
                  { label: "Tinggi Maks", value: vehicleClass.height != null ? `${vehicleClass.height} m` : "—", icon: <VehicleTruck24Regular className="w-4 h-4 text-blue-500" /> },
                ].map(({ label, value, icon }) => (
                  <div key={label} className="flex items-center gap-2">
                    {icon}
                    <div>
                      <p className="text-[9px] text-blue-500 font-semibold uppercase">{label}</p>
                      <p className="text-[13px] font-extrabold text-blue-800">{value}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form fields */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
            <div className="grid grid-cols-2 gap-4">
              {/* Waktu Verifikasi */}
              <div>
                <label className={labelCls}>Waktu Verifikasi</label>
                <div className="relative">
                  <input value={fmtDateTime(vehicle?.created_date)} readOnly
                    className={inputCls + " bg-slate-50 text-slate-500 cursor-not-allowed"} />
                </div>
              </div>
              {/* Plat Nomor */}
              <div>
                <label className={labelCls}>Plat Nomor</label>
                <input value={verPlat} onChange={e => setVerPlat(e.target.value.toUpperCase())}
                  className={inputCls} placeholder="Plat nomor kendaraan" />
              </div>
              {/* Jenis Pelanggaran */}
              <div>
                <label className={labelCls}>Jenis Pelanggaran</label>
                <div className="relative">
                  <select value={verJenis} onChange={e => setVerJenis(e.target.value)}
                    className={inputCls + " appearance-none pr-8 cursor-pointer"}>
                    {VIOLATION_OPTIONS.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg viewBox="0 0 10 6" fill="currentColor" className="w-3 h-3 text-slate-400">
                      <path d="M0 0l5 6 5-6z"/>
                    </svg>
                  </div>
                </div>
              </div>
              {/* Berat */}
              <div>
                <label className={labelCls}>Berat (TON)</label>
                <input type="number" step="0.01" value={verBerat} onChange={e => setVerBerat(e.target.value)}
                  className={inputCls} placeholder="Berat aktual dalam TON" />
              </div>
              {/* Jumlah As */}
              <div>
                <label className={labelCls}>Jumlah As</label>
                <input type="number" value={verJumlahAs} onChange={e => setVerJumlahAs(e.target.value)}
                  className={inputCls} placeholder="Jumlah sumbu" />
              </div>
              {/* Panjang */}
              <div>
                <label className={labelCls}>Panjang (m)</label>
                <input type="number" step="0.001" value={verPanjang} onChange={e => setVerPanjang(e.target.value)}
                  className={inputCls} placeholder="Panjang kendaraan" />
              </div>
              {/* Lebar */}
              <div>
                <label className={labelCls}>Lebar (m)</label>
                <input type="number" step="0.01" value={verLebar} onChange={e => setVerLebar(e.target.value)}
                  className={inputCls} placeholder="Lebar kendaraan" />
              </div>
              {/* Tinggi */}
              <div>
                <label className={labelCls}>Tinggi (m)</label>
                <input type="number" step="0.01" value={verTinggi} onChange={e => setVerTinggi(e.target.value)}
                  className={inputCls} placeholder="Tinggi kendaraan" />
              </div>
            </div>
            {/* Alamat Lokasi */}
            <div className="mt-4">
              <label className={labelCls}>Alamat Lokasi</label>
              <textarea value={verAlamat} onChange={e => setVerAlamat(e.target.value)} rows={2}
                className={inputCls + " resize-none"} placeholder="Alamat atau nama lokasi penindakan" />
            </div>
            {/* Catatan */}
            <div className="mt-4">
              <label className={labelCls}>Catatan Verifikasi</label>
              <textarea value={verCatatan} onChange={e => setVerCatatan(e.target.value)} rows={2}
                className={inputCls + " resize-none"} placeholder="Catatan tambahan dari petugas" />
            </div>
          </div>

          {/* Comparison table */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-5 py-3 border-b border-slate-100">
              <h3 className="text-[13px] font-bold text-slate-800">Perbandingan Data Awal vs Aktual</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-[12px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    {["Kolom", "Data Awal (Sistem)", "Data Aktual (Verifikasi)", "Batas Legal", "Selisih", "Status"].map(h => (
                      <th key={h} className="text-left text-[10px] font-bold text-slate-500 uppercase px-4 py-2.5">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, i) => {
                    const selisihNum = parseFloat(String(row.selisih));
                    const selisihPositive = !isNaN(selisihNum) && selisihNum > 0;
                    return (
                      <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50">
                        <td className="px-4 py-2.5 font-semibold text-slate-700">{row.kolom}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.awal}</td>
                        <td className={`px-4 py-2.5 font-semibold ${!row.sesuai ? "text-red-600" : "text-slate-800"}`}>{row.aktual}</td>
                        <td className="px-4 py-2.5 text-slate-500">{row.batas}</td>
                        <td className={`px-4 py-2.5 font-semibold ${selisihPositive ? "text-red-600" : "text-slate-600"}`}>
                          {row.selisih !== "—" && selisihPositive ? `+${row.selisih}` : row.selisih}
                        </td>
                        <td className="px-4 py-2.5">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            row.sesuai
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                          }`}>
                            {row.sesuai ? "Sesuai" : "Melebihi"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center justify-between gap-3 pb-6">
            <button onClick={onBack ?? (() => router.back())}
              className="px-4 py-2 text-[12px] font-semibold text-slate-600 border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors">
              Batal
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => handleSubmit("draft")} disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors disabled:opacity-50">
                <Save20Regular className="w-4 h-4" />
                {isSaving ? "Menyimpan…" : "Simpan Draf"}
              </button>
              <button onClick={() => handleSubmit("verify")} disabled={isSaving}
                className="flex items-center gap-1.5 px-5 py-2 text-[12px] font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                <CheckmarkCircle24Filled className="w-4 h-4" />
                {isSaving ? "Menyimpan…" : "Verifikasi & Simpan"}
              </button>
              <button onClick={() => handleSubmit("reject")} disabled={isSaving}
                className="flex items-center gap-1.5 px-4 py-2 text-[12px] font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors shadow-sm disabled:opacity-50">
                <Dismiss24Regular className="w-4 h-4" />
                Tolak
              </button>
            </div>
          </div>
        </div>

        {/* ── RIGHT PANEL */}
        <div className="w-80 shrink-0 border-l border-slate-200 bg-white flex flex-col overflow-y-auto">

          {/* Bukti ANPR */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Camera24Regular className="w-4 h-4 text-slate-500" />
                <span className="text-[12px] font-bold text-slate-700">Bukti ANPR</span>
              </div>
              {vehicle?.transact_anpr_capture && (
                <span className="text-[9px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Terverifikasi</span>
              )}
            </div>
            {vehicle?.transact_anpr_capture && (
              <div className="px-4 pb-4 space-y-2">
                <span className="inline-block bg-slate-900 text-white font-bold text-[12px] tracking-widest px-2.5 py-0.5 rounded">
                  {vehicle.transact_anpr_capture.plate_no ?? "—"}
                </span>
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-400">Waktu</p>
                  <p>{vehicle.transact_anpr_capture.created_date
                    ? new Date(vehicle.transact_anpr_capture.created_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : "—"}</p>
                  <p>{vehicle.transact_anpr_capture.created_date
                    ? new Date(vehicle.transact_anpr_capture.created_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
                    : "—"}</p>
                </div>
                {anprImg && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-100 mt-2">
                    <Image src={anprImg} alt="ANPR" fill className="object-cover"
                      onError={e => { (e.currentTarget as any).style.display = "none"; }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bukti Axle */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <VehicleTruck24Regular className="w-4 h-4 text-slate-500" />
                <span className="text-[12px] font-bold text-slate-700">Bukti Axle (Deteksi Sumbu)</span>
              </div>
              {vehicle?.transact_axle_capture && (
                <span className="text-[9px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Terverifikasi</span>
              )}
            </div>
            {vehicle?.transact_axle_capture && (
              <div className="px-4 pb-4 space-y-2">
                <div>
                  <p className="text-[10px] font-semibold text-slate-400">Jumlah As</p>
                  <p className="text-[16px] font-extrabold text-slate-800">{vehicle.transact_axle_capture.total_axles ?? "—"}</p>
                </div>
                {axleImg && (
                  <div className="relative aspect-video rounded-lg overflow-hidden border border-slate-200 bg-slate-900 mt-1">
                    <Image src={axleImg} alt="AXLE" fill className="object-cover"
                      onError={e => { (e.currentTarget as any).style.display = "none"; }} />
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Bukti CCTV */}
          <div className="border-b border-slate-100">
            <div className="flex items-center justify-between px-4 py-3">
              <div className="flex items-center gap-2">
                <Video24Regular className="w-4 h-4 text-slate-500" />
                <span className="text-[12px] font-bold text-slate-700">Bukti CCTV</span>
              </div>
              {vehicle?.transact_cctv && (
                <span className="text-[9px] font-bold bg-green-100 text-green-700 border border-green-200 px-2 py-0.5 rounded-full">Terverifikasi</span>
              )}
            </div>
            <div className="px-4 pb-4 space-y-2">
              {vehicle?.transact_cctv && (
                <div className="text-[10px] text-slate-500 space-y-0.5">
                  <p className="font-semibold text-slate-400">Waktu</p>
                  <p>{vehicle.transact_cctv.created_date
                    ? new Date(vehicle.transact_cctv.created_date).toLocaleDateString("id-ID", { day: "2-digit", month: "2-digit", year: "numeric" })
                    : "—"}</p>
                  <p>{vehicle.transact_cctv.created_date
                    ? new Date(vehicle.transact_cctv.created_date).toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", second: "2-digit" }) + " WIB"
                    : "—"}</p>
                </div>
              )}
              <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden border border-slate-200">
                {cctvUrl ? (
                  <video src={cctvUrl} controls preload="metadata" className="w-full h-full object-contain" />
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-1">
                    <Video24Regular className="w-6 h-6" />
                    <p className="text-[10px]">Video tidak tersedia</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Bukti Tambahan */}
          <div className="px-4 py-3">
            <div className="flex items-center gap-2 mb-3">
              <Shield24Regular className="w-4 h-4 text-slate-500" />
              <span className="text-[12px] font-bold text-slate-700">Bukti Tambahan</span>
            </div>
            <input ref={fileRef} type="file" accept="image/*,video/*,.pdf" multiple className="hidden"
              onChange={e => {
                const names = Array.from(e.target.files ?? []).map(f => f.name);
                setUploadedFiles(prev => [...prev, ...names]);
              }} />
            <button onClick={() => fileRef.current?.click()}
              className="w-full border-2 border-dashed border-slate-200 rounded-xl p-4 text-center hover:border-blue-300 hover:bg-blue-50/30 transition-all">
              <ArrowUpload20Regular className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-[11px] font-semibold text-slate-500">Drag & drop file atau klik untuk upload</p>
              <p className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, MP4, PDF (Maks. 10MB)</p>
            </button>
            {uploadedFiles.length > 0 && (
              <div className="mt-2 space-y-1">
                {uploadedFiles.map((name, i) => (
                  <div key={i} className="flex items-center justify-between text-[11px] bg-slate-50 border border-slate-100 rounded px-2 py-1">
                    <span className="truncate text-slate-600">{name}</span>
                    <button onClick={() => setUploadedFiles(f => f.filter((_, j) => j !== i))}
                      className="text-slate-400 hover:text-red-500 ml-2 shrink-0">✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default V2VerifikasiModule;
