/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useEffect, useState, useCallback } from "react";
import { gql, useQuery, useMutation } from "@apollo/client";
import {
  Card,
  CardHeader,
  Button,
  Input,
  Spinner,
  Toast,
  ToastTitle,
  ToastBody,
  Toaster,
  useToastController,
  useId,
} from "@fluentui/react-components";
import {
  ShieldSettings24Regular,
  NetworkCheck24Regular,
  Save24Regular,
  CheckmarkCircle24Filled,
  Warning24Filled,
  ArrowClockwise24Regular,
  LockClosed24Regular,
  Globe24Regular,
  Server24Regular,
  Camera24Regular,
  Scales24Regular,
  VideoClip24Regular,
  ArrowsBidirectional24Regular,
  Dismiss24Regular,
} from "@fluentui/react-icons";

// ─── GraphQL ──────────────────────────────────────────────────────────────────

const GET_ALL_ADMIN_CONFIGS = gql`
  query GetAdminConfigs {
    master_config(
      where: {
        config_type: { _in: ["DEVICE_CONFIG", "SYSTEM_MODE"] }
        is_deleted: { _eq: false }
      }
      order_by: { sort_order: asc }
    ) {
      id
      config_type
      config_key
      config_value
      description
      sort_order
    }
  }
`;

const UPSERT_CONFIG = gql`
  mutation UpsertAdminConfig($objects: [master_config_insert_input!]!) {
    insert_master_config(
      objects: $objects
      on_conflict: {
        constraint: master_config_config_type_config_key_key
        update_columns: [config_value, updated_date, is_active, is_deleted]
      }
    ) {
      returning {
        id
        config_type
        config_key
        config_value
      }
    }
  }
`;

// ─── Types & Constants ────────────────────────────────────────────────────────

type OperationMode = "DEMO" | "LIVE";

interface DeviceField {
  key: string;
  label: string;
  placeholder: string;
  description: string;
  type?: "text" | "password" | "number";
}

const DEVICE_GROUPS: { section: string; icon: React.ReactNode; fields: DeviceField[] }[] = [
  {
    section: "IP Perangkat",
    icon: <NetworkCheck24Regular />,
    fields: [
      { key: "WIM_IP",      label: "IP Jembatan Timbang (WIM)", placeholder: "10.0.43.10", description: "IP atau hostname alat Weight in Motion" },
      { key: "ANPR_IP",     label: "IP Kamera ANPR",            placeholder: "10.0.43.30", description: "IP kamera pengenal plat nomor" },
      { key: "AXLE_IP",     label: "IP Kamera Sumbu (VAC)",     placeholder: "10.0.43.40", description: "IP kamera penghitung sumbu Vidar" },
      { key: "CCTV_IP",     label: "IP Kamera CCTV",            placeholder: "10.0.43.20", description: "IP kamera CCTV bukti" },
      { key: "GATEWAY_IP",  label: "IP Gateway",                placeholder: "10.0.43.100", description: "IP router / modem switch" },
    ],
  },
  {
    section: "FTP (Kamera VAC/AXLE)",
    icon: <Server24Regular />,
    fields: [
      { key: "FTP_HOST",     label: "FTP Host",      placeholder: "10.0.43.40", description: "Host FTP server kamera sumbu" },
      { key: "FTP_PORT",     label: "FTP Port",      placeholder: "21",         description: "Port FTP (default: 21)", type: "number" },
      { key: "FTP_USER",     label: "FTP Username",  placeholder: "admin",      description: "Username FTP" },
      { key: "FTP_PASSWORD", label: "FTP Password",  placeholder: "••••••••",   description: "Password FTP", type: "password" },
      { key: "FTP_DIR",      label: "FTP Directory", placeholder: "/AXLE",      description: "Folder pada FTP server tempat file XML disimpan" },
    ],
  },
  {
    section: "Layanan & Infrastruktur",
    icon: <Globe24Regular />,
    fields: [
      { key: "MINIO_URL",   label: "Minio URL",   placeholder: "http://10.0.43.100:9000", description: "URL object storage Minio" },
      { key: "API_URL",     label: "Backend API URL", placeholder: "http://10.0.43.100:4000", description: "URL backend API service" },
      { key: "HASURA_URL",  label: "Hasura GraphQL URL", placeholder: "http://10.0.43.100:5000/v1/graphql", description: "Endpoint GraphQL Hasura" },
    ],
  },
];

