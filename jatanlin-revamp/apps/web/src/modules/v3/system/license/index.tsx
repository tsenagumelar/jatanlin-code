"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowSync24Regular,
  CheckmarkCircle24Filled,
  Copy24Regular,
  Delete24Regular,
  DismissCircle24Filled,
  DocumentArrowUp20Regular,
  Info24Regular,
  ShieldCheckmark24Regular,
  ShieldDismiss24Regular,
  UsbPlug24Regular,
  Warning24Filled,
  Warning24Regular,
} from "@fluentui/react-icons";

type LicenseStatus = "active" | "missing" | "expired" | "invalid" | "invalid_site" | "invalid_device";
type ToastType = "success" | "error" | "info";

interface VeamLicense {
  version: string;
  license_id: string;
  site_id: string;
  issued_to: string;
  issued_by: string;
  issued_at: string;
  expires_at: string;
  modules: string[];
  max_devices: number;
  hardware_id?: string;
}

interface LicenseResult {
  status: LicenseStatus;
  valid: boolean;
  message: string;
  license?: VeamLicense;
  source?: string;
  checked_at: string;
}

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";

function statusBadgeConfig(status: LicenseStatus) {
  switch (status) {
    case "active":
      return {
        label: "AKTIF",
        icon: <CheckmarkCircle24Filled />,
        className: "bg-green-50 border-green-200 text-green-700",
      };
    case "expired":
      return {
        label: "KADALUARSA",
        icon: <DismissCircle24Filled />,
        className: "bg-red-50 border-red-200 text-red-700",
      };
    case "invalid_site":
      return {
        label: "SITE TIDAK COCOK",
        icon: <Warning24Filled />,
        className: "bg-amber-50 border-amber-200 text-amber-700",
      };
    case "invalid_device":
      return {
        label: "DEVICE TIDAK COCOK",
        icon: <Warning24Filled />,
        className: "bg-amber-50 border-amber-200 text-amber-700",
      };
    case "invalid":
      return {
        label: "FILE RUSAK/PALSU",
        icon: <DismissCircle24Filled />,
        className: "bg-red-50 border-red-200 text-red-700",
      };
    default:
      return {
        label: "BELUM AKTIF",
        icon: <ShieldDismiss24Regular />,
        className: "bg-slate-50 border-slate-200 text-slate-500",
      };
  }
}