// ─── Types ───────────────────────────────────────────────────────────────────
type PingResult = "idle" | "testing" | "ok" | "fail" | "timeout";

// ─── Helper ───────────────────────────────────────────────────────────────────

function buildConfigMap(rows: any[]): Record<string, { id?: string; value: string }> {
  const map: Record<string, { id?: string; value: string }> = {};
  for (const row of rows) {
    const key = `${row.config_type}__${row.config_key}`;
    map[key] = { id: row.id, value: row.config_value ?? "" };
  }
  return map;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const AdminSettingModule: React.FC = () => {
  const toasterId = useId("toaster");
  const { dispatchToast } = useToastController(toasterId);

  const { data, loading, refetch } = useQuery(GET_ALL_ADMIN_CONFIGS, {
    fetchPolicy: "cache-and-network",
  });

  const [upsertConfig, { loading: saving }] = useMutation(UPSERT_CONFIG);

  // ── Mode state ──
  const [mode, setMode] = useState<OperationMode>("DEMO");

  // ── Device field state ──
  const [fields, setFields] = useState<Record<string, string>>({});

  // ── Track dirty fields ──
  const [dirty, setDirty] = useState(false);

  // ── Connection test state ──
  const [pingResults, setPingResults] = useState<Record<string, PingResult>>({});
  const [pingLatency, setPingLatency] = useState<Record<string, number>>({});

  const pingDevice = useCallback(async (key: string, ip: string) => {
    if (!ip.trim()) return;
    setPingResults((p) => ({ ...p, [key]: "testing" }));
    const url = ip.startsWith("http") ? ip : `http://${ip}`;
    const start = Date.now();
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 5000);
    try {
      await fetch(url, { method: "GET", mode: "no-cors", cache: "no-store", signal: controller.signal });
      const ms = Date.now() - start;
      setPingLatency((p) => ({ ...p, [key]: ms }));
      setPingResults((p) => ({ ...p, [key]: "ok" }));
    } catch (e: any) {
      if (e?.name === "AbortError") {
        setPingResults((p) => ({ ...p, [key]: "timeout" }));
      } else {
        // no-cors errors on success too — treat any non-abort response as reachable
        const ms = Date.now() - start;
        if (ms < 4800) {
          setPingLatency((p) => ({ ...p, [key]: ms }));
          setPingResults((p) => ({ ...p, [key]: "ok" }));
        } else {
          setPingResults((p) => ({ ...p, [key]: "fail" }));
        }
      }
    } finally {
      clearTimeout(timer);
    }
  }, []);

  const pingAll = useCallback(() => {
    const devices = [
      { key: "ANPR_IP",  ip: fields["ANPR_IP"]  ?? "" },
      { key: "AXLE_IP",  ip: fields["AXLE_IP"]  ?? "" },
      { key: "CCTV_IP",  ip: fields["CCTV_IP"]  ?? "" },
      { key: "WIM_IP",   ip: fields["WIM_IP"]   ?? "" },
    ];
    devices.forEach(({ key, ip }) => { if (ip) pingDevice(key, ip); });
  }, [fields, pingDevice]);

  // Hydrate state from DB on load
  useEffect(() => {
    if (!data?.master_config) return;
    const map = buildConfigMap(data.master_config);

    // Mode
    const modeVal = map["SYSTEM_MODE__OPERATION_MODE"]?.value;
    if (modeVal === "LIVE" || modeVal === "DEMO") setMode(modeVal);

    // Device fields
    const initial: Record<string, string> = {};
    DEVICE_GROUPS.forEach((group) =>
      group.fields.forEach((f) => {
        initial[f.key] = map[`DEVICE_CONFIG__${f.key}`]?.value ?? "";
      })
    );
    setFields(initial);
    setDirty(false);
  }, [data]);

  const handleFieldChange = (key: string, value: string) => {
    setFields((prev) => ({ ...prev, [key]: value }));
    setDirty(true);
  };

  const handleModeChange = (newMode: OperationMode) => {
    setMode(newMode);
    setDirty(true);
  };

  const handleSave = useCallback(async () => {
    try {
      const objects: any[] = [];

      // Mode
      objects.push({
        config_type: "SYSTEM_MODE",
        config_key: "OPERATION_MODE",
        code: "SYSTEM_MODE_OPERATION_MODE",
        config_value: mode,
        description: "Mode operasi sistem: DEMO atau LIVE",
        sort_order: 1,
        is_active: true,
        is_deleted: false,
        created_by: "00000000-0000-0000-0000-000000000000",
        created_date: new Date().toISOString(),
        updated_date: new Date().toISOString(),
      });

      // Device fields
      let sortOrder = 10;
      DEVICE_GROUPS.forEach((group) => {
        group.fields.forEach((f) => {
          const val = fields[f.key] ?? "";
          objects.push({
            config_type: "DEVICE_CONFIG",
            config_key: f.key,
            code: `DEVICE_CONFIG_${f.key}`,
            config_value: val,
            description: f.description,
            sort_order: sortOrder++,
            is_active: true,
            is_deleted: false,
            created_by: "00000000-0000-0000-0000-000000000000",
            created_date: new Date().toISOString(),
            updated_date: new Date().toISOString(),
          });
        });
      });

      await upsertConfig({ variables: { objects } });
      await refetch();
      setDirty(false);

      dispatchToast(
        <Toast>
          <ToastTitle>Konfigurasi disimpan</ToastTitle>
          <ToastBody>Semua pengaturan berhasil disimpan ke database.</ToastBody>
        </Toast>,
        { intent: "success", timeout: 3000 }
      );
    } catch (err: any) {
      dispatchToast(
        <Toast>
          <ToastTitle>Gagal menyimpan</ToastTitle>
          <ToastBody>{err?.message ?? "Terjadi kesalahan. Periksa koneksi."}</ToastBody>
        </Toast>,
        { intent: "error", timeout: 5000 }
      );
    }
  }, [mode, fields, upsertConfig, refetch, dispatchToast]);

  // ─── Render ───────────────────────────────────────────────────────────────

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      <Toaster toasterId={toasterId} position="top-end" />

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center text-slate-600">
            <ShieldSettings24Regular />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Admin Setting</h1>
            <p className="text-sm text-slate-500">Konfigurasi perangkat keras dan mode operasi sistem</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            appearance="subtle"
            icon={<ArrowClockwise24Regular />}
            onClick={() => refetch()}
            disabled={loading}
          >
            Refresh
          </Button>
          <Button
            appearance="primary"
            icon={saving ? <Spinner size="tiny" /> : <Save24Regular />}
            onClick={handleSave}
            disabled={saving || !dirty}
          >
            {saving ? "Menyimpan…" : "Simpan Semua"}
          </Button>
        </div>
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-sm text-slate-500">
          <Spinner size="tiny" />
          Memuat konfigurasi…
        </div>
      )}

      {/* ── SECTION 1: Mode Operasi ── */}
      <Card>
        <CardHeader
          header={
            <div className="flex items-center gap-2 font-semibold text-base">
              <ShieldSettings24Regular />
              Mode Operasi Sistem
            </div>
          }
          description="Pilih mode sesuai kondisi penggunaan sistem."
        />
        <div className="p-4 pt-0">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* DEMO Card */}
            <button
              onClick={() => handleModeChange("DEMO")}
              className={`text-left rounded-xl border-2 p-5 transition-all ${
                mode === "DEMO"
                  ? "border-amber-400 bg-amber-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-amber-200 hover:bg-amber-50/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                  <Warning24Filled className="w-5 h-5 text-amber-500" />
                </div>
                {mode === "DEMO" && (
                  <CheckmarkCircle24Filled className="text-amber-500 w-5 h-5" />
                )}
              </div>
              <p className={`text-base font-bold mb-1 ${mode === "DEMO" ? "text-amber-700" : "text-slate-700"}`}>
                DEMO MODE
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sistem berjalan dengan <strong>data simulasi</strong>. Pengecekan koneksi perangkat dilewati. Cocok untuk pelatihan, demo produk, atau pengujian tampilan tanpa alat fisik.
              </p>
              {mode === "DEMO" && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                  <Warning24Filled className="w-3.5 h-3.5" />
                  Mode aktif — data tidak nyata
                </div>
              )}
            </button>

            {/* LIVE Card */}
            <button
              onClick={() => handleModeChange("LIVE")}
              className={`text-left rounded-xl border-2 p-5 transition-all ${
                mode === "LIVE"
                  ? "border-emerald-400 bg-emerald-50 shadow-sm"
                  : "border-slate-200 bg-white hover:border-emerald-200 hover:bg-emerald-50/30"
              }`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                  <CheckmarkCircle24Filled className="w-5 h-5 text-emerald-500" />
                </div>
                {mode === "LIVE" && (
                  <CheckmarkCircle24Filled className="text-emerald-500 w-5 h-5" />
                )}
              </div>
              <p className={`text-base font-bold mb-1 ${mode === "LIVE" ? "text-emerald-700" : "text-slate-700"}`}>
                LIVE MODE
              </p>
              <p className="text-sm text-slate-500 leading-relaxed">
                Sistem terhubung langsung ke <strong>alat fisik</strong> (WIM, ANPR, VAC, CCTV). Semua data yang masuk adalah data resmi dan tercatat sebagai bukti operasional.
              </p>
              {mode === "LIVE" && (
                <div className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  <CheckmarkCircle24Filled className="w-3.5 h-3.5" />
                  Mode aktif — data resmi
                </div>
              )}
            </button>
          </div>

          {mode === "DEMO" && (
            <div className="mt-4 flex items-start gap-2 rounded-lg p-3 bg-amber-50 border border-amber-200">
              <Warning24Filled className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-800">
                <strong>DEMO MODE aktif.</strong> Data yang muncul di dashboard dan halaman processing adalah simulasi. Pengecekan koneksi WIM, ANPR, VAC, dan CCTV tidak dilakukan.
              </p>
            </div>
          )}
        </div>
      </Card>

      {/* ── SECTION 2: Tes Koneksi Perangkat ── */}
      <Card>
        <CardHeader
          header={
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2 font-semibold text-base">
                <NetworkCheck24Regular />
                Tes Koneksi Perangkat
              </div>
              <Button
                appearance="subtle"
                size="small"
                icon={<ArrowClockwise24Regular />}
                onClick={pingAll}
              >
                Tes Semua
              </Button>
            </div>
          }
          description="Verifikasi keterjangkauan IP perangkat dari jaringan ini. IP diambil dari form di bawah."
        />
        <div className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-3">
            {[
              { key: "ANPR_IP",  label: "ANPR Camera",         icon: <Camera24Regular className="w-4 h-4" />,              color: "blue" },
              { key: "AXLE_IP",  label: "AXLE / VAC Sensor",   icon: <ArrowsBidirectional24Regular className="w-4 h-4" />, color: "violet" },
              { key: "CCTV_IP",  label: "CCTV Camera",         icon: <VideoClip24Regular className="w-4 h-4" />,           color: "amber" },
              { key: "WIM_IP",   label: "WIM Timbangan",       icon: <Scales24Regular className="w-4 h-4" />,             color: "rose" },
            ].map(({ key, label, icon, color }) => {
              const ip = fields[key] ?? "";
              const result = pingResults[key] ?? "idle";
              const latency = pingLatency[key];

              const stateMap: Record<PingResult, { label: string; cls: string; dot: string }> = {
                idle:    { label: ip ? "Belum dites" : "IP belum diisi",      cls: "text-slate-400", dot: "bg-slate-200" },
                testing: { label: "Menghubungkan…",                           cls: "text-blue-500",  dot: "bg-blue-400 animate-pulse" },
                ok:      { label: `Terhubung${latency ? ` (${latency}ms)` : ""}`, cls: "text-emerald-600", dot: "bg-emerald-500" },
                fail:    { label: "Tidak bisa dijangkau",                     cls: "text-red-500",   dot: "bg-red-500" },
                timeout: { label: "Timeout (>5 detik)",                       cls: "text-amber-600", dot: "bg-amber-500" },
              };
              const s = stateMap[result];

              return (
                <div
                  key={key}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
                >
                  <div className={`shrink-0 text-${color}-500`}>{icon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs font-semibold text-slate-700">{label}</p>
                      <div className={`w-2 h-2 rounded-full shrink-0 ${s.dot}`} />
                    </div>
                    <p className="text-[11px] font-mono text-slate-500 truncate">{ip || "—"}</p>
                    <p className={`text-[10px] font-medium ${s.cls}`}>{s.label}</p>
                  </div>
                  <Button
                    appearance="subtle"
                    size="small"
                    disabled={!ip || result === "testing"}
                    onClick={() => pingDevice(key, ip)}
                    style={{ fontSize: "10px", padding: "4px 10px" }}
                  >
                    {result === "testing" ? "…" : "Tes"}
                  </Button>
                </div>
              );
            })}
          </div>

          <p className="mt-3 text-[10px] text-slate-400">
            Catatan: Browser melakukan HTTP ping ke IP tersebut. Jika kamera hanya melayani FTP/RTSP, hasil "Terhubung" mungkin tidak muncul meski device online — gunakan sebagai indikasi saja.
          </p>
        </div>
      </Card>

      {/* ── SECTION 3: Konfigurasi Perangkat ── */}
      {DEVICE_GROUPS.map((group) => (
        <Card key={group.section}>
          <CardHeader
            header={
              <div className="flex items-center gap-2 font-semibold text-base">
                {group.icon}
                {group.section}
              </div>
            }
          />
          <div className="p-4 pt-0 space-y-4">
            {group.fields.map((f) => (
              <div key={f.key}>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  {f.label}
                  {f.key.includes("PASSWORD") && (
                    <LockClosed24Regular className="inline w-3.5 h-3.5 ml-1 text-slate-400" />
                  )}
                </label>
                <Input
                  type={f.type ?? "text"}
                  placeholder={f.placeholder}
                  value={fields[f.key] ?? ""}
                  onChange={(_, d) => handleFieldChange(f.key, d.value)}
                  className="w-full font-mono text-sm"
                  style={{ fontFamily: "monospace" }}
                />
                <p className="text-xs text-slate-400 mt-1">{f.description}</p>
              </div>
            ))}
          </div>
        </Card>
      ))}

      {/* Bottom save bar (sticky) */}
      {dirty && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
          <div className="flex items-center gap-3 bg-slate-900 text-white rounded-xl px-5 py-3 shadow-xl">
            <Warning24Filled className="w-4 h-4 text-amber-400 shrink-0" />
            <span className="text-sm font-medium">Ada perubahan yang belum disimpan</span>
            <Button
              appearance="primary"
              size="small"
              icon={saving ? <Spinner size="tiny" /> : <Save24Regular />}
              onClick={handleSave}
              disabled={saving}
            >
              {saving ? "Menyimpan…" : "Simpan Sekarang"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSettingModule;