function StatusBadge({ status }: { status: LicenseStatus }) {
  const config = statusBadgeConfig(status);

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${config.className}`}>
      <span className="flex h-4 w-4 items-center justify-center">{config.icon}</span>
      {config.label}
    </span>
  );
}

function formatDate(value?: string) {
  if (!value) return "-";
  return new Date(`${value}T00:00:00`).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function daysUntilExpiry(value?: string) {
  if (!value) return 0;
  const expiry = new Date(`${value}T23:59:59`);
  return Math.ceil((expiry.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
}

function DetailRow({
  label,
  value,
  mono,
  highlight = "none",
  onCopy,
}: {
  label: string;
  value: string;
  mono?: boolean;
  highlight?: "none" | "red" | "amber";
  onCopy?: (value: string) => void;
}) {
  const color =
    highlight === "red"
      ? "text-red-700"
      : highlight === "amber"
        ? "text-amber-700"
        : "text-slate-800";

  return (
    <div className="flex min-w-0 items-start justify-between gap-3">
      <span className="shrink-0 text-slate-500">{label}</span>
      <span className={`min-w-0 text-right text-sm font-semibold ${color} ${mono ? "font-mono text-xs" : ""}`}>
        <span className="break-words">{value || "-"}</span>
        {onCopy && value && value !== "-" && (
          <button
            type="button"
            onClick={() => onCopy(value)}
            className="ml-1 inline-flex h-5 w-5 items-center justify-center rounded text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label={`Copy ${label}`}
          >
            <Copy24Regular className="h-3.5 w-3.5" />
          </button>
        )}
      </span>
    </div>
  );
}

export function V3LicenseModule() {
  const [result, setResult] = useState<LicenseResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [toast, setToast] = useState<{ msg: string; type: ToastType } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const showToast = useCallback((msg: string, type: ToastType) => {
    setToast({ msg, type });
    window.setTimeout(() => setToast(null), 4000);
  }, []);

  const loadStatus = useCallback(async (silent = false) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/veam/status`, { cache: "no-store" });
      const data = (await res.json()) as LicenseResult;
      setResult(data);
      if (!silent) showToast(data.message, data.valid ? "success" : "info");
    } catch {
      setResult({
        status: "invalid",
        valid: false,
        message: "Backend API tidak tersedia",
        checked_at: new Date().toISOString(),
      });
      if (!silent) showToast("Backend API tidak tersedia", "error");
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadStatus(true);
  }, [loadStatus]);

  const activateContent = async (content: string, source: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/veam/activate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, source }),
      });
      const data = (await res.json()) as LicenseResult;
      setResult(data);
      showToast(data.message, data.valid ? "success" : "error");
    } catch {
      showToast("Gagal mengaktifkan lisensi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const processFile = async (file?: File) => {
    if (!file) return;
    if (!file.name.endsWith(".veam") && !file.name.endsWith(".json")) {
      showToast("Format file tidak valid. Gunakan file .veam atau .json", "error");
      return;
    }

    const content = await file.text();
    await activateContent(content, file.name);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleScanUsb = async () => {
    setScanning(true);
    try {
      const res = await fetch(`${apiUrl}/veam/activate-usb`, { method: "POST" });
      const data = (await res.json()) as LicenseResult;
      setResult(data);
      showToast(data.message, data.valid ? "success" : "error");
    } catch {
      showToast("Backend API tidak tersedia. Gunakan upload manual.", "info");
    } finally {
      setScanning(false);
    }
  };

  const handleRevoke = async () => {
    if (!window.confirm("Hapus lisensi yang tersimpan? Sistem akan menjadi tidak aktif.")) return;

    setIsLoading(true);
    try {
      const res = await fetch(`${apiUrl}/veam/license`, { method: "DELETE" });
      const data = (await res.json()) as LicenseResult;
      setResult(data);
      showToast(data.message, "info");
    } catch {
      showToast("Gagal menghapus lisensi.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (value: string) => {
    navigator.clipboard.writeText(value);
    showToast("Disalin ke clipboard", "info");
  };

  const license = result?.license;
  const status = result?.status ?? "missing";
  const daysLeft = daysUntilExpiry(license?.expires_at);
  const loadedAt = result?.checked_at ? new Date(result.checked_at).toLocaleString("id-ID") : "-";
  const cardClass =
    status === "active"
      ? "border-green-200 bg-green-50/50"
      : status === "expired" || status === "invalid"
        ? "border-red-200 bg-red-50/50"
        : "border-amber-200 bg-amber-50/50";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {toast && (
        <div
          className={`fixed right-4 top-4 z-50 flex items-center gap-2 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-lg ${
            toast.type === "success" ? "bg-green-600" : toast.type === "error" ? "bg-red-600" : "bg-slate-700"
          }`}
        >
          {toast.msg}
        </div>
      )}

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
            <ShieldCheckmark24Regular />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">VEAM License</h1>
            <p className="text-xs text-slate-500">Vehicle Enforcement Activation Module</p>
          </div>
        </div>
        <StatusBadge status={status} />
      </div>

      {license && status !== "missing" && (
        <div className={`space-y-4 rounded-2xl border-2 p-5 ${cardClass}`}>
          {status === "active" && daysLeft <= 30 && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700">
              <Warning24Regular className="h-4 w-4 shrink-0" />
              Lisensi akan kadaluarsa dalam <strong>{daysLeft} hari</strong>. Segera perbarui.
            </div>
          )}
          {status === "expired" && (
            <div className="flex items-center gap-2 rounded-lg bg-red-100 px-3 py-2 text-sm font-medium text-red-700">
              <DismissCircle24Filled className="h-4 w-4 shrink-0" />
              Lisensi kadaluarsa pada {formatDate(license.expires_at)}. Sistem tidak aktif.
            </div>
          )}
          {(status === "invalid_site" || status === "invalid_device") && (
            <div className="flex items-center gap-2 rounded-lg bg-amber-100 px-3 py-2 text-sm font-medium text-amber-700">
              <Warning24Filled className="h-4 w-4 shrink-0" />
              {result?.message ?? "Lisensi tidak cocok dengan konfigurasi sistem."}
            </div>
          )}

          <div className="grid gap-x-8 gap-y-3 text-sm md:grid-cols-2">
            <DetailRow label="License ID" value={license.license_id} onCopy={handleCopy} />
            <DetailRow label="Diterbitkan untuk" value={license.issued_to} />
            <DetailRow label="Diterbitkan oleh" value={license.issued_by} />
            <DetailRow label="Tanggal Terbit" value={formatDate(license.issued_at)} />
            <DetailRow
              label="Tanggal Kadaluarsa"
              value={`${formatDate(license.expires_at)} ${status === "active" ? `(${daysLeft} hari lagi)` : ""}`}
              highlight={status === "expired" ? "red" : daysLeft <= 30 ? "amber" : "none"}
            />
            <DetailRow label="Max Perangkat" value={`${license.max_devices} unit`} />
            <DetailRow label="Site ID" value={license.site_id} onCopy={handleCopy} mono />
            <DetailRow label="Modul Aktif" value={license.modules.join(", ")} />
            {license.hardware_id && <DetailRow label="Hardware ID" value={license.hardware_id} mono />}
            <DetailRow label="Dimuat pada" value={loadedAt} />
          </div>

          <div className="flex justify-end border-t border-slate-200/60 pt-3">
            <button
              type="button"
              onClick={handleRevoke}
              className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-700"
            >
              <Delete24Regular className="h-3.5 w-3.5" />
              Hapus Lisensi
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-700">
            {status === "missing" ? "Muat File Lisensi" : "Perbarui Lisensi"}
          </h2>
          <button
            type="button"
            onClick={() => loadStatus()}
            className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 hover:text-slate-800"
          >
            <ArrowSync24Regular className="h-3.5 w-3.5" />
            Refresh
          </button>
        </div>

        <div
          onDragOver={(event) => {
            event.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(event) => {
            event.preventDefault();
            setDragOver(false);
            processFile(event.dataTransfer.files?.[0]);
          }}
          onClick={() => fileInputRef.current?.click()}
          className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all ${
            dragOver ? "border-blue-400 bg-blue-50" : "border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50/30"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".veam,.json"
            onChange={(event) => processFile(event.target.files?.[0])}
            className="hidden"
          />

          {isLoading ? (
            <div className="flex flex-col items-center gap-2 text-blue-600">
              <ArrowSync24Regular className="h-8 w-8 animate-spin" />
              <p className="text-sm font-medium">Memvalidasi lisensi...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3 text-slate-400">
              <DocumentArrowUp20Regular className="h-10 w-10" />
              <div>
                <p className="text-sm font-semibold text-slate-600">Klik atau seret file lisensi ke sini</p>
                <p className="mt-1 text-xs">
                  Format yang didukung: <code className="rounded bg-slate-200 px-1">.veam</code> atau{" "}
                  <code className="rounded bg-slate-200 px-1">.json</code>
                </p>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="flex-1 border-t border-slate-200" />
          <span className="text-xs font-medium text-slate-400">atau</span>
          <div className="flex-1 border-t border-slate-200" />
        </div>

        <button
          type="button"
          onClick={handleScanUsb}
          disabled={scanning}
          className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-600 transition-all hover:border-blue-300 hover:bg-blue-50/30 hover:text-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {scanning ? <ArrowSync24Regular className="h-5 w-5 animate-spin" /> : <UsbPlug24Regular className="h-5 w-5" />}
          {scanning ? "Memindai USB Drive..." : "Scan Otomatis USB Drive"}
        </button>
      </div>

      <div className="space-y-2 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-blue-700">
          <Info24Regular className="h-4 w-4" />
          Informasi Sistem
        </div>
        <div className="grid gap-x-8 gap-y-1.5 text-xs text-slate-600 md:grid-cols-2">
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Site ID Sistem</span>
            <span className="max-w-[220px] truncate font-mono text-xs" title={process.env.NEXT_PUBLIC_SITE_ID ?? "-"}>
              {process.env.NEXT_PUBLIC_SITE_ID ?? "-"}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Versi VEAM</span>
            <span className="font-semibold">2.0.0</span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">API Backend</span>
            <span className="max-w-[220px] truncate font-mono text-xs" title={apiUrl}>
              {apiUrl}
            </span>
          </div>
          <div className="flex justify-between gap-3">
            <span className="text-slate-500">Status License</span>
            <StatusBadge status={status} />
          </div>
        </div>
      </div>
    </div>
  );
}
